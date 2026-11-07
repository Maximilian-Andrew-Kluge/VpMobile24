"""Behavior tests for notifications, setup probes and privacy boundaries."""
import ast
import asyncio
from copy import deepcopy
from datetime import date, timedelta
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, AsyncMock
import sys

from test_reliability import environment, load_definitions, NOW

ROOT = Path(__file__).resolve().parents[1] / 'custom_components/vpmobile24'
sys.path.insert(0, str(ROOT))
from changes import snapshot, compare_day

DAY = '2026-11-09'
LESSON = dict(period='1', subject='MA', room='201', teacher='AB', **{'class': '5a'})


def compare(**updates):
    return compare_day(snapshot([LESSON]), snapshot([{**LESSON, **updates}]), DAY)


def test_unchanged_and_reordered():
    assert compare() == []
    assert compare_day(snapshot([LESSON, {**LESSON, 'period': '2'}]),
                       snapshot([{**LESSON, 'period': '2'}, LESSON]), DAY) == []


def test_room_change_and_messages():
    change, = compare(room='105')
    assert change['kind'] == 'room'
    assert '201 → 105' in change['message_de']
    assert 'Room' in change['message_en']
    assert change['before']['room'] == '201'


def test_cancel_and_restore():
    assert compare(subject='—')[0]['kind'] == 'cancelled'
    result = compare_day(snapshot([{**LESSON, 'subject': '—'}]), snapshot([LESSON]), DAY)
    assert result[0]['kind'] == 'restored'


def test_no_false_cancellation_for_supervision():
    assert compare(subject='', is_supervision=True)[0]['kind'] == 'updated'


def test_missing_and_ambiguous_are_not_guessed():
    assert compare_day(snapshot([LESSON]), {}, DAY) == []
    assert compare_day({}, snapshot([LESSON]), DAY) == []
    assert compare_day(snapshot([LESSON, LESSON]), snapshot([{**LESSON, 'room': '105'}]), DAY) == []


def coordinator(enabled=True):
    ns = environment()
    ns.update(snapshot=snapshot, compare_day=compare_day)
    entry = SimpleNamespace(options={'enable_change_events': enabled}, data={}, entry_id='entry')
    bus = SimpleNamespace(async_fire=Mock())
    hass = SimpleNamespace(config_entries=SimpleNamespace(async_get_entry=lambda _: entry), bus=bus)
    c = ns['VpMobile24DataUpdateCoordinator'](hass, SimpleNamespace(), entry_id='entry')
    c._week_data_cache = {DAY: {'lessons': [deepcopy(LESSON)]}}
    return c, entry, bus


def test_baseline_once_then_deduplicate():
    c, _, bus = coordinator()
    c._publish_changes(DAY)
    bus.async_fire.assert_not_called()
    c._week_data_cache[DAY]['lessons'][0]['room'] = '105'
    c._publish_changes(DAY)
    c._publish_changes(DAY)
    bus.async_fire.assert_called_once()
    assert bus.async_fire.call_args.args[1]['kind'] == 'room'


def test_failed_day_retains_baseline_until_recovery():
    c, _, bus = coordinator()
    c._publish_changes(DAY)
    c.failed_dates = [DAY]
    c._week_data_cache[DAY]['lessons'][0]['room'] = '105'
    c._publish_changes(DAY)
    bus.async_fire.assert_not_called()
    c.failed_dates = []
    c._publish_changes(DAY)
    bus.async_fire.assert_called_once()


def test_withdrawn_and_republished_day_stays_silent():
    c, _, bus = coordinator()
    c._publish_changes(DAY)
    c._week_data_cache = {}
    c._publish_changes(DAY)
    c._week_data_cache = {DAY: {'lessons': [{**LESSON, 'room': '105'}]}}
    c._publish_changes(DAY)
    bus.async_fire.assert_not_called()


def test_disabled_and_demo_emit_nothing():
    for enabled, demo in [(False, False), (True, True)]:
        c, _, bus = coordinator(enabled)
        c.is_demo = demo
        c._publish_changes(DAY)
        c._week_data_cache[DAY]['lessons'][0]['room'] = '105'
        c._publish_changes(DAY)
        bus.async_fire.assert_not_called()


def test_excluded_subject_does_not_emit():
    c, _, bus = coordinator()
    c.excluded_subjects = ['MA']
    c._publish_changes(DAY)
    c._week_data_cache[DAY]['lessons'][0]['room'] = '105'
    c._publish_changes(DAY)
    bus.async_fire.assert_not_called()


def test_future_day_compared_across_week_boundary():
    c, _, bus = coordinator()
    c._week_data_cache = {'2026-11-16': {'lessons': [deepcopy(LESSON)]}}
    c._publish_changes(DAY)
    c._week_data_cache['2026-11-16']['lessons'][0]['room'] = '105'
    c._publish_changes('2026-11-16')
    bus.async_fire.assert_called_once()


def test_diagnostics_allowlist_excludes_personal_fields():
    ns = load_definitions('diagnostics.py', {'DOMAIN': 'vpmobile24', 'VERSION': 'test'})
    c, entry, _ = coordinator()
    c.last_successful_update = NOW
    entry.data = {'password': 'secret', 'school_id': '12345678', 'username': 'someone'}
    result = asyncio.run(ns['async_get_config_entry_diagnostics'](SimpleNamespace(data={'vpmobile24': {'entry': c}}), entry))
    assert result['cached_day_count'] == 1
    assert result['last_successful_update'] == NOW.isoformat()
    assert not any(secret in str(result) for secret in ['secret', '12345678', 'someone', '201', '5a'])
    assert set(result) == {'version', 'loaded', 'demo', 'mode', 'last_update_success', 'last_successful_update', 'failed_day_count', 'cached_day_count', 'holiday_count', 'change_events_enabled'}


def preview_method():
    tree = ast.parse((ROOT / 'config_flow.py').read_text())
    method = next(n for cls in tree.body if isinstance(cls, ast.ClassDef) for n in cls.body
                  if isinstance(n, ast.AsyncFunctionDef) and n.name == 'async_step_preview')
    class AuthError(Exception): pass
    class NotFound(Exception): pass
    ns = dict(date=date, timedelta=timedelta, CONF_CLASS_NAME='class_name', CONF_TEACHER_SHORT='teacher_short',
              Stundenplan24AuthError=AuthError, Stundenplan24NotFoundError=NotFound,
              vol=SimpleNamespace(Schema=lambda x:x, Optional=lambda x, **k:x))
    exec(compile(ast.fix_missing_locations(ast.Module(body=[method], type_ignores=[])), '<preview>', 'exec'), ns)
    return ns


def test_setup_probe_distinguishes_empty_missing_auth_and_connection():
    ns = preview_method()
    for response, expected in [({}, 'keine passenden'), (ns['Stundenplan24NotFoundError'](), 'veröffentlicht'),
                               (ns['Stundenplan24AuthError'](), 'Anmeldung'), (TimeoutError(), 'fehlgeschlagen'),
                               ({'lessons': [LESSON]}, 'gefunden')]:
        api = SimpleNamespace(async_get_schedule=AsyncMock())
        if isinstance(response, Exception): api.async_get_schedule.side_effect = response
        else: api.async_get_schedule.return_value = response
        flow = SimpleNamespace(_api=api, _config_data={'class_name':'5a'},
                               hass=SimpleNamespace(config=SimpleNamespace(language='de')),
                               async_show_form=lambda **kw:kw)
        result = asyncio.run(ns['async_step_preview'](flow))
        assert expected in result['description_placeholders']['status']
        assert api.async_get_schedule.await_count <= 7


def test_marker_only_updates_do_not_notify():
    assert compare(is_change=True) == []


def test_blueprint_quiet_hours_including_midnight():
    import yaml
    from jinja2 import Environment
    class Loader(yaml.SafeLoader): pass
    Loader.add_constructor('!input', lambda loader, node: loader.construct_scalar(node))
    doc = yaml.load((ROOT.parents[1] / 'blueprints/automation/vpmobile24_changes.yaml').read_text(), Loader=Loader)
    template = Environment().from_string(doc['conditions'][2]['value_template'])
    for start, end, hour, permitted in [('22:00:00','06:00:00','23:00:00',False),
                                       ('22:00:00','06:00:00','05:59:59',False),
                                       ('22:00:00','06:00:00','06:00:00',True),
                                       ('22:00:00','06:00:00','22:00:00',False),
                                       ('09:00:00','12:00:00','10:00:00',False),
                                       ('09:00:00','12:00:00','13:00:00',True),
                                       ('00:00:00','00:00:00','10:00:00',True)]:
        output = template.render(quiet_start=start, quiet_end=end, now=lambda:SimpleNamespace(strftime=lambda _:hour))
        assert (output.strip().lower()=='true') == permitted
