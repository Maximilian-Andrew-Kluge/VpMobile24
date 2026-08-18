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

# Configuration key for the download server
CONF_SERVER = "server"

# Available download servers (value = base URL)
DOWNLOAD_SERVERS: dict[str, str] = {
    "www": "https://www.stundenplan24.de",
    "zusatz1":  "https://z1.stundenplan24.de/schulen",
    "zusatz2":  "https://z2.stundenplan24.de/schulen",
    "zusatz3":  "https://z3.stundenplan24.de/schulen",
    "zusatz4":  "https://z4.stundenplan24.de/schulen",
    "zusatz5":  "https://z5.stundenplan24.de/schulen",
    "zusatz6":  "https://z6.stundenplan24.de/schulen",
    "zusatz7":  "https://z7.stundenplan24.de/schulen",
    "zusatz8":  "https://z8.stundenplan24.de/schulen",
    "zusatz9":  "https://z9.stundenplan24.de/schulen",
    "zusatz10": "https://z10.stundenplan24.de/schulen",
}

# German federal states for holiday lookup (ferien-api.de state codes)
GERMAN_STATES = {
    "BW": "Baden-Württemberg",
    "BY": "Bayern",
    "BE": "Berlin",
    "BB": "Brandenburg",
    "HB": "Bremen",
    "HH": "Hamburg",
    "HE": "Hessen",
    "MV": "Mecklenburg-Vorpommern",
    "NI": "Niedersachsen",
    "NW": "Nordrhein-Westfalen",
    "RP": "Rheinland-Pfalz",
    "SL": "Saarland",
    "SN": "Sachsen",
    "ST": "Sachsen-Anhalt",
    "SH": "Schleswig-Holstein",
    "TH": "Thüringen",
}