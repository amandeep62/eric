import  {Component} from 'react';
import Tooltip from '../../../Tools/ToolTipCustomComponent';
import {getHttpRequest, postHttpRequest} from "../../../../../httprequest/http_connection";

class RDUDNStatus extends Component {

    constructor(props, context) {
        super(props, context);
        this.getSelectedVersion = this.getSelectedVersion.bind(this);
        this.dateDiffInDays = this.dateDiffInDays.bind(this);
        this.handleChangeQualtiyID = this.handleChangeQualtiyID.bind(this);
        this.handleChangeScopeID = this.handleChangeScopeID.bind(this);
        this.handleChangeScopeComment = this.handleChangeScopeComment.bind(this);
        this.handleChangeQualtiyComment = this.handleChangeQualtiyComment.bind(this);
        this.state = {
            timePlanData:[],
            editStatus: false
        };
        
        this.getSelectedVersion();
    }


    getSelectedVersion(){
        let that = this;
        getHttpRequest("/getReleaseQualityScope?year=" + this.props.selectedYear, (releaseQdata) =>{
            let releaseQd = JSON.parse(releaseQdata);
            getHttpRequest("/getTimePlanData?year=" +  this.props.selectedYear, (timeData) => {
                let timeD = JSON.parse(timeData);
                timeD.rows.map(function (data) {
                    releaseQd.rows.map(function (data1) {
                        if(data.name == data1.name){
                            data.number = data1.number;
                            data.qualityStatus_id = data1.qualityStatus_id;
                            data.qualityStatus_name = data1.qualityStatus_name;
                            data.quality_comment = data1.quality_comment;
                            data.releaseQuality_id = data1.releaseQuality_id;
                            data.scope_id = data1.scope_id;
                            data.scope_comment = data1.scope_comment;
                            data.version_id = data1.version_id;
                        }
                    });
                });
                that.setState({
                    timePlanData: timeD.rows
                });

            });
        });
    }
    handleChangeQualtiyID(value, index){
        index =  index.replace('qualityStatuslist' , '');
        let qualtiystatusTitle = null;
        if (value == "COMMITMENT") {
            qualtiystatusTitle = 4;
        } else if (value == 'ROBUST') {
            qualtiystatusTitle = 2;
        } else if (value == 'WARNING') {
            qualtiystatusTitle = 3;
        } else if (value == 'OFF-TRACK') {
            qualtiystatusTitle = 1;
        } else {
            qualtiystatusTitle = null;
        }
        this.state.timePlanData.map((data, index1) => {
            if(Number(index1) == Number(index)){
                data.qualityStatus_id = qualtiystatusTitle;
            }
        })
    }
    handleChangeScopeID(value, index){
        index =  index.replace('qualityStatuslist' , '');

        let qualtiystatusTitle=null;
        if (value == "COMMITMENT") {
            qualtiystatusTitle = 4;
        } else if (value == 'ROBUST') {
            qualtiystatusTitle = 2;
        } else if (value == 'WARNING') {
            qualtiystatusTitle = 3;
        } else if (value == 'OFF-TRACK') {
            qualtiystatusTitle = 1;
        } else {
            qualtiystatusTitle = null;
        }
        this.state.timePlanData.map(function (data, index1) {
            if(Number(index1) == Number(index)){
                data.scope_id = qualtiystatusTitle
            }
        })
    }
    handleChangeQualtiyComment(value,index){
        index =  index.replace('qualityStatusinput', '');

        this.state.timePlanData.map(function (data,index1) {
            if(Number(index1) == Number(index)){
                data.quality_comment = value;
            }
        })
    }
    handleChangeScopeComment(value, index){
        index =  index.replace('qualityStatusinput', '');
        this.state.timePlanData.map(function (data,index1) {
            if(Number(index1) == Number(index)){
                data.scope_comment = value;
            }
        })
    }
    dateDiffInDays(startDate, endDate) {
        let millisecPerDay = 1000 * 60 * 60 * 24;
        if (endDate == null) return -1;
        return Math.floor((endDate - startDate) / millisecPerDay);
    }
    
    componentWillReceiveProps(nextProps) {
        let that = this;

        if(nextProps.saveChanges == true){
            var timePlanData= this.state.timePlanData;
            timePlanData.filter(function (element,index,array) {
                element.quality_comment =
                    that.refs["textArea_quality_comment"+(index + 1)] ?
                        that.refs["textArea_quality_comment"+(index+1)].value
                        : element.quality_comment;
                element.scope_comment =
                    that.refs["textArea_scope_comment" + (index + 1)] ?
                        that.refs["textArea_scope_comment" + (index + 1)].value :
                        element.scope_comment;
                array[index] = element;
            })
            postHttpRequest("/updateReleaseQuality?", timePlanData, function (data) {
                if (data == "success") {
                    //that.getSelectedVersion();
                    that.setState({
                        editStatus: false
                    });
                    that.props.changeSaveState();
                }
            });
        }else{
            that.setState({
                editStatus: nextProps.editStatus
            })
        }

    }

    render() {
        let that = this;
        let selectedVersion = null;
        if(this.props.currentSelectedVersion){
            selectedVersion = this.props.currentSelectedVersion;
        }
        return<div className="status-view col-md-4">
            <div className="blueLine left_1p">
                <span>STATUS</span>
                <h1></h1>
            </div>
            <div className="flex-layout">
                <table className="table table-striped table-analysis plan-table">
                    <thead>

                    {that.state.editStatus ?
                        <tr className="plan-header-row">
                            <th className="table-sorter col-sm-2 tdAlign">Release</th>
                            <th className="table-sorter col-sm-2 tdAlign">Scope</th>
                            <th className="table-sorter col-sm-2 tdAlign">Comment</th>
                            <th className="table-sorter col-sm-2 tdAlign" >Quality</th>
                            <th className="table-sorter col-sm-2 tdAlign">Comment</th>
                        </tr>
                        :
                        <tr className="plan-header-row">
                            <th className="table-sorter col-sm-2 tdAlign">Release</th>
                            <th className="table-sorter col-sm-2 tdAlign">Scope</th>
                            <th className="table-sorter col-sm-2 tdAlign" >Time</th>
                            <th className="table-sorter col-sm-2 tdAlign">Quality</th>
                        </tr>
                    }
                    </thead>
                    <tbody className="plan-body-row">
                    {

                        that.state.timePlanData.map(function (element, index) {

                            let qualtiystatusColumn = "";
                            let qualtiystatusTitle = 'No Data';
                            let scopestatusColumn = "";
                            let scopestatusTitle = 'No Data';

                            let onTimeTitle = null;
                            let onTimeSpan = null;
                            let end_date = new Date(element.end_time);
                            let actual_end_date = new Date(element.actual_end_time);
                            let diffDate = null;
                            let onTimeColor;
                            let todayDate = new Date();
                            let eleDate = new Date(element.start_time);

                            element.scope_comment = element.scope_comment ?
                                element.scope_comment : "";
                            element.quality_comment = element.quality_comment ?
                                element.quality_comment : "";


                            if (element.actual_end_time) {
                                diffDate = that.dateDiffInDays(end_date, actual_end_date);
                            }
                            var onTime = null;
                            if (diffDate == null) {
                                onTime = '';
                                onTimeTitle = ''
                            } else {
                                if (isNaN(diffDate)) return;
                                onTime = (diffDate > 0) ? '+' + diffDate : diffDate;
                                 }


                            if (element.qualityStatus_id || element.scope_id || element.actual_end_time) {

                                if (element.qualityStatus_id == 4) {
                                    qualtiystatusColumn = '/../icons/green.svg';
                                    qualtiystatusTitle = "Commitment";
                                } else if (element.qualityStatus_id == 2) {
                                    qualtiystatusColumn = '/../icons/yellow.svg';
                                    qualtiystatusTitle = 'Robust';
                                } else if (element.qualityStatus_id == 3) {
                                    qualtiystatusColumn = '/../icons/orange.svg';
                                    qualtiystatusTitle = 'Warning';
                                } else if (element.qualityStatus_id == 1) {
                                    qualtiystatusColumn = '/../icons/red.svg';
                                    qualtiystatusTitle = 'Off-track';
                                } else {
                                    qualtiystatusColumn = '/../icons/grey.svg';
                                    qualtiystatusTitle = 'No Data';
                                }


                                if (diffDate < 4) {
                                    onTimeSpan = '/../icons/green.svg';
                                    onTimeTitle = 'Commitment';
                                    onTimeColor = "#88B91E";
                                }
                                else if (diffDate < 8 && diffDate > 3) {
                                    onTimeSpan = '/../icons/yellow.svg';
                                    onTimeTitle = 'Robust';
                                    onTimeColor = "#FCCF4D";
                                }
                                else if (diffDate < 11 && diffDate > 7) {
                                    onTimeSpan = '/../icons/orange.svg';
                                    onTimeTitle = 'Warning';
                                    onTimeColor = "#F08802";
                                    //color: #BD9B14;
                                }
                                else if (diffDate > 10) {
                                    onTimeSpan = '/../icons/red.svg';
                                    onTimeTitle = 'Off-track';
                                    onTimeColor = "#E2332D";

                                } else {
                                    onTimeSpan = '/../icons/grey.svg';
                                    onTimeTitle = 'No Data';
                                }

                                if (!element.scope_id) {
                                    scopestatusColumn = '/../icons/grey.svg';
                                    scopestatusTitle = "No Data";
                                }else if (element.scope_id == 4) {
                                    scopestatusColumn = '/../icons/green.svg';
                                    scopestatusTitle = "Commitment";
                                } else if (element.scope_id == 2) {
                                    scopestatusColumn = '/../icons/yellow.svg';
                                    scopestatusTitle = 'Robust';
                                } else if (element.scope_id == 3) {
                                    scopestatusColumn = '/../icons/orange.svg';
                                    scopestatusTitle = 'Warning';
                                } else if (element.scope_id == 1) {
                                    scopestatusColumn = '/../icons/red.svg';
                                    scopestatusTitle = 'Off-track';
                                }


                            } else {
                                if(element.actual_end_time) {
                                    qualtiystatusColumn = onTimeSpan = scopestatusColumn = '/../icons/grey.svg';
                                    qualtiystatusTitle = onTimeTitle = scopestatusTitle = 'No Data';
                                }
                            }
                            if (that.state.editStatus) {
                                return (<tr name={element.name} key={"tr_" + index}>
                                    <td className="tdAlign">{element.name.replace('Release', 'UDN')}</td>
                                    <td className="tdAlign">
                                        {todayDate > eleDate?
                                            <SelectionField
                                                inputID={"qualityStatuslist" + index}
                                                name="scope"
                                                value={scopestatusTitle.replace("No Data","NONE").toUpperCase()}
                                                moduleList={that.props.qualityStatus}
                                                handleChangeModule={that.handleChangeScopeID}
                                            />:null}
                                    </td>
                                    <td>
                                        {todayDate > eleDate?
                                            <textarea
                                                ref={"textArea_scope_comment"+(index+1)}
                                                name="scope" defaultValue={element.scope_comment}
                                                handleChangeFault={that.handleChangeScopeComment}
                                            />:null}
                                    </td>


                                    <td>
                                        {todayDate > eleDate?
                                            <SelectionField
                                                inputID={"qualityStatuslist" + index}
                                                name=""
                                                value={qualtiystatusTitle.replace("No Data","NONE").toUpperCase()}
                                                moduleList={that.props.qualityStatus}
                                                handleChangeModule={that.handleChangeQualtiyID}
                                            />:null}
                                    </td>
                                    <td>
                                        {todayDate > eleDate?
                                            <textarea
                                                ref={"textArea_quality_comment"+(index+1)}
                                                name="fault_found"
                                                defaultValue={element.quality_comment}
                                                handleChangeFault={that.handleChangeQualtiyComment}
                                            />:null}
                                    </td>
                                </tr>)
                            } else {
                                if(selectedVersion == null){
                                    return (<tr name={element.name} key={"tr_" + index}>
                                        <td className="tdAlign releaseQuality">
                                            {element.name.replace('Release', 'UDN')}</td>
                                        <td className="tdAlign releaseQuality">
                                            {/*<img src={statusColumn}/>*/}
                                            {todayDate > eleDate?
                                                <Tooltip label={ scopestatusTitle+"\n"+element.scope_comment } >
                                                    <a href="javascript:void(0)" data-toggle="tooltip">
                                                        <img src={scopestatusColumn} />
                                                    </a>
                                                </Tooltip>:null}
                                        </td>
                                        <td>
                                            {todayDate > eleDate?
                                                <Tooltip
                                                    label={onTimeTitle+
                                                    "\nStartTime: "+element.start_time+" " +
                                                    "\nEndTime: "+element.end_time+" " +
                                                    "\nActualEndTime: "+element.actual_end_time+" "+
                                                    "\nDelay: "+diffDate}>
                                                    <a href="javascript:void(0)" data-toggle="tooltip">
                                                        <img src={onTimeSpan} />
                                                    </a>
                                                </Tooltip>:null}
                                        </td>
                                        <td>
                                            {todayDate > eleDate?
                                                <Tooltip label={ qualtiystatusTitle+"\n" + element.quality_comment } >
                                                    <a href="javascript:void(0)" data-toggle="tooltip">
                                                        <img src={qualtiystatusColumn} />
                                                    </a>
                                                </Tooltip>:null}
                                        </td>
                                    </tr>)
                                }else{
                                    let versionSel = element.number+'';
                                    if(parseFloat(selectedVersion) == parseFloat(versionSel) && onTimeSpan!=null ){
                                        return (<tr name={element.name} key={"tr_" + index}>
                                            <td className="tdAlign releaseQuality">
                                                {element.name.replace('Release', 'UDN')}
                                                </td>
                                            <td className="tdAlign releaseQuality">
                                                {/*<img src={statusColumn}/>*/}
                                                {todayDate > eleDate?
                                                    <Tooltip label={ scopestatusTitle+"\n"+element.scope_comment } >
                                                        <a href="javascript:void(0)" data-toggle="tooltip">
                                                            <img src={scopestatusColumn} />
                                                        </a>
                                                    </Tooltip>:"null"}
                                            </td>
                                            <td>{todayDate > eleDate?
                                                <Tooltip
                                                    label={onTimeTitle+
                                                    "\nStartTime: "+element.start_time+" " +
                                                    "\nEndTime: "+element.end_time+" " +
                                                    "\nActualEndTime: "+element.actual_end_time+" "+
                                                    "\nDelay: "+diffDate}>
                                                    <a href="javascript:void(0)" data-toggle="tooltip">
                                                        <img src={onTimeSpan} />
                                                    </a>
                                                </Tooltip>:null}
                                            </td>
                                            <td>
                                                {todayDate > eleDate?
                                                    <Tooltip label={ qualtiystatusTitle+"\n"+element.quality_comment } >
                                                        <a href="javascript:void(0)" data-toggle="tooltip">
                                                            <img src={qualtiystatusColumn} />
                                                        </a>
                                                    </Tooltip>:null}
                                            </td>
                                        </tr>)
                                    }
                                }

                            }
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    }
}

export default RDUDNStatus