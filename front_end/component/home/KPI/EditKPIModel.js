/**
 * @description     : Component container for edit KPI
 * @prop {Array}    : alltableData, required
 * @prop {Function} : getAllChartsForYear, required
 * @prop {Function} : closeModel, required
 * @prop {Number}   : year, required
 */
import { Component, PropTypes } from 'react';

// Imported from Globals
import { QUARTERLY as _QUARTERLY } from '../../../constants/constants';
import SelectionField from "../globals/Helpers/SelectionField";
import InputField from "../globals/Helpers/InputField";
import { getHttpRequest, postHttpRequest } from "../../../httprequest/http_connection";

class EditKPIModel extends Component {

    /**
     * @description Constructor
     * @param {*} props 
     * @param {*} context 
     */
    constructor(props, context) {
        super(props, context);
        this.saveKPIChanges         = this.saveKPIChanges.bind(this);
        this.deleteFaultFound       = this.deleteFaultFound.bind(this);
        this.handleChangeAchieved   = this.handleChangeAchieved.bind(this);
        this.handleChangeRemaining  = this.handleChangeRemaining.bind(this);
        this.onkpiStateSelect       = this.onkpiStateSelect.bind(this);
        this.onkpiYearSelect        = this.onkpiYearSelect.bind(this);

        let that =  this;
        
        getHttpRequest('/get_kpiState', function(kpiStates){
            kpiStates = JSON.parse(kpiStates);
            let tempArray =  [];
            kpiStates.map(function(data){
                tempArray.push(data.kpi_state)
            })
            that.setState({
                kpiState        : tempArray,
                selectKPIState  : tempArray[0]
            });
        });

        let currentYear = new Date().getFullYear();
        let yearArray = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];

        this.state = {
            alltableData    : this.props.alltableData,
            year            : this.props.year,
            quaters         : [..._QUARTERLY],
            yearArray       : yearArray,
            selectKPIState  : '',
            kpiState        : []
        };
    }
    
    /**
     * @description Invoked to update the selected state
     * @param {*} event 
     */
    onkpiStateSelect(event){
        let state = event.target.value;
        this.setState({
            selectKPIState: state
        });
    }

    /**
     * @description Invoked on year dropdown changed, fetches development KPI through a http request.
     * @param {*} event 
     */
    onkpiYearSelect(event){
        let year = event.target.value;
        let that = this;
        getHttpRequest("/get_development_KPI?year=" + year, function (data) {
                let tempStateArray = [];
                let allCharts = JSON.parse(data);
                that.state.kpiState.map(function(kpiState){
                    let state = allCharts.filter(function(chartData){
                    if(chartData.kpi_state == kpiState)
                        return chartData;     
                    });
                    if(state.length == 0){
                        tempStateArray.push(kpiState);
                    }
                });
                tempStateArray.map(function(kpiState){
                    let tempObject = {
                        achieved            : 0,
                        development_KPI_id  : null,
                        goal                : 0,
                        kpi_id              : null,
                        kpi_state           : kpiState,
                        quater              : null,
                        remaining           : 0,
                        year                : year
                    }
                    that.state.quaters.map(function(quater){
                        tempObject.quater = quater;
                        allCharts.push(JSON.parse(JSON.stringify(tempObject)))
                    })

                }) 
                that.setState({
                    alltableData : allCharts
                }); 
        });
    }

    /**
     * @description Invoked to Save or Update the Development KPI
     */
    saveKPIChanges() {
        let that = this;
        let tempArray = []
        this.state.alltableData.map(function(data){
            if(that.state.selectKPIState === data.kpi_state){
                tempArray.push(data);
            }
            if(data.goal < data.achieved){
                that.editKPIErrorString = "ERROR : Achieved found greater than goal";
                return false;
            }
        });
        let requestData = {
            body: tempArray
        }
        postHttpRequest('/updateDevelopmentKPI', requestData, function(data) {
            if(data == "success"){
                that.props.closeModel();
                that.props.getAllChartsForYear(that.props.year);
            }
        });
    }

    /**
     * @description Updates state on change of State Achieved value
     * @param {*} achieved 
     * @param {*} index 
     */
    handleChangeAchieved(achieved, index){
        let indexParsed = parseInt(index.replace("kpiAchieved1", ""));
        let tempArray = this.state.alltableData;
        tempArray[indexParsed].achieved = (achieved);
        this.setState({
            alltableData: tempArray
        });
    }

    /**
     * @description Updates state on change of State Remaining value
     * @param {*} remaining 
     * @param {*} index 
     */
    handleChangeRemaining(remaining, index){
        
        let indexParsed  = parseInt(index.replace("kpiRemaining", ""));
        let tempArray = this.state.alltableData;
        tempArray[indexParsed].remaining = (remaining);
        this.setState({
            alltableData: tempArray
        });
    }

    /**
     * 
     * @param {*} index 
     */
    deleteFaultFound (index){
        let that = this;
        let tempArray = this.state.alltableData;
        let data = tempArray.splice(index, 1);

        if(data[0].fault_id != null){
            getHttpRequest("/deleteFaultFoundForRelease?fault_id=" + data[0].fault_id, function (response) {
                if(response == "success"){
                        getHttpRequest("/getReleaseFaultSlipThrough?version_id=" + that.props.versionId, 
                        function (data) {
                            let allChartData = JSON.parse(data);
                            that.setState({
                                alltableData: allChartData,
                            });
                        });
                }
            });
        }else{
                that.setState({
                    alltableData: tempArray
                })
        }
    }

    /**
     * @description Component Render lifecycle function
     */
    render () {
        let that = this;
        let tableData = this.state.alltableData;

        let kpiStateHTML = this.state.kpiState.map(function (data, index) {
                                            return (<option key={index} value={data} name={data}
                                                                id={"kpi_state" + data} >{data}</option>);
                                        });

        let yearDropdownHTML = this.state.yearArray.map(function (data, index) {
                                            return (<option key={index} value={data} name={data}
                                                                id={"kpi_state" + data} >{data}</option>);
                                        });

        let tableDataHTML = tableData.map(function (data, index) {
                                        if(that.state.selectKPIState.toUpperCase() == data.kpi_state.toUpperCase()){
                                            return (
                                                <tr key={"editKPItr" + index} id={"KpiTableID" + index}>
                                                    <td className="plan-table-td">
                                                        <SelectionField 
                                                            disabled="true"  
                                                            inputID={"kpiQuater" + index} 
                                                            name="" 
                                                            value={ data.quater } 
                                                            defaultValue={ 'Q' + (index + 1)}  
                                                            moduleList={that.state.quaters} 
                                                            disabled={ true }/>
                                                    </td>
                                                    <td style={{display:"none"}}>
                                                        <InputField 
                                                            inputID={"kpiId1" + index} 
                                                            name="kpi_id" value={data.kpi_id} 
                                                            handleChangeModule={that.handleChangeModule}/>
                                                    </td> 
                                                    <td  >
                                                        <InputField 
                                                            inputID={"kpiAchieved1" + index} 
                                                            name="kpiAchieved" 
                                                            value={data.achieved} 
                                                            handleChangeFault={that.handleChangeAchieved}/>
                                                    </td>
                                                    <td  >
                                                        <InputField 
                                                            inputID={"kpiRemaining" + index} 
                                                            name="goalActual" 
                                                            value={data.remaining} 
                                                            handleChangeFault={that.handleChangeRemaining}/>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    });
        return(
            <div 
                className="modal fade in udn-modal"
                id="editKPIModel" 
                tabIndex="-1" 
                role="dialog" 
                aria-labelledby="exampleModalLabel" 
                aria-hidden="true" 
                style={{display: "block"}}>
                <div className="modal-dialog modal-dialog" role="document">
                    <div className="modal-content quality-modal-content">
                        <div className="modal-header qulaity-header">
                            <a title="Close">
                                <i className="glyphicon glyphicon-remove icon-arrow-right pull-right closeIcon" 
                                onClick={this.props.closeModel}></i>
                            </a>
                            <button type="button" 
                                className="close btn btn-primary doneBtn" 
                                data-dismiss="modal" 
                                onClick={this.saveKPIChanges} >Done</button>
                            <h4 className="modal-title titleModalRoad">Edit KPI</h4>
                            <div className="pull-left">
                                <select 
                                    value={ that.state.selectKPIState } 
                                    className="dropdown-button kpiSelection" 
                                    id="kpiStateSelection" 
                                    onChange={(e)=>this.onkpiStateSelect(e)}>
                                    { kpiStateHTML }
                                </select>
                            </div>
                            <div className="pull-left">
                                <select  
                                    className="dropdown-button yearSelection" 
                                    id="kpiYearSelection" 
                                    onChange={(e)=>this.onkpiYearSelect(e)}>
                                    { yearDropdownHTML }
                                </select>
                            </div>
                        </div>
                        <div className="modal-body quality-body">
                            <table id="editKPITable" className="table table-striped table-analysis editFeatureSummary">
                                <thead>
                                <tr className="plan-header-row">
                                    <th style={{display:"none"}}>
                                        id
                                    </th>
                                    <th>
                                        Quater
                                    </th>
                                    <th>
                                        achieved
                                    </th>
                                    <th>
                                        remaining
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="plan-body-row qualityLastElemnt table-container-edit-feature">
                                    { tableDataHTML }
                                </tbody>
                            </table>
                            <div className="bg-primary text-warning text-center">{ this.editKPIErrorString }</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

EditKPIModel.propTypes = {
    getAllChartsForYear : PropTypes.func.isRequired,
    alltableData        : PropTypes.array.isRequired,
    closeModel          : PropTypes.func.isRequired,
    year                : PropTypes.number.isRequired
}

export default EditKPIModel;