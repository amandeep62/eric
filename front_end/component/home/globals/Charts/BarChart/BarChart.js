/**
 * @fileOverview Drawing Bar Chart
 */
import {Component} from 'react';
import "./BarChart.less"
import PropTypes from 'prop-types';
import normalize from 'normalize-to-range';
import Tooltip      from "../../Helpers/Tooltip/Tooltip";


const propTypes = {
    alternateFactor: PropTypes.number.isRequired,
    canvasSize: PropTypes.shape({
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired
    }),
    xAxisArrayBar: PropTypes.array.isRequired,
    yAxisLabelBar: PropTypes.string.isRequired
};

Array.prototype.scaleBetween = function(scaledMin, scaledMax) {
    var max = Math.max.apply(Math, this);
    var min = Math.min.apply(Math, this);
    return this.map(num => (scaledMax-scaledMin)*(num-min)/(max-min)+scaledMin);
}

const POINT_RADIUS = 4;
class BarChart extends Component {
    /***
     * Component to create a bar chart
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.barMouseOver = this.barMouseOver.bind(this);
        this.loadBarChart = this.loadBarChart.bind(this);
        this.loadLineChart = this.loadLineChart.bind(this);
        this.renderLineChart = this.renderLineChart.bind(this);
        this.getSum = this.getSum.bind(this);
        this.toggleLineChartVisibility = this.toggleLineChartVisibility.bind(this);
        this.toggleBarChartVisibility = this.toggleBarChartVisibility.bind(this);

        this.state = ({
            lineChartResults : [],
            barChartResults : []
        });
    }

    componentWillMount(){

        let canvasSize = {
            width: this.props.canvasSize.width - 70,
            height: this.props.canvasSize.height
        };

        this.colorArray = ['#5F825D', '#11627E'];
        let dataArrayBar = this.props.dataArrayBar;
        this.realDataArrayBar = [...this.props.dataArrayBar];
        let xAxisArrayBar = this.props.xAxisArrayBar;
        let xSubAxis = this.props.xSubAxis ? this.props.xSubAxis : [];
        let yAxisLabelBar = this.props.yAxisLabelBar;
        let alternateFactor = this.props.alternateFactor;
        this.maxValueOnBar = 20;
        this.maxValueOnLine = 20;

        let lineChartResults;
        let dataArrayLine;
        let xAxisArrayLine;
        let lineChartData = this.props.lineChartData;
        if(lineChartData !== false){
            this.canvasSize = canvasSize;
            dataArrayLine = this.props.lineChartData.dataArrayLine; // required, contains data to be plotted on the chart
            xAxisArrayLine = this.props.lineChartData.xAxisArrayLine; // required, contains xAsix information
            this.axisVisibility = this.props.lineChartData.axis === undefined ? true : this.props.lineChartData.axis; // optional
            this.legendsVisibility = this.props.lineChartData.legend === undefined ? true : this.props.lineChartData.legend; // optional,

            // Looping to enable all data lines as visible.
            dataArrayLine.map( (item) => { item.visible = true });
            lineChartResults = this.loadLineChart(dataArrayLine, xAxisArrayLine, this.props.lineChartData.maxValueLine);
        }
        let barChartResults = this.loadBarChart(canvasSize, dataArrayBar, xAxisArrayBar, xSubAxis, yAxisLabelBar, alternateFactor, this.props.maxValue);

        this.setState({
            lineChartResults : lineChartResults,
            barChartResults : barChartResults,
            tooltipPosition: {
                x : 0,
                y : 0
            },
            tooltipColor       : "red",
            tooltipLabel       : "label",
            tooltipVisibility  : false,
            inflowBarVisibility: true,
            outflowBarVisibility: true
        });
    }

    getSum(total, num) {
        return total + num;
    }

    /***
     * @description
     * @param {Object} canvasSize      - Setting bar size height and width.
     * @param {Array}  dataArray       - Data to display bar's
     * @param {Array}  xAxisArray      - X Axis Labels
     * @param {Array}  yAxisLabel      - Y Axis Labels
     * @param {Number} alternateFactor  - If alternateFactor 2
     */
    loadBarChart(canvasSize,
                 dataArray,
                 xAxisArray,
                 xSubAxis,
                 yAxisLabel,
                 alternateFactor,
                 maxValue) {
        let normalizeHeight = canvasSize.height - 100;
        //var dataArray =[101,297,101,320,200,50,100];
        //let normalizedArray = normalize(dataArray, 0, normalizeHeight);


        let maxY = Math.max.apply(null, dataArray);
        maxY = maxValue ? maxValue :  maxY;

        let sum = dataArray.reduce((a, b) => a + b, 0);

        if(sum === 0){
            if(this.state.lineChartResults.dataArrayLine[0].visible){
                maxY = this.maxValueOnLine;
            } else {
                maxY = 50;
            }
        }

        let concatedArray = [...dataArray];
        concatedArray.push(maxY);

        let normalizedArray = normalize(concatedArray, 0, normalizeHeight);
        //let normalizedArray =  dataArray.scaleBetween(0, normalizeHeight);
        delete normalizedArray[normalizedArray.length - 1];
        
        normalizedArray = normalizedArray.map(item => isNaN(item) ? 0 : item);

        let division = maxY / 5;
        let factor = 100;
        

        if (division >= 0 && division < 10) {
            factor = 1
        }
        else if (division >= 10 && division < 100) {
            factor = 10
        }
        else if (division >= 100 && division < 1000) {
            factor = 100
        }
        else if (division >= 1000 && division < 10000) {
            factor = 1000
        }
        let scaleYPartition = Math.ceil(division / factor) * factor;
        if (scaleYPartition === 0) {
            if(sum === 0){
                scaleYPartition = 20;
            }else{
                return;
            }
        }
        let scaleArray = [];
        let maxScale = 0;
        for (let i = 0; i <= maxY + scaleYPartition; i += scaleYPartition) {
            if(i > maxY){
                scaleArray.push(maxY);
            }
            else{
                scaleArray.push(i);
                maxScale = i + scaleYPartition;
            }

        }

        //let normalizedScaleArray = normalize(scaleArray, 0, normalizeHeight);
        let normalizedScaleArray =  scaleArray.scaleBetween(0, normalizeHeight);
        let diff = normalizedScaleArray[1]-normalizedScaleArray[0];


        scaleArray.pop();
        scaleArray.push(maxScale);
        normalizedScaleArray.pop();
         normalizedScaleArray.push(normalizedScaleArray[normalizedScaleArray.length - 1] + diff)


        let textFontSize = 9;
         if(canvasSize.width >= 600 && canvasSize.width <= 700){
             textFontSize = 9
         }
         else if(canvasSize.width <= 600){
             textFontSize = 8;
         }
        normalizedArray.pop();
        //console.log("normalizedArray",normalizedArray,"normalizedScaleArray",normalizedScaleArray);
        return ({
            canvasSize: canvasSize,
            dataArrayBar: dataArray,
            normalizedArray: normalizedArray,
            showToolTip: false,
            xAxisArrayBar: xAxisArray,
            xSubAxis : xSubAxis,
            scaleArray: scaleArray,
            normalizedScaleArray: normalizedScaleArray,
            normalizeHeight: normalizeHeight,
            yAxisLabelBar: yAxisLabel,
            alternateFactor: alternateFactor,
            textFontSize:textFontSize
        });
    }

    /***
     * @description Invoked whenever data change is observed, ie class constructed or prop change triggered.
     * @param {Array}  dataArray       - Data to display bar's
     * @param {Array}  xAxisArray      - X Axis Labels
     */
    loadLineChart(dataArray, xAxisArray, maxValue) {

        let normalizeHeight = this.canvasSize.height - 100;
        // All data values from dataArray should be concatinated to get relative normalized results.
        let concatedArray = [];
        dataArray.map((dataItems) => {
            dataItems.data.map((value) => {
                concatedArray.push(value);
            });
        });


        let maxY = Math.max.apply(null, concatedArray); // Calculates the max of normalized array
        maxY = maxValue ? maxValue : maxY;

        this.maxValueOnLine = maxY;

        concatedArray.push(maxY); // Add max value to calculate relative normalizedArray
        let normalizedArray = normalize(concatedArray, 0, normalizeHeight); // Normalizing the concatinated array
        delete normalizedArray[normalizedArray.length - 1]; // Remove the last element which was normalized max
        normalizedArray = normalizedArray.map(item => isNaN(item) ? 0 : item);



        let division = maxY / 5;
        let factor = 100; // Factor required to calculate relative partition between the points.

        if (division >= 0 && division < 10) {
            factor = 1
        }
        else if (division >= 10 && division < 100) {
            factor = 10
        }
        else if (division >= 100 && division < 1000) {
            factor = 100
        }
        else if (division >= 1000 && division < 10000) {
            factor = 1000
        }
        let scaleYPartition = Math.ceil(division / factor) * factor;
        if (scaleYPartition === 0) {
            return;
        }
        let scaleArray = [];
        let maxScale = 0;
        for (let i = 0; i <= maxY + scaleYPartition; i += scaleYPartition) {
            if(i > maxY){
                scaleArray.push(maxY);
            }
            else{
                scaleArray.push(i);
                maxScale = i + scaleYPartition;
            }

        }

        let normalizedScaleArray = normalize(scaleArray, 0, normalizeHeight);
        let diff = normalizedScaleArray[1] - normalizedScaleArray[0];


        scaleArray.pop();
        scaleArray.push(maxScale);
        normalizedScaleArray.pop();
        normalizedScaleArray.push(normalizedScaleArray[normalizedScaleArray.length - 1] + diff);


        let textFontSize = 9;
        if(this.canvasSize.width >= 600 && this.canvasSize.width <= 700){
            textFontSize = 9
        }
        else if(this.canvasSize.width <= 600){
            textFontSize = 8;
        }

        return({
            dataArrayLine           : dataArray,
            normalizedArray     : normalizedArray,
            xAxisArrayLine          : xAxisArray,
            scaleArray          : scaleArray,
            normalizedScaleArray: normalizedScaleArray,
            normalizeHeight     : normalizeHeight,
            textFontSize        : textFontSize,
            tooltipPosition     : { x : 100, y : 100},
            tooltipLabel        : 'Label',
            tooltipColor        : 'red',
            tooltipVisibility   : false
        });
    }

    /**
     * @description Returns a renderable HTML out of chart Information
     * @param {Object} lineChartObject
     * @param {Number} dataIndex
     */
    renderLineChart(lineChartObject, dataIndex){
        let dataArray = lineChartObject.data;
        let linkInArray = lineChartObject.link;
        let barWidth = (this.canvasSize.width / (dataArray.length * 2));
        // let multiplicationFactor = ( (this.canvasSize.width - 100) / (dataArray.length));
        let normalizeHeight = this.state.lineChartResults.normalizeHeight + 100;
        let polyPoints = [];
        let indexIncrement = dataArray.length * dataIndex;

        dataArray.map((number, index) => {
            let xInc = (51 + barWidth / 2.0) + (1.8 * index) * barWidth; // (multiplicationFactor * index);
            polyPoints.push( xInc + ',' + (normalizeHeight - this.state.lineChartResults.normalizedArray[index + indexIncrement]) );
        });


        return <g>
            { lineChartObject.visible ?
                <polyline
                fill="none"
                strokeDasharray={'0'}
                stroke={ lineChartObject.color }
                points={ polyPoints.join(' ') }
                strokeWidth={'3'}  />  : null }
            {
                polyPoints.map((point, index) => {
                    let pointer = point.split(',');
                    return (<g>
                        { lineChartObject.visible ? <circle
                            onMouseEnter={ (event) => this.chartPointMouseIn(event, dataArray[index], this.state.lineChartResults.xAxisArrayBar[index], lineChartObject.color) }
                            onMouseLeave = { (event) => this.chartPointMouseOut(event) }
                            key={'pointCircle' + index}
                            cx={ pointer[0] }
                            cy={ pointer[1] }
                            r={ POINT_RADIUS }
                            stroke={ lineChartObject.color }
                            fill={ lineChartObject.color } /> : null }
                        { lineChartObject.visible ? <text
                            key={'text' + index}
                            x={ pointer[0] - 5 }
                            y={ pointer[1] - 7 }
                            fill="white"
                            textAnchor="middle"
                            fontSize={this.state.lineChartResults.textFontSize}><a cursor = "pointer" xlinkHref={"https://jira.ericssonudn.net/issues/?jql="+linkInArray[index]} target="_blank">{dataArray[index]}</a></text> : null }

                        { this.axisVisibility ? <text
                            x={ pointer[0] }
                            y={ normalizeHeight + 15 }
                            fill="white"
                            textAnchor="middle"
                            fontSize={this.state.lineChartResults.textFontSize}>{this.state.lineChartResults.xAxisArray[index]}</text> : null }
                    </g>);
                })
            }
        </g>;
    }

    /**
     * @description Invoked whenever mouse enters the polyline points
     * @param {*} event
     * @param {Number} yValue
     * @param {Number} xValue
     * @param {String} color
     */
    chartPointMouseIn(event, yValue, xValue, color){
        event.target.setAttribute("r", 6); // Increases the radius of point on hover.
        this.setState({
            tooltipPosition: {
                x : event.clientX + 5,
                y : event.clientY - 30
            },
            tooltipColor       : color,
            tooltipLabel       : xValue + ' ( ' + yValue + ' )',
            tooltipVisibility  : true
        });
    }

    /**
     * @description Invoked whenever mouse leaves the polyline points
     * @param {*} event
     */
    chartPointMouseOut(event){
        event.target.setAttribute("r", POINT_RADIUS); // sets radius of point to default value.
        this.setState({
            tooltipVisibility  : false
        });
    }

    toggleLineChartVisibility(event, dataIndex){
        debugger
        let dataArrayLine = this.state.lineChartResults.dataArrayLine;
        let selectedDataItem = dataArrayLine[dataIndex];
        selectedDataItem.visible = !selectedDataItem.visible;
        dataArrayLine[dataIndex] = selectedDataItem;

        let maxValue = 0;
        if(selectedDataItem.visible){
            // Concat both
            let concatArray = [...this.state.lineChartResults.dataArrayLine[0].data, ...this.state.barChartResults.dataArrayBar];
            maxValue = Math.max.apply(null, concatArray);
        }
        else{
            // No concat
            maxValue = Math.max.apply(null, this.state.barChartResults.dataArrayBar);
        }

        let lineChartResults = this.loadLineChart(this.state.lineChartResults.dataArrayLine, this.state.lineChartResults.xAxisArrayLine, maxValue);
        let barChartResults = this.loadBarChart(this.props.canvasSize, this.state.barChartResults.dataArrayBar, this.state.barChartResults.xAxisArrayBar, this.state.barChartResults.xSubAxis, this.state.barChartResults.yAxisLabelBar, this.state.barChartResults.alternateFactor, maxValue);

        this.setState({
            dataArrayLine  : dataArrayLine,
            lineChartResults : lineChartResults,
            barChartResults : barChartResults
        });
    }

    toggleBarChartVisibility(e, index, visibility){
        debugger
            let dataArrayBar = this.state.barChartResults.dataArrayBar;
            for (let i = 0; i < dataArrayBar.length; i++) {
                if (visibility && index == 0) {
                    if (i % 2 === 0) { // index is even
                        dataArrayBar[i] = 0;
                    }
                } else if (visibility && index == 1) {
                    if (i % 2 !== 0) { // index is odd
                        dataArrayBar[i] = 0;
                    }
                } else if (!visibility && index == 0) {
                    if (i % 2 === 0) { // index is even
                        dataArrayBar[i] = this.realDataArrayBar[i];
                    }

                } else if (!visibility && index == 1) {
                    if (i % 2 !== 0) { // index is odd
                        dataArrayBar[i] = this.realDataArrayBar[i];
                    }
                }
            }

            let lineChartResults = this.loadLineChart(this.state.lineChartResults.dataArrayLine, this.state.lineChartResults.xAxisArrayLine);
            let barChartResults = this.loadBarChart(this.props.canvasSize, dataArrayBar, this.state.barChartResults.xAxisArrayBar, this.state.barChartResults.xSubAxis, this.state.barChartResults.yAxisLabelBar, this.state.barChartResults.alternateFactor);

            index ?
                this.setState({
                    outflowBarVisibility: !visibility,
                    lineChartResults: lineChartResults,
                    barChartResults: barChartResults
                }) :
                this.setState({
                    inflowBarVisibility: !visibility,
                    lineChartResults: lineChartResults,
                    barChartResults: barChartResults
                });

    }

    /***
     * @description
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let canvasSize = {
            width: nextProps.canvasSize.width,
            height: nextProps.canvasSize.height
        };
        this.canvasSize = canvasSize;
        let dataArrayBar = nextProps.dataArrayBar;
        let xAxisArrayBar = nextProps.xAxisArrayBar;
        let xSubAxis = nextProps.xSubAxis ? nextProps.xSubAxis : [];
        let yAxisLabelBar = nextProps.yAxisLabelBar;
        let alternateFactor = nextProps.alternateFactor;
        let lineChartResults;

        let barChartResults = this.loadBarChart(
            canvasSize,
            dataArrayBar,
            xAxisArrayBar,
            xSubAxis,
            yAxisLabelBar,
            alternateFactor,
            nextProps.maxValue);

        let lineChartData = nextProps.lineChartData;
        if(lineChartData !== false){
            let dataArrayLine = nextProps.lineChartData.dataArrayLine;
            let xAxisArrayLine = nextProps.lineChartData.xAxisArrayLine;
            dataArrayLine.map( (item) => { item.visible = true });
            lineChartResults = this.loadLineChart(dataArrayLine, xAxisArrayLine, nextProps.lineChartData.maxValueLine);
        }

        this.setState({
            lineChartResults : lineChartResults,
            barChartResults : barChartResults
        });
    }

    /***
     * @description : This method is for showing tool tip
     * @param index
     * @param value
     * @param x
     * @param y
     */
    barMouseOver(event, yValue, xValue, color) {
        this.setState({
            tooltipPosition: {
                x : event.clientX + 5,
                y : event.clientY - 30
            },
            tooltipColor       : color,
            tooltipLabel       : xValue + ' ( ' + yValue + ' )',
            tooltipVisibility  : true
        });

    }
    barMouseOut(){
        this.setState({tooltipVisibility:false});
    }


    /***
     * return (barChart)
     */
    render() {
        let lineChartExist = (this.props.lineChartData !== false);
        let lineCharts = null;
        let yAxisRenderHTML = null;
        let shoulderDifference = null;
        let labelRenderHTML = null;
        let xAxisRenderHTML = null;
        if(lineChartExist){
            lineCharts = this.state.lineChartResults.dataArrayLine.map((dataOptions, index) => {
                return this.renderLineChart(dataOptions, index);
            });
            yAxisRenderHTML = this.axisVisibility ? this.state.lineChartResults.scaleArray.map((yAxis, index) => {
                return <g key={'g' + index}>
                    <text
                        x="40"
                        y={normalizeHeight - this.state.lineChartResults.normalizedScaleArray[index]}
                        fill="white"
                        fontSize={this.state.barChartResults.textFontSize}>{yAxis}</text>
                    <line
                        strokeDasharray={ index > 0 ? '5,5' : '0'}
                        y2={normalizeHeight - this.state.lineChartResults.normalizedScaleArray[index]}
                        x2="616.9"
                        y1={normalizeHeight - this.state.lineChartResults.normalizedScaleArray[index]}
                        x1="60"
                        strokeWidth="1"
                        stroke={'rgba(255, 255, 255,' + (index > 0 ? '0.2)' : '0.75)') }
                        fill="none" />
                </g>
            }) : null;

            shoulderDifference = (this.canvasSize.width - 120) / this.state.lineChartResults.dataArrayLine.length;
            labelRenderHTML = this.legendsVisibility ? this.state.lineChartResults.dataArrayLine.map((dataItem, index) => {
                return <ul className="barChartLegend" key={"labels" + index}
                           onClick = { (event) => this.toggleLineChartVisibility(event, index) } >
                    <li className="legend-for-line-chart">
                        <div className="legend-tick" style={{background : dataItem.visible ? dataItem.color : "grey" }}></div>
                    </li>
                    <li>
                        <span style={{color : dataItem.visible ? "white" : "grey"}}>{ dataItem.label }</span>
                    </li>
                </ul> }) : null ;
            xAxisRenderHTML = this.axisVisibility ? <line
                y2={ normalizeHeight + 5 }
                x2="65"
                y1="22.3"
                x1="65"
                strokeWidth="1"
                stroke="rgba(255, 255, 255,0.75)"
                fill="none" /> : null;
        }

        let barWidth = (this.state.barChartResults.canvasSize.width / (this.state.barChartResults.dataArrayBar.length * 2));
        let normalizeHeight = this.state.barChartResults.normalizeHeight + 100;
        let alternateFactor = this.state.barChartResults.alternateFactor;

        return <div onClick={() => { this.setState({showToolTip: false}) }}
                    style={{
                        width: this.state.barChartResults.canvasSize.width,
                        'height': this.state.barChartResults.canvasSize.height}}>
            <ul className="barChartLegend">
                <li>
                    <div className="legend-tick" style={{ background: this.state.inflowBarVisibility ? this.colorArray[0] : 'grey' }}></div>
                </li>
                <li onClick = { (e) => this.toggleBarChartVisibility(e, 0, this.state.inflowBarVisibility) } style={{ color : this.state.inflowBarVisibility ? '#fff' : 'grey' }}>{this.props.legends.Legend1}</li>
                <li>
                    <div className="legend-tick" style={{background: this.state.outflowBarVisibility ? this.colorArray[1] : 'grey' }}></div>
                </li>
                <li onClick = { (e) => this.toggleBarChartVisibility(e, 1, this.state.outflowBarVisibility) } style={{ color : this.state.outflowBarVisibility ? '#fff' : 'grey' }}>{this.props.legends.Legend2}</li>
                <li>{labelRenderHTML}</li>
            </ul>

            <svg style={{
                width: this.state.barChartResults.canvasSize.width,
                'height': this.state.barChartResults.canvasSize.height + 20
            }}>
                {this.state.barChartResults.dataArrayBar.map((number, index) => {
                    
                    let xInc = 50 + barWidth / 2.0 + (1.8 * index) * barWidth;
                    xInc = index % alternateFactor === 1 ?
                        xInc - barWidth * 0.7 : xInc;

                    return <g key={"g" + index}>
                        <line onClick={() => this.props.barClickCallback(index)}
                              onMouseOver={(event) =>
                                  this.barMouseOver(event,
                                      this.state.barChartResults.dataArrayBar[index],
                                      this.state.barChartResults.xAxisArrayBar[ parseInt(index / 2)],
                                      this.colorArray[alternateFactor === 1 ? 1 : index % alternateFactor])}
                              onMouseOut={()=>this.barMouseOut()}
                              key={"line" + index} x1={xInc}
                              y1={normalizeHeight - 5} x2={xInc}
                              y2={normalizeHeight - this.state.barChartResults.normalizedArray[index] - 5}
                              style={{
                                  stroke:
                                      this.colorArray[alternateFactor === 1 ? 1 : index % alternateFactor],
                                  strokeWidth: barWidth
                              }}/>
                    </g>

                })}

                {this.state.barChartResults.dataArrayBar.map((number, index) => {
                    let xInc = 50 + barWidth / 2.0 + (1.8 * index) * barWidth;
                    xInc = index % alternateFactor === 1 ? xInc - barWidth * 0.7 : xInc;

                    return <g key={"g" + index}>
                        <text key={"text" + index} x={xInc}
                              y={normalizeHeight - this.state.barChartResults.normalizedArray[index] - 10}
                              fill="white"
                              fontSize={this.state.barChartResults.textFontSize} textAnchor="middle" className="anchor-udn" onClick={() => this.props.barClickCallback(index)}>
                              { this.state.inflowBarVisibility && index % 2 === 0 ? this.state.barChartResults.dataArrayBar[index] : null }
                              { this.state.outflowBarVisibility && index % 2 !== 0 ? this.state.barChartResults.dataArrayBar[index] : null }
                        </text>
                        {index % alternateFactor === 0 ?
                            <text x={xInc}
                                  y={normalizeHeight + 8} fill="white"
                                  fontSize={this.state.barChartResults.textFontSize}>{this.state.barChartResults.xAxisArrayBar[index / 2]}</text> : null}

                        {index % alternateFactor === 0 && this.state.barChartResults.xSubAxis.length ?
                            <text x={xInc}
                                  y={normalizeHeight + 20 } fill="white"
                                  fontSize={this.state.barChartResults.textFontSize}>{this.state.barChartResults.xSubAxis[index / 2]}</text> : null}

                                  
                            
                    </g>

                })}

                {this.state.barChartResults.scaleArray.map((yAxis, index) => {
                    return <g key={"g" + index}>
                        <text x="20"
                              y={normalizeHeight - this.state.barChartResults.normalizedScaleArray[index]}
                              fill="white" fontSize={this.state.barChartResults.textFontSize}>{yAxis}</text>
                    </g>
                })}
                <g>
                    <text x="10" y={(normalizeHeight / 2.0) - 20} fill="white"
                          fontSize={this.state.barChartResults.textFontSize}
                          transform="rotate(270 20,200)">{this.state.barChartResults.yAxisLabelBar}</text>
                </g>
                <line
                    id="svg_105"
                    y2={ normalizeHeight - 5 }
                    x2="45" y1="0"
                    x1="45" strokeWidth="1"
                    stroke="rgba(255, 255, 255,0.75)"
                    fill="none"/>
                <line
                    id="svg_106"
                    y2={ normalizeHeight - 5 }
                    x2="900"
                    y1={ normalizeHeight - 5 }
                    x1="40"
                    strokeWidth="1"
                    stroke="rgba(255, 255, 255,0.75)"
                    fill="none"/>
                    { lineCharts }
                    { yAxisRenderHTML }
                    { xAxisRenderHTML }
            </svg>
            
            <Tooltip
                            position={ this.state.tooltipPosition }
                            label={ this.state.tooltipLabel }
                            color={ this.state.tooltipColor }
                            visible={ this.state.tooltipVisibility }  />
        </div>

    }

}
BarChart.propTypes = propTypes;

export default BarChart

