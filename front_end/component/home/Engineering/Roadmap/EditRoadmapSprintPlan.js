import React, { Component } from 'react'
import { postHttpRequest } from "../../../../httprequest/http_connection";
import { MultiSelect } from 'primereact/components/multiselect/MultiSelect';
import {getAllVersions,hashCode} from "../CommonFunction";
import RoadmapOperation from './RoadmapOperation';
import "./sprintPlanView.less";
class EditRoadmapSprintPlan extends Component {

    constructor(props, context) {
        super(props, context);

        this.addNewRow = this.addNewRow.bind(this);
        this.versionCheckboxSelection = this.versionCheckboxSelection.bind(this);
        this.closeModal = this.closeModal.bind(this);
        let dict = this.props.versionsArray[0];
        let firstVersionId = dict["number"];
        let selectedDataArray = [];
        this.roadmapOperation = new RoadmapOperation();

        this.state = ({
            setInitialValue: true,
            dataArray: this.props.dataArray,
            selectedDataArray: selectedDataArray,
            selectedVersionId: firstVersionId,
            selectedVersion: '',
            releases: [],
            descriptionArray:[],
            versionArray:[],
            versionSelectionArray:[]
        });

        let currYear = new Date().getFullYear();
        getAllVersions(currYear,(versionArray)=> {
                this.setState({versionArray:versionArray});
            }
        );
    }

    closeModal() {
        this.props.closeModal();
    }



    removeItem(subElement, indexNumber) {

        let that = this;
        let removeElementFromArray = subElement;
        let selectedDataArray = this.state.descriptionArray;
        if (confirm('Are you sure you want to delete?')) {
            selectedDataArray.splice(indexNumber, 1); // Removing element from array


            let body = {
                "version_id": this.state.releases,
                "elementName": removeElementFromArray
            };


            postHttpRequest('/deleteTimeScheduleFeature', body, function (data) {
                that.props.loadSprintData();
                that.setState({
                    descriptionArray: selectedDataArray
                });
            });
        }


    }

    submitFormData() {
        let that = this;


        if(this.state.descriptionArray.length==0){
            this.props.loadSprintData();
            this.closeModal();
            return;
        }
        let descriptionArray=new Array;
        this.state.descriptionArray.map(function (element,index) {
            let inputDescription = that.refs["inputDescription"+(index+1)]
            let description= inputDescription.refs["txtDescription_"+(index+1)].value;
            descriptionArray.push(description)
        })

        let bodySelectedVersion=[];
        this.state.releases.map(function (version) {
            let dictVersion= that.props.roadmapData.find(item=>item.number==version)

            dictVersion.description = descriptionArray
            bodySelectedVersion.push(dictVersion)
        })

        postHttpRequest('/updateReleaseSummery', bodySelectedVersion, function (res) {
            setTimeout(function () {
                that.props.loadSprintData();
                that.closeModal();
            },500);
        })

     }


    addNewRow() {

        let descriptionArray = this.state.descriptionArray;
        descriptionArray.push("");
        this.setState({
            descriptionArray: descriptionArray,
        });

    }


    versionCheckboxSelection(event) {

        let groupVersionArray = this.props.groupVersionArray
        let versionSelectionArray = event.value;
        let versionCombined = versionSelectionArray.join(", ");
        let newArray=  groupVersionArray.find(item=>item.version.includes(versionCombined) && versionCombined!="");
        let descriptionArray=newArray?newArray.description:[];

        this.setState({
            releases: event.value,
            descriptionArray:descriptionArray
        })

    }

    render() {
        let that = this;
        let releases = [];
        this.state.versionArray.map(element => {

            releases.push({
                value: element.number,
                label: "UDN "+element.number
            });

        });

        return (<div className="modal fade in col-lg-12 show udn-modal" id="editRoadMap" tabIndex="-1" role="dialog"
            aria-labelledby="ScopeModal" aria-hidden="true">
            <div className="modal-dialog road-map-content modal-dialog modal-lg" role="document">
                <div className="modal-content" id="road-well-yearly">
                    <div className="modal-header road-well">
                        <a title="Close" onClick={this.closeModal}>
                            <i className="glyphicon glyphicon-remove icon-arrow-right pull-right closeIcon"></i></a>
                        <button type="button" className="close btn btn-primary doneBtn"
                            onClick={(e) => that.submitFormData()}>Done
                            </button>
                        <h4 className="modal-title titleModalRoad">Edit Features</h4>
                    </div>
                    <div className="modal-body road-well-yearly">
                        <div className="row">
                            <div className="col-sm-3 release-list-option">
                                <div className="dropdown">
                                    <MultiSelect value={this.state.releases} options={releases} onChange={(e) => this.versionCheckboxSelection(e)} filter={true} className="releaseList" defaultLabel="Summary" />
                                </div>
                            </div>
                            <div className="col-sm-9">
                                <div className="table-container-edit-feature">
                                    <table className="table table-striped editFeatureSummary">
                                        <thead className="yearlyEdit">
                                            <tr>
                                                <th>Features</th>
                                                <th>&nbsp;</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.descriptionArray.map(function (descriptionText, index) {

                                                    return <tr id={"summmaryFeature" + index} className="featureName"
                                                        key={"row" + index}>
                                                        <td className="featureName feature">
                                                            <InputDescription ref={"inputDescription"+(index+1)}
                                                                              value={descriptionText}
                                                                              index={index}
                                                            />
                                                        </td>
                                                        <td className="crossIcon">
                                                            <span
                                                                className="glyphicon glyphicon-remove removeYearlyPlan"
                                                                onClick={(e) => that.removeItem(descriptionText, index)}>
                                                                &nbsp;
                                                                </span>
                                                        </td>
                                                    </tr>
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="addMoreBtn pull-right">
                                    <button className="btn btn-udn-green" onClick={(e) => that.addNewRow()}>Add More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        )

    }
}


class InputDescription extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {value: this.props.value};
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.value!=""){
            this.setState({value:nextProps.value});
        }

    }


        render(){

        return <input ref={"txtDescription_" + (this.props.index + 1)}
                      type="text" value={this.state.value}
                      onChange={(e)=>this.setState({value:e.target.value})}  />
    }
}

export default EditRoadmapSprintPlan
