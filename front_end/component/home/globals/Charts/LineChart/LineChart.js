/**
 * @description     : Component to render line charts in SVG format.
 * @prop {Object}   : canvasSize
 * @prop {Array}    : dataArray, required
 * @prop {Array}    : xAxisArray, required
 * @prop {Boolean}  : legend, optional, should be used when legends need to be disabled.
 * @prop {Number}   : maxValue, optional, only to be used if the chart is used in parelled to bar chart.
 * dataArray Format
 * [{
        data : [22,11,56,34,89],
        color : "red",
        label : "test1"
    },
    {
        data : [56,67,98,45,56],
        color : "green",
        label : "test2"
    },
    {
        data : [34,56,11,12,112],
        color : "yellow",
        label : "test3"
    }]

 * xAxisArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
 */
import { Component, PropTypes }  from "react";
import normalize    from "normalize-to-range";
import Tooltip      from "../../Helpers/Tooltip/Tooltip";

const POINT_RADIUS = 4;
class LineChart extends Component {
    /***
     * @description Constructor
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.loadLineChart = this.loadLineChart.bind(this);
        this.renderLineChart = this.renderLineChart.bind(this);
        this.canvasSize = {
            width: this.props.canvasSize.width - 70,
            height: this.props.canvasSize.height
        };
        
        this.legendsVisibility = this.props.legend === undefined ? true : this.props.legend; // optional,

        

        
    }

    componentWillMount(){
        let dataArray = this.props.dataArray; // required, contains data to be plotted on the chart
        let xAxisArray = this.props.xAxisArray; // required, contains xAsix information
        let xSubAxis = this.props.xSubAxis ? this.props.xSubAxis : [];
        // Looping to enable all data lines as visible.
        dataArray.map( (item) => { item.visible = true });
        this.state = {
            dataArray           : dataArray,
            dataArrayRender     : dataArray,
            normalizedArray     : [],
            xAxisArray          : xAxisArray,
            xSubAxis            : xSubAxis,
            scaleArray          : [],
            normalizedScaleArray: [],
            normalizeHeight     : 0,
            textFontSize        : 0,
            tooltipPosition     : { x : 100, y : 100},
            tooltipLabel        : 'Label',
            tooltipColor        : 'red',
            tooltipVisibility   : false
        };
        this.loadLineChart(
            dataArray,
            xAxisArray, xSubAxis, this.props.maxValue, this.props.canvasSize);
    }


    /***
     * @description Invoked whenever data change is observed, ie class constructed or prop change triggered.
     * @param {Array}  dataArray       - Data to display bar's
     * @param {Array}  xAxisArray      - X Axis Labels
     */
    loadLineChart(dataArray, xAxisArray, xSubAxis, maxValue, canvasSize) {
        this.canvasSize = {
            width: canvasSize.width,
            height: canvasSize.height
        };

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

        this.setState({
            dataArrayRender     : dataArray,
            normalizedArray     : normalizedArray,
            xAxisArray          : xAxisArray,
            xSubAxis            : xSubAxis,
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

    /***
     * @description React Lifecycle Fucntion
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let dataArray = nextProps.dataArray;
        let xAxisArray = nextProps.xAxisArray;
        let xSubAxis = nextProps.xSubAxis ? nextProps.xSubAxis : [];
        dataArray.map( (item) => { item.visible = true });
        this.loadLineChart(dataArray, xAxisArray, xSubAxis, nextProps.maxValue,  nextProps.canvasSize);
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
        let normalizeHeight = this.state.normalizeHeight + 100;
        let polyPoints = [];
        let indexIncrement = dataArray.length * dataIndex;

        dataArray.map((number, index) => {
            let xInc = (71 + barWidth / 2.0) + (1.8 * index) * barWidth; // (multiplicationFactor * index);
            polyPoints.push( xInc + ',' + (normalizeHeight - this.state.normalizedArray[index + indexIncrement]) );
        });

        return <g>
                    { lineChartObject.visible ? <polyline 
                        fill="none" 
                        strokeWidth="1"
                        stroke={ lineChartObject.color } 
                        points={ polyPoints.join(' ') } 
                        strokeWidth='3'  /> : null }
                    {
                        polyPoints.map((point, index) => {
                            let pointer = point.split(',');
                            return (<g>
                                        { lineChartObject.visible ? <circle
                                            onMouseEnter={ (event) => this.chartPointMouseIn(event, dataArray[index], this.state.xAxisArray[index], lineChartObject.color) }
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
                                            fontSize={ this.state.textFontSize }><a cursor = "pointer" xlinkHref={"https://jira.ericssonudn.net/issues/?jql="+linkInArray[index]} target="_blank">{dataArray[index]}</a></text> : null }
                                        
                                        {  dataIndex == 0 ? <text
                                            x={ pointer[0] }
                                            y={ normalizeHeight + 15 }
                                            fill="white"
                                            textAnchor="middle"
                                            fontSize={ this.state.textFontSize }>{this.state.xAxisArray[index]}</text> : null }

                                        {  this.state.xSubAxis.length && dataIndex == 0 ? <text
                                            x={ pointer[0] }
                                            y={ normalizeHeight + 25 }
                                            fill="white"
                                            textAnchor="middle"
                                            fontSize={ this.state.textFontSize }>{this.state.xSubAxis[index]}</text> : null }
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
        let axisX = $(window).width() - event.clientX >= 200 ? event.clientX + 5 : event.clientX - 105 ;
            this.setState({
            tooltipPosition: { 
                x : axisX,
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
        
        if( this.state.dataArray[dataIndex].visible === true && this.state.dataArrayRender.length === 1)
            return;
        let dataArray = this.state.dataArray;
        let selectedDataItem = dataArray[dataIndex];
        selectedDataItem.visible = !selectedDataItem.visible;
        dataArray[dataIndex] = selectedDataItem;

        let dataArrayRender = dataArray.filter((item) => { if(item.visible) return item });
        this.loadLineChart(dataArrayRender, this.state.xAxisArray, this.state.xSubAxis, this.state.maxValue, this.canvasSize);
    }

    /**
     * @description React Lifecycle function
     */
    render() {
        let normalizeHeight = this.state.normalizeHeight + 100;
        let lineCharts = this.state.dataArrayRender.map((dataOptions, index) => {
            return this.renderLineChart(dataOptions, index);
        });


        let yAxisRenderHTML = this.state.scaleArray.map((yAxis, index) => {
                                        return <g key={'g' + index}>
                                            <text 
                                                x="40"
                                                y={normalizeHeight - this.state.normalizedScaleArray[index]}
                                                fill="white" 
                                                fontSize={ this.state.textFontSize }>{yAxis}</text>
                                            { index == 0 ? <line 
                                                y2={normalizeHeight - this.state.normalizedScaleArray[index]} 
                                                x2="900" 
                                                y1={normalizeHeight - this.state.normalizedScaleArray[index]} 
                                                x1="60" 
                                                strokeWidth="1" 
                                                stroke={'rgba(255, 255, 255,' + (index > 0 ? '0.2)' : '0.75)') } 
                                                fill="none" /> : null}
                                        </g>
                                    });
        
        // let shoulderDifference = (this.canvasSize.width - 120) / this.state.dataArrayRender.length;
        let labelRenderHTML = this.legendsVisibility ? this.state.dataArray.map((dataItem, index) => {
                                        return <ul className="barChartLegend" key={"labels" + index}
                                                    onClick = { (event) => this.toggleLineChartVisibility(event, index) } >
                                            <li className="legend-for-line-chart">
                                                <div className="legend-tick" style={{background : dataItem.visible ? dataItem.color : "grey" }}></div>
                                            </li>
                                            <li>
                                                <span style={{color : dataItem.visible ? "white" : "grey"}}>{ dataItem.label }</span>
                                            </li>
                        </ul> }) : null ;
        let xAxisRenderHTML = <line  
                        y2={ normalizeHeight + 5 } 
                        x2="65" 
                        y1="0" 
                        x1="65" 
                        strokeWidth="1" 
                        stroke="rgba(255, 255, 255,0.75)" 
                        fill="none" />;
                        

        return (<div className="line-chart-container">
                    { labelRenderHTML }
                    <svg width = { this.canvasSize.width }
                    height= {this.canvasSize.height + 30} xmlns="http://www.w3.org/2000/svg">
                        { lineCharts }
                        { yAxisRenderHTML }
                        { xAxisRenderHTML }
                    </svg>
                    <Tooltip
                            position={ this.state.tooltipPosition }
                            label={ this.state.tooltipLabel }
                            color={ this.state.tooltipColor }
                            visible={ this.state.tooltipVisibility }  />
                </div>);
    }
}


LineChart.propTypes = {
    canvasSize  : PropTypes.object.isRequired,
    dataArray   : PropTypes.array.isRequired,
    xAxisArray  : PropTypes.array.isRequired,
    legend      : PropTypes.bool,
    maxValue    : PropTypes.number
}

export default LineChart

