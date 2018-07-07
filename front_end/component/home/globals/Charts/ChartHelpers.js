// List of Default Colors.
export const defaultColors = ['#6666FF', '#FFB399', '#E6331A', '#4DB380', '#00B3E6',
            '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
            '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
            '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
            '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
            '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
            '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
            '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
            '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
            '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

/**
 * @description Returns Sum
 * @param {number} total 
 * @param {number} num
 * @return {number} 
 */
export const getSum = function(total, num) {
    return total + num;
};

const S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
export const guid = function () {
    let guid = '{' + (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase() + "}";
    return guid;
}




/**
 * @description Converts polar co-ordinates into Cartesian Form
 * @param {number} centerX 
 * @param {number} centerY 
 * @param {number} radius 
 * @param {number} angleInDegrees
 * @return {object}
 */
export const polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

/**
 * @description Creates a SVG equivalent path describing arc formation.
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * @param {number} startAngle 
 * @param {number} endAngle 
 * @param {number} arcRadius
 * @return {object} 
 */
export const describeArc = function(x, y, radius, startAngle, endAngle,arcRadius){
        let start = polarToCartesian(x, y, radius, startAngle);
        let end = polarToCartesian(x, y, radius, endAngle);
        let start1 = polarToCartesian(x, y, radius-arcRadius, startAngle);
        let end1 = polarToCartesian(x, y, radius-arcRadius, endAngle);

        let arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
        let d

            d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, arcSweep, 1, end.x, end.y,
                "L", end1.x, end1.y,
                "A", radius - arcRadius, radius - arcRadius, 0, arcSweep, 0, start1.x, start1.y,
                "L", start.x, start.y,

            ].join(" ");

    return d;
}
