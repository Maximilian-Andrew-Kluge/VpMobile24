"""Constants for the vpmobile24 integration."""

DOMAIN = "vpmobile24"

# Configuration keys
CONF_SCHOOL_ID = "school_id"
CONF_USERNAME = "username"
CONF_PASSWORD = "password"
CONF_CLASS_NAME = "class_name"
CONF_EXCLUDED_SUBJECTS = "excluded_subjects"
CONF_SELECTED_COURSES = "selected_courses"  # whitelist of Ku2 course groups
CONF_STATE_CODE = "state_code"              # German federal state code (e.g. DE-BY)
CONF_CUSTOM_HOLIDAYS = "custom_holidays"    # list of {name, start, end} dicts

# Default values
DEFAULT_UPDATE_INTERVAL = 15  # minutes
DEFAULT_NAME = "VpMobile24"
DEFAULT_BASE_URL = "https://www.stundenplan24.de"

# German federal states for holiday lookup
GERMAN_STATES = {
    "DE-BW": "Baden-Württemberg",
    "DE-BY": "Bayern",
    "DE-BE": "Berlin",
    "DE-BB": "Brandenburg",
    "DE-HB": "Bremen",
    "DE-HH": "Hamburg",
    "DE-HE": "Hessen",
    "DE-MV": "Mecklenburg-Vorpommern",
    "DE-NI": "Niedersachsen",
    "DE-NW": "Nordrhein-Westfalen",
    "DE-RP": "Rheinland-Pfalz",
    "DE-SL": "Saarland",
    "DE-SN": "Sachsen",
    "DE-ST": "Sachsen-Anhalt",
    "DE-SH": "Schleswig-Holstein",
    "DE-TH": "Thüringen",
}