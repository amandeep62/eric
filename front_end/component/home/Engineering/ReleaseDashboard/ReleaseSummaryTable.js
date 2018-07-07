import React, {Component} from 'react';
// import Tooltip from '../../Tools/ToolTipCustomComponent';
import Tooltip from '../../globals/Helpers/Tooltip/Tooltip';
import {EngineeringTabEnum, userPermissions} from '../../../../constants/constants';
import {store} from "./../../Engineering/Store/Store"



class ReleaseSummaryTable extends Component{
    constructor(props, context) {
        super(props, context);
        this.getSelectedVersion = this.getSelectedVersion.bind(this);
        this.dateDiffInDays = this.dateDiffInDays.bind(this);
        this.handleChangeQualtiyID = this.handleChangeQualtiyID.bind(this);
        this.handleChangeScopeID = this.handleChangeScopeID.bind(this);
/*
        These methods were empty. They were called inside of the <textarea> as a property
        that didn't belong to textarea. 
        this.handleChangeScopeComment = this.handleChangeScopeComment.bind(this);
        this.handleChangeQualtiyComment = this.handleChangeQualtiyComment.bind(this);
*/
        this.saveStatusChanges = this.saveStatusChanges.bind(this);
        this.cancelEditView = this.cancelEditView.bind(this);
        this.changeEditState = this.changeEditState.bind(this);

        // For Tooltip Hover functions
        this.handleHoverOn = this.handleHoverOn.bind(this);
        this.handleHoverOff = this.handleHoverOff.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);



        this.qualityStatus= [{id:1000,name:"NONE"},
            {id:1,name:"OFF-TRACK"},
            {id:2,name:"ROBUST"},
            {id:3,name:"WARNING"},
            {id:4,name: "COMMITMENT"},
        ],
        this.state = {
            timePlanData:[],
            editStatus: false,
            tooltipVisibility: false,
            tooltipPosition     : { x:0, y:0 },
            tooltipLabel        : 'null'
        };
        this.getSelectedVersion();
    }

    getSelectedVersion(){
        let that = this;
        /* get release status and comments */
        let selectedModuleState = store.getState();
        let engineeringTabObject = selectedModuleState.find(item => item.tabId === EngineeringTabEnum.RELEASEDASHBOARD.value);
        getHttpRequest("/releaseDashboardByYear?year=" + engineeringTabObject.year, (releaseQdata) =>{
            let releaseQd = JSON.parse(releaseQdata);
                releaseQd.sort(function(a, b){
                    let keyA = a.version_id,
                        keyB = b.version_id;
                    if(keyA < keyB) return -1;
                    if(keyA > keyB) return 1;
                    return 0;
                });

                releaseQd = releaseQd.filter( (item) => {
                    // if(item.actual_end_time && item.actual_end_time !== "")
                        return item;
                });
                that.setState({
                    timePlanData: releaseQd
                });
        });
    }

    handleChangeQualtiyID(value,index){

        index =  index.replace('qualityStatuslist','');
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
        this.state.timePlanData.map(function (data,index1) {
            if(Number(index1) == Number(index)){
                data.qualityStatus_id = qualtiystatusTitle;
            }
        })
    }

    handleChangeScopeID(value,index){

        index =  index.replace('qualityStatuslist','');

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
        this.state.timePlanData.map(function (data,index1) {
            if(Number(index1) == Number(index)){
                data.scope_id = qualtiystatusTitle
            }
        })
    }

    dateDiffInDays(startDate, endDate) {
        let millisecPerDay = 1000 * 60 * 60 * 24;
        if (endDate == null) return -1;
        return Math.floor((endDate - startDate) / millisecPerDay);
    }

    cancelEditView(){
        this.setState({
            editStatus: false
        });
    }

    saveStatusChanges(){
        let that = this;
            let timePlanData= this.state.timePlanData;
            timePlanData.filter(function (element,index,array) {
                if(that.refs["dropDownListScope"+index] && that.refs["dropDownListQuality"+index]) {

                    let scopeId = that.refs["dropDownListScope" + index].value;
                    let qualityId = that.refs["dropDownListQuality" + index].value;
                    element.scope_id = parseInt(scopeId);
                    element.qualityStatus_id = parseInt(qualityId);

                }
                element.scope_id=element.scope_id==undefined?1000:element.scope_id;
                element.qualityStatus_id=element.qualityStatus_id==undefined?1000:element.qualityStatus_id;
                element.quality_comment= that.refs["textArea_quality_comment"+(index+1)]?that.refs["textArea_quality_comment"+(index+1)].value: element.quality_comment;
                //element.quality_comment = element.quality_comment.replace(/'/g, "''");
                element.scope_comment= that.refs["textArea_scope_comment"+(index+1)]?that.refs["textArea_scope_comment"+(index+1)].value:element.scope_comment;

                array[index]=element;
            });



           // var timePlanDataStr = JSON.stringify(timePlanData);
            //timePlanDataStr = timePlanDataStr.replace(/(?:\r\n|\r|\n)/g, '<br />');
            //timePlanDataStr = timePlanDataStr.replace(/'/g, "''")
            //timePlanData = JSON.parse(timePlanDataStr);

        postHttpRequest("/updateReleaseQuality?", timePlanData, function (data,statusCode) {
                if (statusCode==200) {

                    that.setState({
                        editStatus: false
                    });
                }
            });
    }

    changeEditState() {
        this.setState({
            editStatus: true
        })
    }



    /**
     * @description Invoked when the mouse moves, controlls the position of the tooltip.
     * @param {*} event
     */
    //onMouseMove
    handleHoverOn(event){
        this.setState({
            tooltipPosition: {
                x : event.clientX + 5,
                y : event.clientY - 30
            },
            tooltipVisibility : true
        });
    }

    /**
     * @description Invoked when mouse enters a sector
     * @param {*} label
     * @param {*} color
     */
    //onMouseEnter
    handleMouseEnter(label){
        this.setState({
            //tooltipLabel : label,
            // tooltipColor : color,
            tooltipVisibility: true,
            tooltipLabel:label
        });
    }

    /**
     * @description Invoked when mouse leaves a sector
     */
    //onchartMouseLeave
    handleHoverOff(){
        this.setState({
            tooltipVisibility: false
        });
    }

    render(){
        let that = this;
        let selectedVersion=null;

        // This portion of code is added to check if any of the releases are editable or not
        let editEnabled = 0;
        that.state.timePlanData.map( (element) => {
            let todayDate = new Date();
            let eleDate = new Date(element.start_time);
            if(!(todayDate > eleDate))
                editEnabled ++;
        });
        
        // ****** change code ends here **********8

        if(this.props.currentSelectedVersion){
            selectedVersion = this.props.currentSelectedVersion;
        }
        return <div>
            {localStorage.userPermissions == userPermissions ? <div className="pull-right col-md-12 summery-btns">
                {this.state.editStatus ?
                    <span>
                            { !editEnabled ? <button value="addTheme" className="addThemeGreen pull-right btn-udn-green" id="addTheme"
                                    onClick={this.saveStatusChanges}>Save
                            </button> : null }
                            <button value="addTheme" className="addThemeGreen pull-right btn-udn-green" id="addTheme"
                                    onClick={this.cancelEditView}>Cancel
                            </button>
                        </span>
                    :
                    <button value="addTheme" className="addThemeGreen pull-right btn-udn-green" id="addTheme"
                            onClick={this.changeEditState}>Edit Table
                    </button>
                }
            </div> : null}
            <div>
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
                        let actual_end_date = element.actual_end_time && element.actual_end_time !== "" ? new Date(element.actual_end_time) : null;
                        let diffDate = null;
                        let onTimeColor;
                        let todayDate = new Date();
                        let eleDate = new Date(element.start_time);
                        element.scope_comment = element.scope_comment ? element.scope_comment : "";
                        element.quality_comment = element.quality_comment ? element.quality_comment : "";
                        if (element.actual_end_time) {
                            diffDate = that.dateDiffInDays(end_date, actual_end_date);
                        }
                        let onTime = null;
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

                            if (element.scope_id == 4) {
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
                            } else{
                                scopestatusColumn = '/../icons/grey.svg';
                                scopestatusTitle = "No Data";
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
                                        <select ref={"dropDownListScope" + index} className="dropdown-button" id="qualityOptionlist" defaultValue={element.scope_id}>
                                            {
                                                that.qualityStatus.map((data,index)=> {
                                                    return (<option key={"option" + index} value={data.id}
                                                                    className="dropdown-item">{data.name}</option>)
                                                })
                                            }
                                        </select>
                                    :null}
                                </td>
                                <td>
                                    {todayDate > eleDate?
                                    <textarea
                                        ref={"textArea_scope_comment"+(index+1)}
                                        name="scope" defaultValue={element.scope_comment}
                                    />:<span>Not Yet Started</span>}
                                </td>
                                <td>
                                    {todayDate > eleDate?
                                    <select ref={"dropDownListQuality" + index} className="dropdown-button" id="qualityOptionlist" defaultValue={element.qualityStatus_id}>
                                        {
                                            that.qualityStatus.map((data,index)=> {
                                                return (<option key={"option" + index} value={data.id}
                                                                className="dropdown-item">{data.name}</option>)
                                            })
                                        }
                                    </select>:null}
                                </td>
                                <td>
                                    {todayDate > eleDate?
                                    <textarea
                                        ref={"textArea_quality_comment"+(index+1)}
                                        name="fault_found"
                                        defaultValue={element.quality_comment}
                                    />:null}
                                </td>
                            </tr>)
                        } else {
                            
                            if(selectedVersion == null){
                                return (<tr name={element.name} key={"tr_" + index}>
                                    <td className="tdAlign releaseQuality">{element.name.replace('Release', 'UDN')}</td>
                                    <td className="tdAlign releaseQuality">
                                        {/*<img src={statusColumn}/>*/}
                                        {todayDate > eleDate? 
                                            <a href="javascript:void(0)" data-toggle="tooltip">
                                                {scopestatusColumn && actual_end_date ?
                                                <img 
                                                    onMouseEnter={() => that.handleMouseEnter(scopestatusTitle+"\n"+element.scope_comment)}
                                                    onMouseMove={(event) => that.handleHoverOn(event)}
                                                    onMouseLeave={() => that.handleHoverOff()}
                                                    src={scopestatusColumn}/>: null}
                                            </a> :null}
                                    </td>
                                    <td>
                                        {todayDate > eleDate?
                                            <a href="javascript:void(0)" data-toggle="tooltip">
                                                { actual_end_date ? <img
                                                    onMouseEnter={() => that.handleMouseEnter(onTimeTitle+
                                                        "\nStartTime: "+element.start_time+" " +
                                                        "\nEndTime: "+element.end_time+" " +
                                                        "\nActualEndTime: "+element.actual_end_time+" "+
                                                        "\nDelay: "+diffDate)}
                                                        onMouseMove={(event) => that.handleHoverOn(event)}
                                                        onMouseLeave={() => that.handleHoverOff()} 
                                                    src={onTimeSpan} /> : null}
                                            </a>:null}
                                    </td>
                                    <td>
                                        {todayDate > eleDate?
                                            <a href="javascript:void(0)" data-toggle="tooltip">
                                                {qualtiystatusColumn && actual_end_date ?
                                                <img 
                                                    onMouseEnter={() => that.handleMouseEnter(qualtiystatusTitle + "\n" + element.quality_comment)}
                                                    onMouseMove={(event) => that.handleHoverOn(event)}
                                                    onMouseLeave={() => that.handleHoverOff()} 
                                                    src={qualtiystatusColumn} /> : null}
                                            </a>:null}
                                    </td>
                                </tr>)
                            }else{
                                let versionSel = element.name.replace('Release', '');
                                if(selectedVersion == versionSel){
                                    return (<tr name={element.name} key={"tr_" + index}>
                                        <td className="tdAlign releaseQuality">{element.name.replace('Release', 'UDN')}</td>
                                        <td className="tdAlign releaseQuality">
                                            {/*<img src={statusColumn}/>*/}
                                            {todayDate > eleDate?
                                                <a href="javascript:void(0)" data-toggle="tooltip">
                                                    {scopestatusColumn}
                                                    <img
                                                        onMouseEnter={() => that.handleMouseEnter(scopestatusTitle+"\n"+element.scope_comment)}
                                                        onMouseMove={(event) => that.handleHoverOn(event)}
                                                        onMouseLeave={() => that.handleHoverOff()}
                                                        src={scopestatusColumn} />
                                                </a>:null}
                                        </td>
                                        <td>{todayDate > eleDate?
                                                <a href="javascript:void(0)" data-toggle="tooltip">
                                                    <img
                                                        onMouseEnter={() => that.handleMouseEnter(onTimeTitle+
                                                        "\nStartTime: "+element.start_time+" " +
                                                        "\nEndTime: "+element.end_time+" " +
                                                        "\nActualEndTime: "+element.actual_end_time+" "+
                                                        "\nDelay: "+diffDate)}
                                                        onMouseMove={(event) => that.handleHoverOn(event)}
                                                        onMouseLeave={() => that.handleHoverOff()}
                                                        src={onTimeSpan} />
                                                </a>:null}
                                        </td>
                                        <td>
                                            {todayDate > eleDate?
                                                <a href="javascript:void(0)" data-toggle="tooltip">
                                                    {qualtiystatusColumn}
                                                    <img
                                                        onMouseEnter={() => that.handleMouseEnter(qualtiystatusTitle + "\n" + element.quality_comment)}
                                                        onMouseMove={(event) => that.handleHoverOn(event)}
                                                        onMouseLeave={() => that.handleHoverOff()} 
                                                        src={qualtiystatusColumn} />
                                                </a>:null}
                                        </td>
                                    </tr>)
                                }
                            }
                        }
                    })}
                </tbody>
            </table>
        </div>
        <Tooltip
                position = { this.state.tooltipPosition }
                label = {this.state.tooltipLabel}
                inverted = {true}
                visible = {this.state.tooltipVisibility}  />
    </div>
    }
}

export default ReleaseSummaryTable;