from homeassistant.components.diagnostics import async_redact_data

TO_REDACT = {"password", "token"}

async def async_get_config_entry_diagnostics(hass, config_entry):
    return async_redact_data(
        {
            "entry": config_entry.as_dict(),
        },
        TO_REDACT,
    )