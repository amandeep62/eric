import  {Component} from 'react';
import BarChart from '../../../globals/Charts/BarChart/BarChart'
import {store, storeModule} from "../../Store/Store"
import {EngineeringTabEnum} from "../../../../../constants/constants";
import CapacityOperation from '../../Capacity/CapacityOperation'

class RDCapacity extends Component {
    constructor(props, context) {
        super(props, context);
        this.getHourFTEData = this.getHourFTEData.bind(this);
        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.
        find(item => item.tabId === EngineeringTabEnum.RELEASEDASHBOARD.value);
        this.state =
            {versionNumber:
                tabVersionObject.versionNumber,
                hoursFTEObject:{hoursDataArray:[],
                fteDataArray:[]},
                loading:true
            };
        this.capacityOperation = new CapacityOperation();
        this.getHourFTEData();

    }
    getHourFTEData(){
        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.
        find(item =>
            item.tabId === EngineeringTabEnum.RELEASEDASHBOARD.value);
         this.capacityOperation.
         getCapacityData(tabVersionObject.version,tabVersionObject.versionNumber,
             (hoursFTEObject)=>{
            this.setState({
                hoursFTEObject:hoursFTEObject,
                loading: false
            })
         });

    }
    componentWillReceiveProps(nextProps) {
        this.getHourFTEData();
    }
    render() {
        const { loading } = this.state;
        if(loading) {
            return  <div id="loader"> </div>; // render loading icon when app is not ready
        }

        let hoursFTEObject = this.state.hoursFTEObject;
        let alternateFactor = 2;
        let canvasSize = {width:420, height:240};
        let hoursDataArray = hoursFTEObject.hoursDataArray &&
        hoursFTEObject.hoursDataArray.length>0 ? hoursFTEObject.hoursDataArray?
            $.map(hoursFTEObject.hoursDataArray[0], function(v, i)
            { return [v, hoursFTEObject.hoursDataArray[1][i]]; }):null:null;


        let allHoursZeros = hoursDataArray ? hoursDataArray.filter(
            item=> item=="0") : null;
        let moduleArray = storeModule.getState();
        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState
            .find(item =>
                item.tabId === EngineeringTabEnum.RELEASEDASHBOARD.value);
        return <div className="col-md-4 capacity-view">
            <div className="blueLine">
                <span>CAPACITY</span>
                <h1></h1>
            </div>
            {hoursFTEObject.hoursDataArray &&
            hoursFTEObject.hoursDataArray.length > 0
            && allHoursZeros.length!=hoursDataArray.length?
                <div className="rd-barChart">
                    <BarChart
                        canvasSize={canvasSize}
                        dataArrayBar={hoursDataArray}
                        xAxisArrayBar={moduleArray}
                        yAxisLabelBar="Hours"
                        alternateFactor={alternateFactor}
                        versionNumber={tabVersionObject.versionNumber}
                        legends = {{
                            Legend1: "Actual Time Spent",
                            Legend2: "Original Time Estimate"
                        }}
                        lineChartData = {false}
                    />
                </div>:<div className="flex-layout">
                    <div className="noData">No Data</div></div>}
        </div>
    }
}

export default RDCapacity