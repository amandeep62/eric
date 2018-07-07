/*  Created By Sandeep  */

import React, {Component} from 'react';
import UDNSTimeScheduleTableCells from './UDNTimeScheduleTableCells';
import addReleaseField from './AddReleaseData';
import {getAllVersions} from "../../CommonFunction"

class UDNScopeSummary extends Component {

    constructor(props, context) {
        super(props, context);
        let tableHeader = ['UDN Release Schedule', 'Start Date', 'End Date', 'Actual Date'];
        // Binding events
        this.handleChangeOption = this.handleChangeOption.bind(this);
        this.addNewRelease = this.addNewRelease.bind(this);
        this.updateParent = this.updateParent.bind(this);
        this.preventDefaultEvent = this.preventDefaultEvent.bind(this);
        this.closeModel = this.closeModel.bind(this);

        let date = new Date();
        let year = date.getFullYear();
        // Initialize the state
        this.state = {
            versions: [],
            releaseName: '',
            getTimeScheduleData: [],
            tableHeader: tableHeader,
            setEditRef: true,
        };

        getAllVersions(year,(versions)=>{

            this.setState({versions:versions})
            this.initScopeModel(versions);

        })
    }

    /*
    * @Method will do callback once data is available
    * @Parameters (version number, callBackFunctionReference)
    * */
    getDataBasedOnVersionName(firstVersionReleaseNumber, callBackFunctionReference) {
        getHttpRequest("/getReleaseTime?versionName=" + firstVersionReleaseNumber, (results, status) => {
            callBackFunctionReference(results);
        });
    }

    /*
    * @Method to initialize the scope data model value when component loads
    * */
    initScopeModel(versions) {
        /*  var getDataBasedOnVersionName; */

        var formattedArray = this.formattedArray(versions);
        if(formattedArray.length==0){
            return;
        }
        let firstVersionReleaseNumber = formattedArray[0].number;

        //  // Set Release Name variable
        let releaseNameForInputField = 'UDN '+ firstVersionReleaseNumber;

        // Function with (Param : version Number , callBackFunction)
        // Function to get data based on version name
        this.getDataBasedOnVersionName(firstVersionReleaseNumber, (result) => {
            // this is where you get the return value
            let releaseData = JSON.parse(result);
            let addedField = this.addNewFieldToTheObject(releaseData);
            this.setState({
                getTimeScheduleData: addedField,
                releaseName: releaseNameForInputField,
                setEditRef: true
            })
        });
    }

    /*
     *  @Method to return {object} with new key enable field => true or false
     *  @Parameter (release Object)
     */
    addNewFieldToTheObject(releaseData) {
        let addingNewField = [];
        if (releaseData.rows.length > 0) {
            releaseData.rows.map(function (element) {
                element.disableButton = element.phase_name !== "Deployment to Production";
                addingNewField.push(element)
            })
        }
        else {
            addingNewField = addReleaseField;
        }
        return addingNewField;
    }

    /*
     *  @Changed option handleChangeOption event will to return new {object}
     */

    handleChangeOption(event, versionReleaseNumber) {
        let releaseNameForInputField = 'UDN ' + versionReleaseNumber;
        this.getDataBasedOnVersionName(versionReleaseNumber, (result) => {
            // this is where you get the return value
            let releaseData = JSON.parse(result);
            let addedField = this.addNewFieldToTheObject(releaseData);
            this.setState({
                getTimeScheduleData: addedField,
                releaseName: releaseNameForInputField
            })
        });

    }

    /*
    *  @ Event to addNewRelease to the version
    *
    * */

    addNewRelease() {
        let array = [];
        getHttpRequest('/getReleasePhaseList', (results, status) => {
            let result = JSON.parse(results);
            if (result) {
                result.rows.map(function (element) {
                    if (!element.start_time || !element.end_time || !element.actual_end_time) {
                        element.disableButton = element.phase_name !== "Deployment to Production";
                        element.start_time = '';
                        element.end_time = '';
                        element.actual_end_time = '';
                    }
                    array.push(element)
                });
            }
            this.setState({
                getTimeScheduleData: array,
                releaseName: '',
                setEditRef: false
            })
        });
    }

    deleteRelease() {
        var version_number = $("#selectOption").val();
        var that = this;

        var r = confirm("Are you sure you want to delete version : " + version_number + " ?");
        if (r == true) {
            getHttpRequest('/deleteRelease?version_id=' + version_number, function (result) {
                if (result == 'success') {
                    that.props.getUpdatedVersions();
                } else {
                    alert(result);
                }

            });
        }
        this.closeModel();
    }

    /* @ Event Emitted from child if input value changes  */
    updateParent(childEmittedData) {
        let changedArrayData = [];
        this.state.getTimeScheduleData.map(function (element, index) {
            if (childEmittedData.cellIndex === index) {
                changedArrayData.push(childEmittedData.timeScheduleTableCellData)
            } else {
                changedArrayData.push(element)
            }

        });
        this.setState({
            getTimeScheduleData: changedArrayData
        })
    }

    /*  @ Showing waring if we assign state value directly so created this method  */

    preventDefaultEvent(event, element) {
        this.setState({
            releaseName: element
        })
    }

    /*
      @ onClick event to close the Model
    */
    closeModel() {

        this.props.closeModal();
    }

    /*
     Submitting form to db
   */
    submitForm() {
        let validForm = true;
        let requestBody;
        this.state.getTimeScheduleData.map((element) => {
            if (element.phase_id === '') {
                validForm = false
            }
            if (element.start_time === '') {
                validForm = false
            }
            if (element.end_time === '') {
                validForm = false
            }
            if (element.actual_end_time === '' && element.disableButton === false) {
                //  validForm = false
            }
        });
        if (!validForm) {
            alert('Please fill all the fields');
            return;
        }

        if (!!this.state.getTimeScheduleData[0].version_id) {

            requestBody = {
                data: this.state.getTimeScheduleData,
                "version_id": parseInt(this.state.getTimeScheduleData[0].version_id),
                'version_name': this.state.getTimeScheduleData[0].name
            };

        } else {
            requestBody = {
                data: this.state.getTimeScheduleData,
                "version_id": null,
                'version_name': $('.searchInputBox').val()
            };
            /*  "version_id" :null,
               'version_name' :$('.searchInputBox').val()*/

        }
        postHttpRequest("/updateReleaseTimeSchedule", requestBody, function (res,statusCode) {
            if (statusCode==201) {

            }
        });

        // "version_id" :null,
        //    'version_name' :$('.searchInputBox').val()
        // this.props.refreshVersions();

        this.setState({
            getTimeScheduleData: addReleaseField,
            setEditRef: true
        });
        this.closeModel();
    }

    formattedArray(versions) {

        let formatted = [];
        versions.map((element) => {
            if (element.name === 'Summary' || element.name === 'Unmapped') {
                return;
            }
            formatted.push(element);
        });
        return formatted;
    }

    render() {
        let formattedArray = this.formattedArray(this.state.versions);

        if (this.state.getTimeScheduleData.length > 0) {
            return (<div className="modal fade-in col-lg-12 in udn-modal" id="scopeModal" tabIndex="-1" role="dialog"
                         aria-labelledby="ScopeModal" aria-hidden="true" style={{display: "block"}}>
                    <div className="modal-dialog road-map-content modal-dialog modal-lg" role="document">
                        <div className="modal-content" id="road-well">
                            <div className="modal-header road-well">
                                <a title="Close" onClick={(e) => this.closeModel()}>
                                    <i className="glyphicon glyphicon-remove icon-arrow-right pull-right closeIcon"></i></a>
                                <button type="button" className="close btn btn-primary doneBtn"
                                        onClick={(e) => this.submitForm()}>Done
                                </button>
                                <h4 className="modal-title titleModalRoad">Edit Time Schedule</h4>
                            </div>
                            <div className="modal-body road-well">
                                <div className='row'>
                                    <div className="col-sm-3 release-list-option">
                                        <div className="dropdown">
                                            <select id="selectOption" onChange={(e) => {
                                                this.handleChangeOption(e, e.target.value)
                                            }}>
                                                {
                                                    formattedArray.map(function (data, index) {
                                                        return (
                                                            <option name={data} key={index}
                                                                    value={data.number}>{data.name.replace('Release','UDN')}</option>
                                                        )

                                                    })
                                                }
                                            </select>
                                        </div>
                                        <div className="addRelease" onClick={() => {
                                            this.addNewRelease()
                                        }}>
                                            <button className="btn btn-primary">Add Release</button>
                                            <button className="btn btn-primary" onClick={(event) => {
                                                this.deleteRelease()
                                            }}>Delete Release
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-9">
                                        <div className="searchBox">
                                            <p>
                                                <span className="searchBoxTitle">Release Name </span>
                                                <input className="form-control searchInputBox" type="text"
                                                       value={this.state.releaseName}
                                                       onChange={(e) => {
                                                           this.preventDefaultEvent(e, e.target.value)
                                                       }}
                                                       name="search"/>
                                            </p>
                                        </div>
                                        <table className='table-bordered'>
                                            {/*Table Header*/}
                                            <thead>
                                            <tr className='scopeModelHeader'>
                                                {this.state.tableHeader.map((element, index) => {
                                                    return (<th key={element}>{element}</th>)
                                                })}
                                            </tr>
                                            </thead>
                                            {/*Table Body*/}
                                            <tbody>
                                            {this.state.getTimeScheduleData.map((element, index) => {
                                                return (<UDNSTimeScheduleTableCells dataElement={element} key={index}
                                                                                    cellIndex={index}
                                                                                    timeScheduleData={this.state.getTimeScheduleData}
                                                                                    updateParent={this.updateParent}/>)
                                            })
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (<div>.</div>)
        }
    }
}

export default UDNScopeSummary;

