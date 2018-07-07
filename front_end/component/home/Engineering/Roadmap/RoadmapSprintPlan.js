import React, { Component } from 'react'
import RoadmapSummaries from './roadmapSummaries'
import EditRoadmapSprintPlan from './EditRoadmapSprintPlan'
import {userPermissions} from '../../../../constants/constants';
import RoadmapOperation from './RoadmapOperation'

class RoadmapSprintPlan extends Component {
    constructor(props, context) {
        super(props, context);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.loadSprintData = this.loadSprintData.bind(this);

        this.roadmapOperation = new RoadmapOperation();
        var currYear = new Date().getFullYear();
        this.state = ({
            roadmapData: [],
            sprintPlanData: [],
            capabilities: [],
            selectedSession: 2,
            selectedYear: 0,
            roadmapDataFix: [],
            versionsArray: [],
            selYear: currYear,
            isModalOpen:false,
        });
        this.selectedYear = this.props.year ? this.props.year : new Date().getFullYear();
        this.loadSprintData(this.selectedYear);
    }

    loadSprintData(selectedYear){
        var currYear = new Date().getFullYear();
        this.roadmapOperation.getAllSprintData(selectedYear, (roadmapData, capabilities, sprintDataArray, versionArray)=>{
            this.setState({
                roadMap: roadmapData,
                roadmapData: roadmapData.rows,
                roadmapDataFix: roadmapData.rows,
                selectedYear: selectedYear,
                capabilities: capabilities.rows,
                capabilitiesFix: capabilities.rows,
                sprintPlanData: sprintDataArray,
                versionsArray:versionArray,
                selYear: currYear
            });
        })
    }
    
    componentWillReceiveProps(nextProp){
        
        if(this.selectedYear !== nextProp.year){
            this.selectedYear = nextProp.year;
            this.loadSprintData(nextProp.year);
        }
        
    }

    onYearSelect(selectedYear){
        this.loadSprintData(selectedYear);
    }

    componentDidUpdate() {
        this.roadmapOperation.updateRoadMap(this.state.roadmapData);
    }

    openModal() {
        this.setState({isModalOpen:true})
    }

    closeModal() {

        this.setState({isModalOpen:false})
    }

    render() {

        let dataArray = this.roadmapOperation.prepareSprintPlanDataArray(this.state.versionsArray,this.state.capabilities,
                                                                        this.state.roadmapData,
                                                                        this.state.roadmapDataFix);

        let groupVersionArray = this.roadmapOperation.sprintVersionGroup(dataArray);

        return ( <div className="content-descpriton col-md-12">
                    <div className="roadmap-list_items">
                        <span className="demoSelection">{this.state.selectedYear}</span>
                    </div>
                    <div className="scaling-svg-container" id="roadmapChart"></div>
                    <div style={{position: 'relative'}}>
                        <RoadmapSummaries dataArray={dataArray} groupVersionArray={groupVersionArray} />
                        {localStorage.userPermissions == userPermissions?
                            <div className="pull-right editRoadMapItems" onClick={this.openModal}>
                                <a className="editRoadMap badge">
                                    <h6 className="glyphicon glyphicon-pencil fa-lg"></h6>
                                </a>
                            </div> : ""}
                        {dataArray && dataArray.length > 0 && this.state.versionsArray.length > 0 && this.state.isModalOpen ?
                             <EditRoadmapSprintPlan versionsArray={this.state.versionsArray}
                                                   dataArray={dataArray}
                                                   roadmapData={this.state.roadmapData}
                                                    groupVersionArray={groupVersionArray}
                                                    loadSprintData={this.loadSprintData}
                                                   closeModal={this.closeModal}

                            />: null}
                    </div>

                </div>
        )

    }
}

export default RoadmapSprintPlan
