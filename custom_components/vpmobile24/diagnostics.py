"""Technical diagnostics using an explicit allowlist, never configuration dumps."""
from .const import DOMAIN, VERSION


async def async_get_config_entry_diagnostics(hass, config_entry):
    coordinator = hass.data.get(DOMAIN, {}).get(config_entry.entry_id)
    result = {"version": VERSION, "loaded": coordinator is not None}
    if coordinator is None:
        return result
    last = coordinator.last_successful_update
    result.update({
        "demo": bool(coordinator.is_demo),
        "mode": "teacher" if coordinator.teacher_short else "student",
        "last_update_success": bool(coordinator.last_update_success),
        "last_successful_update": last.isoformat() if last else None,
        "failed_day_count": len(coordinator.failed_dates),
        "cached_day_count": len(coordinator._week_data_cache),
        "holiday_count": len(coordinator._holiday_data),
        "change_events_enabled": bool(config_entry.options.get("enable_change_events", False)),
    })
    return result
