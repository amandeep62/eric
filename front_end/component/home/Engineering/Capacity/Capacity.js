import React, {Component} from 'react'
import {EngineeringTabEnum} from "../../../../constants/constants";
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle'
import BarChart from '../../globals/Charts/BarChart/BarChart'
import {store, storeModule} from "../Store/Store"
import CapacityOperation from './CapacityOperation'
import './capacity.less'

class Capacity extends Component {
    /***
     * To Draw capacity bar chart
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.onVersionSelectCallback = this.onVersionSelectCallback.bind(this);
        this.onYearSelectCallback = this.onYearSelectCallback.bind(this);
        this.onTimeSelectCallback = this.onTimeSelectCallback.bind(this);
        this.getHourFTEData = this.getHourFTEData.bind(this);
        this.capacityOperation = new CapacityOperation();

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === EngineeringTabEnum.CAPACITY.value);

        this.getHourFTEData(tabVersionObject.versionNumber);

        this.state =
            {
                noData:false,
                time:0,
                versionNumber:tabVersionObject.versionNumber,
                hoursFTEObject:{
                    hoursDataArray:null,
                    fteDataArray:null
                },
                loading:true
            };

    }

    /***
     * Calling API based on the versionNumber
     * @param versionNumber
     */
    getHourFTEData(versionNumber){
        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === EngineeringTabEnum.CAPACITY.value);

        this.capacityOperation.getCapacityData(tabVersionObject.version,versionNumber, (hoursFTEObject)=>{
            this.setState({
                versionNumber:versionNumber,
                hoursFTEObject:hoursFTEObject,
                loading:false
            })
        });

    }

    /***
     * Calling onVersionSelectCallback on change of release version
     * @param version_id
     * @param versionNumber
     */
    onVersionSelectCallback(version_id, versionNumber){
        this.getHourFTEData(versionNumber);
    }

    onYearSelectCallback(){
        console.log("Year Select Callback");
    }

    /***
     * Changing on time it will do call back
     * @param time
     */
    onTimeSelectCallback(time){
            this.setState({time:time});
        }


    /***
     * @description : This one will create a links for bar chart
     */
    openJIRALink(index) {
        let moduleName = storeModule.getState()[(Math.floor(index / 2))];

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(
            item => item.tabId === EngineeringTabEnum.CAPACITY.value);
        let versionNumber = parseFloat(tabVersionObject.versionNumber);

        let versionNumberStr = versionNumber + "";
        if (versionNumber > 2.0 && versionNumber < 3.0) {
            versionNumberStr = versionNumber + ".0";
        }
        let link = "https://jira.ericssonudn.net/issues/?jql=project in ('" + moduleName + "') AND fixVersion =" +
            versionNumberStr + " AND issuetype in (Sub-task, task,'technical task', " +
            "'Test Task', 'Doc Task',Bug,Problem)";

        window.open(link, "_blank");
    }

    componentDidMount(){
        document.title = "Capacity";
    }

    /***
     *
     * @returns {xml}
     */
    render(){
        const { loading } = this.state;
        if(loading) {
            return  <div className="loader"> </div>; // render loading icon when app is not ready
        }
        let hoursFTEObject = this.state.hoursFTEObject;
        let alternateFactor = 2;
        let time = this.state.time;
        let canvasSize = {
            width:670,
            height:419
        };
        let hoursDataArray;
        let fteDataArray;
        let modulesArray = storeModule.getState();
        if(time == 0 && hoursFTEObject.hoursDataArray
            && hoursFTEObject.fteDataArray){
            hoursDataArray= hoursFTEObject.hoursDataArray ?
                $.map(hoursFTEObject.hoursDataArray[0],
                    function(v, i) { return [v, hoursFTEObject.hoursDataArray[1][i]]; }):null;
            fteDataArray = hoursFTEObject.fteDataArray ?
                $.map(hoursFTEObject.fteDataArray[0],
                    function(v, i) { return [v, hoursFTEObject.fteDataArray[1][i]]; }):null;
            alternateFactor = 2
        }
        else if(time ==1 && hoursFTEObject.hoursDataArray && hoursFTEObject.fteDataArray){
            hoursDataArray= hoursFTEObject.hoursDataArray[2];
            fteDataArray = hoursFTEObject.fteDataArray[2];
            alternateFactor=1;
        }

        let allHoursZeros = hoursDataArray ? hoursDataArray.filter(
            item=> item=="0") : null;

        let allFTEZeros = fteDataArray?fteDataArray.filter(
            item=>item=="0"):null;

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(
            item => item.tabId === EngineeringTabEnum.CAPACITY.value);
        let versionNumber = tabVersionObject.versionNumber;
        return <div className="row">

            <EngineeringTitle
                title={"CAPACITY"}
                engineeringTabId={EngineeringTabEnum.CAPACITY.value}
                onVersionSelectCallback={this.onVersionSelectCallback}
                onTimeSelectCallback = {this.onTimeSelectCallback}
            />
            <div id="capacityCharts" className="capacity-tab" >

                {this.state.noData?<div className="nullData">No data</div>:null}

                <div className="col-md-6">

                    {hoursFTEObject.hoursDataArray &&
                    allHoursZeros.length!=hoursDataArray.length? <BarChart
                        canvasSize={canvasSize}
                        dataArrayBar={hoursDataArray}
                        xAxisArrayBar={modulesArray}
                        yAxisLabelBar="Hours"
                        alternateFactor={alternateFactor}
                        versionNumber={versionNumber}
                        barClickCallback = { this.openJIRALink }
                        legends = {{
                            Legend1: "Actual Time Spent",
                            Legend2: "Original Time Estimate"
                        }}
                        lineChartData = {false}
                    />:<div className="flex-layout"><div className="noData">No Data</div></div>}
                </div>
                <div className="col-md-6">

                    {hoursFTEObject.fteDataArray && allFTEZeros &&
                    allFTEZeros.length!=fteDataArray.length? <BarChart
                        canvasSize={canvasSize}
                        dataArrayBar={fteDataArray}
                        xAxisArrayBar={modulesArray}
                        yAxisLabelBar="FTE"
                        alternateFactor={alternateFactor}
                        versionNumber={versionNumber}
                        barClickCallback = { this.openJIRALink }
                        legends = {{
                            Legend1: "Actual Time Spent",
                            Legend2: "Original Time Estimate"
                        }}
                        lineChartData = {false}
                    />:<div className="flex-layout"><div className="noData">No Data</div></div>}
                </div>
            </div>
        </div>
    }
}

export default Capacity