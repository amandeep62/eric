import {getHttpRequest} from "../../../httprequest/http_connection";
import {DOUGHNUT_CHART_HIGHLIGHT_COLOR, DOUGHNUT_CHART_MENU_ITEM_ENUM} from "../../../constants/constants";


/**
 * Get the list of all versions for a specific year
 * @param year - The year in format YYYY
 * @param callBack - A callback method to be called after getting the list of versions
 */
export function  getAllVersions(year, callBack) {
    let tempArray = [];
    getHttpRequest("/versionsByYear?year=" + year, function (data) {
        let versionArrayData = JSON.parse(data);
        versionArrayData.map(function (data) {
            tempArray.push(data);
        });

        callBack(tempArray);
    });
}


/**
 * Get the data info representing the Summary (coming from the list of versions)
 * Send the summary data (id, name, number)/ null if there is no data found.
 * @param callback - A callback method to be called after getting the summary data info
 */
export function getVersionSummary(callback) {
    let summaryData = null;

    getHttpRequest("/versions", function (data) {
        let versions = JSON.parse(data);

        if (versions && versions.length > 0) {
            versions.map((version) => {
                if (version.name === 'Summary') {
                    summaryData = version;
                }
            });
        }

        //send the summaryData to the callback function
        if (typeof callback === 'function') {
            callback(summaryData);
        }
    });


}

/**
 * Get the current affected version as of today.
 * @param callback - A callback method to be called after getting the current version id
 */
export function getCurrentVersion(callback) {

    getHttpRequest("/getCurrentVersion", function (result) {
        //should be an array so take the first element
        let currentVersionObject = JSON.parse(result);



        //send the current version id to the callback method
        if (typeof callback === 'function') {
            callback(currentVersionObject);
        }
    });
}

/**
 * Get the current affected version as of today.
 * @param callback - A callback method to be called after getting the current version id
 */
export function getCurrentVersionForProduction(callback) {

    getHttpRequest("/getCurrentVersionForProduction", function (result) {
        //should be an array so take the first element
        let currentVersionObject = JSON.parse(result);


        //send the current version id to the callback method
        if (typeof callback === 'function') {
            callback(currentVersionObject);
        }
    });
}


/**
 * Get the list of all possible version numbers from a specific version. A version could have two different
 * format: e.g. 2.6 and 2.6.0.
 * There are few exceptions in JIRA to consider and it could change over time.
 * TODO review the formats available in JIRA regularly
 * @param {String} versionNumber - the version number
 * @return  {String[]}  List of different number formats representing the same version.
 */
export function getListOfVersionNumbersFromVersion(versionNumber) {
    let versionNumbers = [];

    //There are exceptions in JIRA where some number formats would not be allowed.
    if (versionNumber === '2.3' || versionNumber > '2.6') {
        versionNumbers.push(versionNumber + '.0');
    }
    else {
        versionNumbers.push(versionNumber + '');
        versionNumbers.push(versionNumber + '.0');
    }

    return versionNumbers;
}
/**
 * Get the list of all project modules
 * @param callBack - A callback method to be called after getting the list of modules
 */
export function getAllModules(callBack) {
    getHttpRequest("/getAllModules", (data) => {
        let allChartData = JSON.parse(data);
        let tempArray = [];
        allChartData.rows.map(function (data) {
            tempArray.push(data.module_name);
        });
        callBack(tempArray);
    });
}


/**
 * Get the list of themes
 * @param callBack - A callback method to be called after getting the list of themes
 */
export function getAllThemes(callBack) {
    getHttpRequest("/getAllThemes", (data) => {
        let allChartData = JSON.parse(data);
        let tempArray = [];
        allChartData.rows.map(function (data) {
            tempArray.push(data.release_theme);
        });
        callBack(tempArray);
    });
}


/**
 * Make a query to the JIRA backend service
 * @param {String}      jql - the JQL query string
 * @param {Array}       fields - list of fields to use as filters for the query
 * @param {Function}    callback - callback function to call once the query response returns data
 */
export function queryJira(jql, fields, callback) {

    let query = '/queryjira?' + 'jql=' + encodeURIComponent(jql);

    if (fields && fields.length > 0) {
        query += '&fields=' + encodeURIComponent(fields.join(","));
    }

    getHttpRequest(query, (data) => {
        if (typeof callback === 'function') {
            callback(data);
        }
    });
}



/**
 * This function converts any long text into hashcode this hashcode is useful in comparison of text
 * @param text
 * @returns {number} return hashcode
 */
export function hashCode(text) {
    let hash = 0, i, chr;
    if (text.length === 0) return hash;
    for (i = 0; i < text.length; i++) {
        chr   = text.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}



/**
 * Get Current date in format YEAR-MONTH-DAY
 * @returns {Date}
 */
export function getCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;


    return today;
}

/**
 * Helper function to find if an array contains a specific element
 * @param {String[]}  array - The array to search from
 * @param {String}    element - The element to search for
 * @param {boolean}   caseInsensitive
 */
export function arrayContains(array, element, caseInsensitive) {
    if (caseInsensitive) {
        return (array.toLowerCase().indexOf(element.toLowerCase()) > -1)
    }
    else {
        return (array.indexOf(element) > -1);
    }

}


/**
 * Generate a range of colors that will be used as background colors in the chart
 * @param {Number} numberOfColors - Number of different colors to generate
 * @param {String} color - (Optional) if not null, then all array is of this color
 * @returns {XML}
 */
export function generateBackgroundColor(numberOfColors, color) {

    let backgroundColor = [];

    if (color) {
        for(let  i = 0; i < numberOfColors; i++) {
            backgroundColor.push(color);
        }
    }
    else {
        //let's define the HSL based on h=240 deg (base blue color)
        let h = 190;
        let s = 30;
        let l = 50;


        for(let  i = 0; i < numberOfColors; i++) {

            let hsl = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';

            backgroundColor.push(hsl);

            h = (h + 7) % 365;
            s = (s + 15) % 100;
            if (l < 35) {
                l = 35;
            }
            else {
                l = (l - 7) % 100;
            }

        }

    }
    return backgroundColor;
}



/**
 * Generate range of font colors that will be used for the text in the chart.
 * @param {Number} numberOfData number of data to cover with font color
 */
export function  generateFontColor(numberOfData) {
    let fontColor = [];
    let hexWhite = '#ffffff';

    for (let i = 0; i < numberOfData; i++) {
        fontColor.push(hexWhite);
    }

    return fontColor;
}


/**
 * Get the array of highlighted color for the chart. This array is used to render the
 * colored selection of the chart segments
 * @param {String[]} labelList - the array of labels to highlight
 * @param {String[]} selectedLabels - the list of selected labels on the chart
 * @return {String[]} The array of colors including the selected colors
 */
export function getHighlightedColorArray(labelList, selectedLabels) {
    //identify the segment that has been selected in the
    // bug origin chart and highlight it
    let colorArray = [];
    if (selectedLabels.length === 1) {
        let label = selectedLabels[0];
        let selectedIndex = labelList.indexOf(label);
        colorArray = generateBackgroundColor(labelList.length);
        colorArray[selectedIndex] = DOUGHNUT_CHART_HIGHLIGHT_COLOR;
    }
    else {
        //if bug origin list has more than one item, then it means it's ALL the
        //types of bug origin -> highlight them all
        colorArray = generateBackgroundColor(labelList.length, DOUGHNUT_CHART_HIGHLIGHT_COLOR);
    }

    return colorArray;
}


/**
 *
 * @param {String[]} items - items label title
 * @return {Array} - List of menu items
 */
export function getMenuItems(items) {

    let menuItems = [];

    for (let i = 0; i < items.length; i++) {
        let menuItem = {};
        menuItem.index = i;
        menuItem.label = items[i];
        menuItem.action = items[i];
        menuItems.push(menuItem);

    }

    return menuItems;
}