"""Behavioral regression tests with lightweight HA/network doubles.

Load production definitions without importing HA's application bootstrap. These
checks execute real coordinator, API and entity methods, not copied algorithms.
Run with pytest or `python -m unittest discover -s tests -p test_reliability.py`.
"""
import ast
import asyncio
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
import logging
from pathlib import Path
from types import SimpleNamespace
import sys
import unittest
from unittest.mock import AsyncMock, patch

ROOT = Path(__file__).resolve().parents[1] / 'custom_components' / 'vpmobile24'
NOW = datetime(2026, 11, 9, 9, 0, tzinfo=timezone.utc)
DT = SimpleNamespace(now=lambda: NOW, utcnow=lambda: NOW,
                     as_local=lambda value: value,
                     get_default_time_zone=lambda: timezone.utc)

class Coordinator:
    def __init__(self, hass, *args, **kwargs):
        self.hass = hass
        self.last_update_success = True

class Entity:
    def __init__(self, coordinator):
        self.coordinator = coordinator

class Sensor: pass
class Calendar: pass
class UpdateFailed(Exception): pass
class AuthFailed(Exception): pass

@dataclass
class Event:
    start: datetime
    end: datetime
    summary: str
    description: str = ''
    location: str = ''

    @property
    def start_datetime_local(self): return self.start
    @property
    def end_datetime_local(self): return self.end


def load_definitions(filename, namespace):
    """Use the real definitions, with explicit substitutes for platform imports."""
    tree = ast.parse((ROOT / filename).read_text())
    nodes = [n for n in tree.body if isinstance(n, (ast.ClassDef, ast.FunctionDef,
              ast.AsyncFunctionDef, ast.Assign, ast.AnnAssign))]
    # Module constants such as Platform lists require application imports and
    # are irrelevant here; only load named constants used by tested methods.
    constants = {'_LOGGER', '_KMK_HOLIDAYS', 'CALENDAR_NAMES'}
    nodes = [n for n in nodes if not isinstance(n, (ast.Assign, ast.AnnAssign))
             or any(isinstance(t, ast.Name) and t.id in constants
                    for t in (n.targets if isinstance(n, ast.Assign) else [n.target]))]
    future = ast.ImportFrom(module='__future__', names=[ast.alias(name='annotations')], level=0)
    module = ast.fix_missing_locations(ast.Module(body=[future] + nodes, type_ignores=[]))
    exec(compile(module, str(ROOT / filename), 'exec'), namespace)
    return namespace


def environment():
    ns = dict(logging=logging, datetime=datetime, date=date, timedelta=timedelta,
              dt_util=DT, asyncio=asyncio, DOMAIN='vpmobile24',
              DataUpdateCoordinator=Coordinator, CoordinatorEntity=Entity,
              SensorEntity=Sensor, CalendarEntity=Calendar, CalendarEvent=Event,
              UpdateFailed=UpdateFailed, ConfigEntryAuthFailed=AuthFailed)
    load_definitions('api_new.py', ns)
    load_definitions('__init__.py', ns)
    load_definitions('calendar.py', ns)
    load_definitions('sensor.py', ns)
    return ns


class Response:
    def __init__(self, status=200, data=None):
        self.status, self.data = status, data
    async def __aenter__(self): return self
    async def __aexit__(self, *args): pass
    async def json(self): return self.data

class Session:
    def __init__(self, responses): self.responses = iter(responses); self.calls = 0
    async def __aenter__(self): return self
    async def __aexit__(self, *args): pass
    def get(self, *args, **kwargs):
        self.calls += 1
        return next(self.responses)


class ReliabilityTests(unittest.TestCase):
    def setUp(self):
        self.ns = environment()
        self.entry = SimpleNamespace(options={'state_code': 'SN'}, data={}, entry_id='test')
        hass = SimpleNamespace(config_entries=SimpleNamespace(async_get_entry=lambda _: self.entry))
        self.api = SimpleNamespace(async_get_schedule=AsyncMock(return_value={}))
        self.coord = self.ns['VpMobile24DataUpdateCoordinator'](hass, self.api, entry_id='test')
        self.coord._async_update_holidays = AsyncMock()
        self.update = lambda: asyncio.run(self.coord._async_update_data())

    def test_auth_error_reaches_home_assistant(self):
        self.api.async_get_schedule.side_effect = self.ns['Stundenplan24AuthError']('401')
        with self.assertRaises(AuthFailed): self.update()
        self.assertEqual(self.api.async_get_schedule.await_count, 1)

    def test_auth_error_in_future_plan_also_propagates(self):
        async def fetch(day, *args):
            if day >= date(2026, 11, 16): raise self.ns['Stundenplan24AuthError']('403')
            return {}
        self.api.async_get_schedule.side_effect = fetch
        with self.assertRaises(AuthFailed): self.update()

    def test_server_outage_does_not_report_empty_success(self):
        self.api.async_get_schedule.side_effect = TimeoutError('offline')
        with self.assertRaises(UpdateFailed): self.update()
        self.assertIsNone(self.coord.last_successful_update)
        self.assertTrue(self.coord.failed_dates)

    def test_unpublished_plans_are_valid_empty_result(self):
        self.api.async_get_schedule.side_effect = self.ns['Stundenplan24NotFoundError']()
        self.assertEqual(self.update()['lessons'], [])
        self.assertEqual(self.coord.last_successful_update, NOW)
        self.assertEqual(self.coord.failed_dates, [])
        self.coord._async_update_holidays.assert_awaited_once()

    def test_existing_future_plan_is_refetched(self):
        self.coord._current_week_monday = '2026-11-09'
        self.coord._week_data_cache['2026-11-16'] = {'timestamp': 'old'}
        self.update()
        self.assertEqual(self.coord._week_data_cache['2026-11-16']['timestamp'], '')
        dates = [c.args[0] for c in self.api.async_get_schedule.await_args_list]
        self.assertIn(date(2026, 11, 16), dates)
        self.assertIn(date(2026, 11, 23), dates)

    def test_withdrawn_future_plan_removed(self):
        self.coord._current_week_monday = '2026-11-09'
        self.coord._week_data_cache['2026-11-16'] = {'timestamp': 'old'}
        self.api.async_get_schedule.side_effect = self.ns['Stundenplan24NotFoundError']()
        self.update()
        self.assertNotIn('2026-11-16', self.coord._week_data_cache)

    def test_partial_failure_retains_day_but_marks_stale(self):
        self.coord._current_week_monday = '2026-11-09'
        self.coord._week_data_cache['2026-11-16'] = {'timestamp': 'old'}
        async def fetch(day, *args):
            if day == date(2026, 11, 16): raise TimeoutError()
            return {}
        self.api.async_get_schedule.side_effect = fetch
        self.update()
        self.assertEqual(self.coord._week_data_cache['2026-11-16']['timestamp'], 'old')
        self.assertEqual(self.coord.failed_dates, ['2026-11-16'])
        status = self.ns['VpMobile24DataStatusSensor'](self.coord, self.entry, 'de')
        self.assertEqual(status.state, 'Daten veraltet')
        self.assertTrue(status.available)

    def test_status_success_then_outage(self):
        self.update()
        status = self.ns['VpMobile24DataStatusSensor'](self.coord, self.entry, 'de')
        self.assertEqual(status.state, 'Aktuell')
        self.coord.last_update_success = False
        self.assertTrue(status.extra_state_attributes['data_stale'])
        self.assertEqual(status.extra_state_attributes['last_successful_update'], NOW.isoformat())

    def test_calendar_keeps_running_lesson(self):
        cal = self.ns['VpMobile24WeekCalendar'](self.coord, self.entry)
        running = Event(NOW - timedelta(minutes=10), NOW + timedelta(minutes=35), 'MA')
        cal._get_week_events = lambda: [running]
        self.assertIs(cal.event, running)

    def test_calendar_rejects_invalid_time_without_crash(self):
        cal = self.ns['VpMobile24WeekCalendar'](self.coord, self.entry)
        self.assertIsNone(cal._create_event_from_lesson({'subject': 'MA', 'time_start': 'invalid'}, NOW.date()))
        self.assertIsNone(cal._create_event_from_lesson({'subject': 'MA', 'time_start': '10:00', 'time_end': '09:00'}, NOW.date()))

    def test_calendar_filters_exact_time_boundaries(self):
        self.coord.data = {'week_lessons': [dict(date='2026-11-09', subject='MA',
                          time_start='08:00', time_end='09:00'),
                          dict(date='2026-11-09', subject='EN', time_start='09:00', time_end='09:45')]}
        cal = self.ns['VpMobile24WeekCalendar'](self.coord, self.entry)
        events = cal._get_events_in_range(NOW, NOW + timedelta(minutes=45))
        self.assertEqual([e.summary for e in events], ['EN'])

    def test_holiday_sensor_retains_api_data_on_repeated_reads(self):
        self.coord._holiday_data = [{'startDate': '2026-11-01', 'endDate': '2026-11-15',
                                    'name': [{'text': 'API holiday'}]}]
        sensor = self.ns['VpMobile24HolidaySensor'](self.coord, self.entry)
        self.assertEqual(sensor.state, 'API holiday')
        self.assertEqual(sensor.state, 'API holiday')
        self.assertEqual(sensor.extra_state_attributes['datenquelle'], 'API')

    def fetch_holidays(self, session):
        fake = SimpleNamespace(ClientSession=lambda: session, ClientTimeout=lambda **kw: None)
        with patch.dict(sys.modules, {'aiohttp': fake}):
            asyncio.run(self.ns['VpMobile24DataUpdateCoordinator']._async_update_holidays(self.coord))

    def test_holidays_fetched_only_once_per_day(self):
        session = Session([Response(data=[{'start': '2026-12-01', 'end': '2026-12-02', 'name': 'holiday'}]), Response(data=[])])
        self.fetch_holidays(session)
        self.fetch_holidays(session)
        self.assertEqual(session.calls, 2)
        self.assertEqual(self.coord._holiday_next_fetch, NOW + timedelta(days=1))

    def test_holiday_errors_keep_cache_and_back_off(self):
        self.coord._holiday_cache_key = ('SN', 2026)
        self.coord._holiday_data = [{'startDate': '2026-12-01', 'endDate': '2026-12-02', 'name': []}]
        session = Session([Response(429), Response(500)])
        self.fetch_holidays(session)
        self.fetch_holidays(session)
        self.assertEqual(session.calls, 2)
        self.assertEqual(len(self.coord._holiday_data), 1)
        self.assertEqual(self.coord._holiday_next_fetch, NOW + timedelta(hours=1))

    def test_holiday_state_change_invalidates_cache(self):
        self.coord._holiday_cache_key = ('BY', 2026)
        self.coord._holiday_data = [{'wrong_state': True}]
        self.coord._holiday_next_fetch = NOW + timedelta(days=1)
        self.fetch_holidays(Session([Response(data=[]), Response(data=[])]))
        self.assertEqual(self.coord._holiday_cache_key, ('SN', 2026))
        self.assertEqual(self.coord._holiday_data, [])

    def test_api_distinguishes_401_403_404_and_500(self):
        self.ns['BasicAuth'] = lambda *args: None
        self.ns['aiohttp'] = SimpleNamespace(ClientTimeout=lambda **kw: None)
        for code, exception in [(401, self.ns['Stundenplan24AuthError']),
                                (403, self.ns['Stundenplan24AuthError']),
                                (404, self.ns['Stundenplan24NotFoundError']), (500, Exception)]:
            api = self.ns['Stundenplan24API']('school', 'user', 'password')
            api.session = Session([Response(code)])
            with self.assertRaises(exception) as raised: asyncio.run(api.async_get_schedule(NOW.date()))
            self.assertIs(type(raised.exception), exception)

if __name__ == '__main__': unittest.main()
