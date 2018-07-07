/**
 * @description     : Component to create SVG doughnut chart.
 * @prop {Array}    : numbers, required
 * @prop {Array}    : tooltip, optional
 * @prop {Object}   : canvasSize, optional
 * @prop {Number}   : arcRadius, optional
 * @prop {String}   : textCenter, required
 * @prop {String}   : selectedStrokeColor, optional
 * @prop {Boolean}  : disableSum, optional
 * @prop {Array}    : colorArray, optional
 * @prop {Boolean}  : percentageView, optional, shows percent values of sectors, 
 * default being the actual numbers displayed.
 * @prop {Boolean}  : sectorSelectionDisabled, optional
 * @prop {String}   : title, optional
 * @prop {Array}    : menu, optional, if provided then shows menu on sectors and also at center.
 * @prop {String}   : centerTextColor, optional
 * @prop {String}   : sectorTextColor, optional
 * @prop {Boolean}  : legends, optional
 * @prop {Array}    : legendsData, optional
 * @prop {Number}   : centerFontSize, optional
 * 
 */
import {Component, PropTypes} from "react";
import * as ChartHelpers from "./ChartHelpers";
import Tooltip from "../Helpers/Tooltip/Tooltip";
import ChartMenu from "../Helpers/ChartMenu/ChartMenu";
import "./ChartsStyle.less";

class DoughnutChart extends Component {

    /**
     * @description Constructor
     * @param {*} props 
     * @param {*} context 
     */
    constructor(props, context) {
        super(props, context);
        this.chartButtonClick = this.chartButtonClick.bind(this);
        this.chartMenuClickCallback = this.chartMenuClickCallback.bind(this);
        this.menuListObject = this.props.menu ? this.props.menu : [];
        this.centerMenuObject = this.props.centerMenu ? this.props.centerMenu : [];
        this.legendsList = [];

        this.state = {
            sectors             : [],
            center              : 0,
            selectedStrokeColor : '',
            radius              : 0,
            canvasSize          : [],
            total               : 0,
            arcRadius           : 0,
            textCenter          : '',
            tooltipLabel        : 'Label',
            tooltipColor        : 'red',
            tooltipVisibility   : false,
            tooltipPosition     : { x:0, y:0 },
            menuHeader          : 'Header',
            menuColor           : 'green',
            menuScope           : 'sector',
            menuPosition        : { x:0, y:0 },
            menuVisibility      : false,
            menuListObject      : [],
            legendsList         : []
        }
    }

    componentDidMount() {
        this.init(this.props); // Initialize chart
    }
    /**
     * @description Initializes the chart, consumes props, also invoked when new props are recieved.
     * @param {Object} props 
     */
    init(props){
        let defaultColors            = ChartHelpers.defaultColors; // Default list of colors

        /*pass these fields from parent component*/
        let numbers                  = props.numbers; //mandatory
        let canvasSize               = props.canvasSize ? props.canvasSize : {width:300, height:300} //optional
        let arcRadius                = props.arcRadius ? props.arcRadius : 70; //optional
        let textCenter               = props.textCenter; //mandatory
        let selectedStrokeColor      = props.selectedStrokeColor;  //mandatory
        let tooltip                  = props.tooltip ? props.tooltip : []; // optional

        // Optional, but if color array length is not same as numbers length then it takes defaults.
        let colorArray               = (props.colorArray && props.colorArray.length === props.numbers.length)
                                        ? props.colorArray
                                        : defaultColors;

        // GLOBALS
        this.percentageView          = props.percentageView ? props.percentageView : false; // Optional
        this.sectorSelectionDisabled = props.sectorSelectionDisabled ? props.sectorSelectionDisabled : false; // Optional
        this.disableSum              = props.disableSum ? props.disableSum : true; // Optional
        this.title                   = props.title ? props.title : ''; // Optional
        /*end*/


        let marginForText       = 40;
        let totalAngle          = 360;
        let sum                 = numbers.length > 0 ? numbers.reduce(ChartHelpers.getSum) : 0;
        let sectors             = [];
        let startAngle          = 0;
        let endAngle            = 0;
        let radius              = Math.min(canvasSize.width - marginForText, canvasSize.height - marginForText) / 2;
        let centerX             = canvasSize.width / 2.0;
        let centerY             = canvasSize.height / 2.0;
        let center              = {x:centerX, y:centerY}

        numbers.map(function (element, index) {
            let val          = sum ? element / sum : 0; // check if sum is 0 therefore the values should be 0
            endAngle         = totalAngle * val;
            endAngle         = endAngle + startAngle;
            if(startAngle === 0 && endAngle  === 360){
                endAngle -= 0.1;
            }
            let midAngle     = (startAngle + endAngle) / 2.0
            let mid          = ChartHelpers.polarToCartesian(center.x, center.y, radius, midAngle);
            let textMid      = ChartHelpers.polarToCartesian(center.x, center.y, (radius - (arcRadius / 2)), midAngle);
            
            let d            = ChartHelpers.describeArc(center.x, center.y, radius, startAngle, endAngle, arcRadius);
            let dExtraMargin = d;
            if(Math.abs(endAngle - startAngle) < 4){ // Check for small radius sector and fix the number fall.
                dExtraMargin = ChartHelpers.describeArc(center.x, 
                                                        center.y,
                                                        radius + 5, 
                                                        startAngle, 
                                                        endAngle + 5, 
                                                        arcRadius);
            }
            else{
                dExtraMargin = ChartHelpers.describeArc(center.x, 
                                                        center.y,
                                                        radius + 5, 
                                                        startAngle, 
                                                        endAngle, 
                                                        arcRadius + 5);
            }

            let radians = Math.abs(endAngle - startAngle) * (Math.PI / 180);
            let arclength = radians * radius;
            let arcLengthMid = arclength / 2.0;
            let menuList = [];
            
            if( props.menu){
                menuList = props.menu[index];
            }
            
            sectors.push({
                id          : index + 1,
                percentage  : val,
                label       : 'Label 1', // TODO : Looks like unused should be removed
                inc         : 0,
                d           : d,
                arcLengthMid: arcLengthMid,
                dExtraMargin: dExtraMargin,
                mid         : mid,
                sectorCenter: textMid,
                number      : element,
                startAngle  : startAngle,
                endAngle    : endAngle,
                color       : colorArray[index],
                selected    : false,
                tooltip     : tooltip[index] ? tooltip[index] + ' ( ' + element + ' )' : '', // changed according to new requirement tooltip will also have the sector value.
                menuList    : menuList
            });
            startAngle      = endAngle;
        });

        sectors = sectors.filter((o) => { return o.percentage !== 0 || o.percentage === NaN });

        this.legendsList = [];
        props.numbers.map((number, index) => {
            let legend = {
                color   : colorArray[index],
                tooltip : tooltip[index] ? tooltip[index] : ''
            }
            this.legendsList.push(legend);
        });

        if( props.legendsData){
            this.legendsList = [];
            props.legendsData.map((legendItem,index) => {
                let legend = {
                    color   : colorArray[index],
                    tooltip : legendItem.name,
                    percentage : legendItem.percentage / 100,
                    distributions : legendItem.distributions ? legendItem.distributions : null
                };
                this.legendsList.push(legend);
            });
        }

        this.setState({
            sectors             : sectors,
            center              : center,
            selectedStrokeColor : selectedStrokeColor,
            radius              : radius,
            canvasSize          : canvasSize,
            total               : sum,
            arcRadius           : arcRadius,
            textCenter          : textCenter,
            tooltipLabel        : 'Label',
            tooltipColor        : 'red',
            tooltipVisibility   : false,
            tooltipPosition     : { x:0, y:0 },
            menuHeader          : 'Header',
            menuColor           : 'green',
            menuScope           : 'sector',
            menuPosition        : { x:0, y:0 },
            menuVisibility      : false,
            menuListObject      : props.menu ? props.menu : [],
            centerTextColor     : props.centerTextColor ? props.centerTextColor : 'white',
            sectorTextColor     : props.sectorTextColor ? props.sectorTextColor : 'white',
            legendsList         : this.legendsList
        });
    }

    /**
     * @description React Lifecycle function
     * @param {*} nextProps 
     */
    componentWillReceiveProps(nextProps){
        this.menuListObject = nextProps.menu ? nextProps.menu : [];
        this.centerMenuObject = nextProps.centerMenu ? nextProps.centerMenu : [];
        this.legendsList = [];

        this.init(nextProps);
    }
    
    /**
     * @description Invoked on click of sector, creates a stroke across the clicked section to show it selected,
     * if sectorSelectionDisabled is true then returns false.
     * @param {Object} sector 
     */
    chartButtonClick(event, sector){
        if(this.sectorSelectionDisabled)
            return false;

        let sectors     = this.state.sectors;
        let radius      = this.state.radius;
        let arcRadius   = this.state.arcRadius;
        let that        = this;
        let centerX     = this.state.canvasSize.width / 2.0;
        let centerY     = this.state.canvasSize.height / 2.0;
        let center      = { x:centerX, y:centerY }
        let dExtraMargin;
        let selectedIndex = -1;
        sectors.filter(function (element, index, array) {
             if(sector.id == element.id){
                element.selected = true;
                 radius = radius + 5;
                 arcRadius = arcRadius + 5;
                 selectedIndex = index;
             }
             else{
                 radius = that.state.radius;
                 arcRadius = that.state.arcRadius;
                 element.selected = false;
             }
             array[index] = element;
            let d = ChartHelpers.describeArc(center.x, 
                                            center.y, 
                                            radius, 
                                            element.startAngle, 
                                            element.endAngle, 
                                            arcRadius);
            
            element.d = d;
         })

        if(selectedIndex !== -1){
            let selectedSector = sectors.splice(selectedIndex, 1);
            sectors.push(selectedSector[0]);
        }
         
        this.setState({
            menuPosition: { 
                x : event.clientX + 5,
                y : event.clientY - 30
            },
            sectors : sectors,
            menuHeader: sector.id !== -1 ? sector.tooltip : 'VIEW ALL',
            menuColor: sector.id !== -1 ? sector.color : '#123E5A',
            menuListObject: sector.id !== -1 ? sector.menuList : this.centerMenuObject,
            menuScope: sector.id !== -1 ? 'sector': 'center',
            menuVisibility: true,
            centerCircleSelected : sector.id !== -1 ? false : true
        });
        // Ends Here
    }

    /**
     * @description Invoked when the mouse moves, controlls the position of the tooltip.
     * @param {*} event
     */
    chartMouseMove(event){
        this.setState({
            tooltipPosition: { 
                x : event.clientX + 5,
                y : event.clientY - 30
            }
        });
    }

    /**
     * @description Invoked when mouse enters a sector
     * @param {*} label
     * @param {*} color 
     */
    chartMouseEnter(label, color){
        this.setState({
            tooltipLabel : label,
            tooltipColor : color,
            tooltipVisibility: true
        });
    }

    /**
     * @description Invoked when mouse leaves a sector
     */
    chartMouseLeave(){
        this.setState({
            tooltipVisibility: false
        });
    }

    chartBlur(event){
        if( event.target.className.baseVal === "doughnut"){
            this.setState({
                menuVisibility: false
            });
        }
    }



    chartMenuClickCallback(index, label, sector, scope){
        this.setState({
            menuVisibility: false
        });
        this.props.menuClick(index, label, sector, scope);
    }


    /**
     * @description React Lifecycle Function
     */
    render() {
        // let sector1 = this.state.sectors[0];
        let that = this;
        let disableSum = "";
        if(!this.disableSum)
            disableSum = <tspan x="50%" y="55%">{that.state.total}</tspan>;
        
        let guid = ChartHelpers.guid(); // This guid is required as it keeps the doughnut chart specific Id to not repeat.
        let sectors = this.state.sectors.map(function (sector, index) {
                    let percentageView = <text 
                                            fill="white" 
                                            xlinkHref={"#curve" + index} 
                                            x={sector.sectorCenter.x} 
                                            y={sector.sectorCenter.y} 
                                            fontSize="9px" 
                                            fontWeight="bold" 
                                            textAnchor="middle" 
                                            alignmentBaseline="central"> { that.percentageView ? (sector.percentage * 100).toFixed() + "%" : sector.number } 
                                        </text>;
                    
                    // Commented as per latest update from Manoj where all sector info should come at center, should be reinvoked if plans change.
                    /*if(!that.percentageView){
                        percentageView = <text width="500" style={{dy:10}} dy={-2} fill={that.state.sectorTextColor}>
                                <textPath xlinkHref={"#curveExtra" + guid + index} startOffset={sector.arcLengthMid}   >
                                    { sector.number }
                                </textPath>
                            </text>;
                    }*/
                    return <g key={"g" + index}>
                            <path 
                                className="doughnutChartSector" 
                                onMouseEnter={()=>that.chartMouseEnter(sector.tooltip, sector.color)} 
                                onMouseMove={(event)=>that.chartMouseMove(event)} 
                                onMouseLeave={()=>that.chartMouseLeave()}  
                                onClick={(event)=>that.chartButtonClick(event, sector)} 
                                id={"curve" + index} 
                                key={"path" + index} 
                                d={sector.d} 
                                strokeWidth={sector.selected ? "2" : "1"} 
                                fill={sector.color} 
                                stroke={sector.selected ? that.state.selectedStrokeColor : 'white'} />
                            <g>
                                <path 
                                    id={"curveExtra" + guid + index} 
                                    key={"path" + index} 
                                    d={sector.dExtraMargin} 
                                    fill="none" 
                                    />
                                { percentageView }
                            </g>
                        </g>;
                });

                
        let legendsEntriesHTML = this.state.legendsList.map(function (legend, index){
            return (
                <div 
                    key={ "entry" + index } 
                    className="entry">
                        <div 
                            className="swatch" 
                            style={{'backgroundColor':legend.color}}>
                        </div> { legend.tooltip + (legend.percentage || legend.percentage === 0 ? ' ( ' + (legend.percentage * 100).toFixed() + '% )' : '' ) } 
                    {
                        legend.distributions ? legend.distributions.map((dist, index) => {
                            return <a key={"distribution" + index} href={ dist.link } target="_blank"> { dist.name } : { dist.count } </a>
                        }) : null
                    }
                </div>
            );
        });

        
        let legends = this.props.legends ? <div className="chartLegends">
                { legendsEntriesHTML }
            </div> : null;

        let sectorsSVG = sectors.length > 0
            ? <div className="donut-chart-item">
                <div className="svg-wrapper" onMouseLeave = {(event)=>that.chartBlur(event)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="doughnut"
                     onClick = {(event)=>that.chartBlur(event)}
                        width={this.state.canvasSize.width} height={this.state.canvasSize.height}>
                    { sectors }

                    <circle
                        cx={this.state.center.x}
                        cy={this.state.center.y}
                        r={ this.state.radius}
                        strokeWidth={this.state.centerCircleSelected ? 2 : 0}
                        stroke={this.state.selectedStrokeColor} fill="none" />

                    {/*<rect width="150" height="40" stroke="red" fill="" strokeWidth='3' />*/}
                    { !this.centerMenuObject.length ? <text
                        x="50%"
                        y="50%"
                        fontSize={ this.props.centerFontSize ? this.props.centerFontSize : 12 }
                        alignmentBaseline="central"
                        textAnchor="middle"
                        fill={that.state.centerTextColor} >{ that.state.textCenter }
                        { disableSum }
                    </text> : null }
                </svg>
                { this.centerMenuObject.length ? <div className="chartCenterText">
                    <button className="btn btn-default udn-btn" onClick={(event)=>that.chartButtonClick(event, { id: -1 })} >{ that.state.textCenter }</button>
                </div> : null }
                </div>
                {this.title ? <div className="chartTitle"> { this.title } </div> : null}
            { legends }
            <Tooltip 
                position={ this.state.tooltipPosition } 
                label={this.state.tooltipLabel} 
                color={this.state.tooltipColor} 
                visible={this.state.tooltipVisibility}  />
            
            <ChartMenu 
                position = { this.state.menuPosition }
                chartMenuClickCallback={this.chartMenuClickCallback} 
                menuHeader={ this.state.menuHeader }
                menuColor = { this.state.menuColor }
                scope = { this.state.menuScope }
                visible = { this.state.menuVisibility }
                menu = { this.state.menuListObject } />
            
        </div>

            : <div className="flex-layout"><span className="noData">{ this.title ? this.title : that.state.textCenter } has No Data</span></div>;

        return (sectorsSVG);

    }

}

DoughnutChart.propTypes = {
    numbers                 : PropTypes.array.isRequired,
    tooltip                 : PropTypes.array,
    canvasSize              : PropTypes.object,
    arcRadius               : PropTypes.number,
    textCenter              : PropTypes.string.isRequired,
    disableSum              : PropTypes.bool,
    colorArray              : PropTypes.array,
    percentageView          : PropTypes.bool,
    sectorSelectionDisabled : PropTypes.bool,
    title                   : PropTypes.string,
    menu                    : PropTypes.array,
    centerTextColor         : PropTypes.string,
    sectorTextColor         : PropTypes.string,
    legends                 : PropTypes.bool,
    legendsData             : PropTypes.array,
    centerFontSize          : PropTypes.number
}

 export default DoughnutChart