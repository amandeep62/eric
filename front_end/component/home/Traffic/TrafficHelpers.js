import moment from "moment";
import "./traffic.less";
/***
 *
 * @param date - date
 * @param days - no days to be added to the date which passed
 * @returns {newDate}
 */
export const addDays = (date, days) =>{
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/***
 *
 * @param year - 2017 etc
 * @param week - week number
 * @returns {date}
 */


export const getDateFromWeekNumber = (year, week) => {
    let d = new Date(year, 0, 1);
    let dayNum = d.getDay();
    let diff = --week * 7;

    // If 1 Jan is Friday to Sunday, go to next week

    if (/*!dayNum ||*/ dayNum > 4) {
        diff += 7;
    }

    // Add required number of days
    d.setDate(d.getDate() - d.getDay() + ++diff);
    return d;
};

/**
 *
 * @param current - Selected Month,Week,Year Filter
 * @param monthIndex - Jan - 0 , Feb - 1 etc
 * @returns {"startDateOfMonth"}
 */
export const getStartDate = (current, monthIndex) =>{
    return new Date(current.getFullYear(), monthIndex, 0);
};

/**
 *
 * @param current - Selected Month,Week,Year Filter
 * @param monthIndex - Jan - 0 , Feb - 1 etc
 * @returns {"endDateOfMonth"}
 */
export const getEndDate = (current, monthIndex) =>{
    return new Date(current.getFullYear() - (current.getMonth() > 0 ? 0 : 1),
        (monthIndex - 1 + 12) % 12, 1);
};

/***
 *
 * @param dateComponent - (01- 09) -> appending 0 if dateComponent < 10
 * @returns {"10"}
 */

export const formatDateComponent = (dateComponent) => {
    return (dateComponent < 10 ? "0" : " ") + dateComponent;
};


/***
 *
 * @param date
 * @returns {[month,date, year]}
 */
export const formatDate = (date) => {
    return [formatDateComponent(date.getMonth()), formatDateComponent(date.getDate()), date.getFullYear()];
};

/***
 *
 * @param num - Number which need to be convert in to KB,MB,GB,TB etc
 * @returns {String} bytes -> "KB" etc
 */

export const convertBytesToHigherValues = (num) =>{
    let unit, units = ["EB", "PB", "TB", "GB", "MB", "KB", "Bytes"];
    // TODO: This is a wrong conversion. It should be 1024. We matched the portal data by dividing 1000.
    for (unit = units.pop(); units.length && num >= 1000; unit = units.pop()) {
        num /= 1000;
    }
    return [num.toFixed(0), unit];
};
/***
 *
 * @param d - getCurrentWeekNumber from the date passed
 * return WeekNumber
 */
export const getCurrentWeekNumber = (d) => {
    // Copy date so don't modify original
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    return Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);

};
/***
 *
 * @param date - Date which need to be current date
 * @returns {"Ex:2017-03-13"}
 */
export const isoDate = (date) => {
    if (!date) {
        return null
    }
    date = moment(date).toDate();
    let month = 1 + date.getMonth();
    if (month < 10) {
        month = '0' + month
    }
    let day = date.getDate();
    if (day < 10) {
        day = '0' + day
    }
    return date.getFullYear() + '-' + month + '-' + day
};

export const getWeekNumber = (d) =>{
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
};
