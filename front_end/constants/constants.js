let Enum = require('enum');

export const userPermissions = "Admin-Session";


// ----------------- CONSTANT USED FOR THE TOP BAR (DROPDOWN LIST, MENU, ETC) -----------------//
export const UDNTabs = ['KPI', 'ENGINEERING', 'Traffic'];
export const engineeringTabs = [
    'PRODUCT READINESS',
    'ROADMAP',
    'RELEASE DASHBOARD',
    'STATUS',
    'CAPACITY',
    'QUALITY',
    'FST',
    'PLATFORM BOARD',
    'PROCESS'
];

/**
 * Enumeration of all the tab titles displayed in the Engineering tab.
 * @type {*|Enum}
 */
export const EngineeringTabEnum = new Enum({
    PRODUCTREADINESS: 1,
    ROADMAP:2,
    RELEASEDASHBOARD: 3,
    STATUS: 4,
    CAPACITY: 5,
    QUALITY: 6,
    FST:7,
    PLATFORMBOARD:8,
    PROCESS:9,
    ROADMAPUDNVERSION:10,
    TRENDS:11
});

export const RoadmapVersionEnum = new Enum({
    ROADMAPVERSION: 0,
    ROADMAPSPRINTPLANVERSION:-1,
    ROADMAPUDNSCOPEVERSION:1
});


export const envList = ["DEV", "TEST", "BUG"];

export const timeList = [
    {time:0, name:"Original Time Estimate"},
    {time:1, name:"Remaining Time Estimate"}
];


// ----------------- CONSTANT USED FOR STATE STORE
/**
 * Enumemaration of action types used in state Store
 * @type {{VERSION_UPDATE: string}}
 */
export const STORE_ACTION_ENUM = {
    VERSION_UPDATE: 'VERSION_UPDATE',
    ENVIRONMENT_UPDATE: 'ENVIRONMENT_UPDATE',
    TIME_UPDATE: 'TIME_UPDATE',
    MODULE_UPDATE: 'MODULE_UPDATE',
    FST_UPDATE: 'FST_UPDATE',
    QUALITY_UPDATE: 'QUALITY_UPDATE',
    BUG_STATUS_UPDATE: 'BUG_STATUS_UPDATE'
};
//-----------------//


export const qualityStatus = ["NONE", "COMMITMENT", "ROBUST", "WARNING", "OFF-TRACK"];

export const QualityStatusEnum = new Enum({
    COMMITMENT: "COMMITMENT",
    ROBUST:"ROBUST",
    WARNING: "WARNING",
    OFFTRACK: "OFF-TRACK",
});


// ----------------- TRAFFIC TAB -----------------//

export let roadMapYearWidth = 135 * 3;
export let roadMapYearIncrement = 135 * 4;
/***
 *
 * @type {string[]} Traffic tab filter by month list
 */
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/***
 *
 * @type {string[]} Traffic tab filter by QUARTERLY
 */
export const QUARTERLY = ["Q1", "Q2", "Q3", "Q4"];
/***
 *
 * @type {string[]} Traffic tab filter by SELECTORS
 */
export const SELECTORS = ['Quarterly', 'Monthly', 'Weekly'];
/***
 *
 * @type {string[]} Traffic tab filter by SELECTORS_TYPE
 */
export const SELECTORS_TYPE = new Enum(['Quarterly', 'Monthly', 'Weekly']);
/***
 *
 * @type {string[]} Traffic tab filter by SERVICE_PROVIDER_ENUM
 */

export const SERVICE_PROVIDER_ENUM = new Enum({UDN: 99, UDN_PLUS:40172, CHINA:54321});


// ----------------- CONSTANTS USED FOR DOUGHNUT CHARTS -----------------//
/**
 * HSL color for chart segment highlight
 * @type {string}
 */
export const DOUGHNUT_CHART_HIGHLIGHT_COLOR = 'hsla(92, 37%, 55%, 1)';

/**
 * Enumeration of chart titles
 * @type {{BUG_ORIGIN: string, PRIORITY: string, STATUS: string, FIX_VERSION: string}}
 */
export const CHART_TITLE_ENUM = {
    'BUG_ORIGIN': 'Bug Origin',
    'PRIORITY': 'Priority',
    'STATUS': 'Status',
    'MODULE': 'Module',
    'FIX_VERSION': 'Fix Version',
    'DEV': 'DEV',
    'TEST': 'TEST'
};

/**
 * Enumeration of doughnut chart scope for menu actions
 * @type {{CENTER: string, SECTOR: string}}
 */
export const DOUGHNUT_CHART_SCOPE_ENUM = {
    CENTER: "center",
    SECTOR: "sector"
};



// ----------------- CONSTANTS USED FOR JIRA QUERIES -----------------//

/**
 * URL to the JIRA dashboard web page
 * @type {string}
 */
export const JIRA_LINK_URL = 'https://jira.ericssonudn.net/issues/';

/**
 * Enumeration of JIRA query response status type.
 * The response format of a JIRA query in when hitting /jiraquery is
 * {"status": <status>, "result": <result>}
 * @type {*|Enum}
 */
export const JQL_RESPONSE_STATUS_ENUM = {
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
};


/**
 * Enumeration of doughnut chart menu item titles
 * @type {{JIRA: string, PRORITY: string, STATUS: string, FIX: string}}
 */
export const DOUGHNUT_CHART_MENU_ITEM_ENUM = {
    JIRA: "Jira Link",
    PRIORITY: "Priority View",
    STATUS: "Status View",
    MODULE: "Module View",
    FIX: "Fix View",
    DEV: "DEV",
    BUG: "BUG"
};

/**
 *
 * @type {{PRODUCTION: string, STAGING: string, DEV: string, QA: string}}
 */

export const JQL_BUG_ENVIRONMENT_ENUM = {
    PRODUCTION: 'Production',
    STAGING: 'Staging',
    DEV: 'Dev',
    QA: 'QA'
};

// -------------------------------------------//


// ----------------- STATUS TAB -----------------//
/**
 * Enumeration of different types of view (for status tab)
 * @type {{DEV: string, TEST: string, BUG: string}}
 */
export const STATUS_ENV_ENUM = {
    "DEV": "DEV",
    "TEST": "TEST",
    "BUG": "BUG"
};

// ------ //






