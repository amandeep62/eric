/**
 * @description Component container for Release Dashboard module
 *
 */
import React, {Component} from 'react';
import ReleaseSummaryTable from './ReleaseSummaryTable';
import RDScope from './RDComponent/RDScope';
import RDStatus from './RDComponent/RDStatus';
import RDUDNStatus from './RDComponent/RDUDNStatus';
import RDCapacity from './RDComponent/RDCapacity';
import {EngineeringTabEnum} from '../../../../constants/constants';
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle'
import {store} from "../Store/Store"
import RDQuality from './RDComponent/RDQuality'
import RDFST from './RDComponent/RDFST'
import './ReleaseDashboard.less'

class UDNReleaseDashboard extends Component {
    /***
     * @description Constructor
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.onVersionSelectCallback = this.onVersionSelectCallback.bind(this);
        this.onYearSelectCallBack = this.onYearSelectCallBack.bind(this);

        this.releaseSummaryTable = null;
        let selectedVersionState = store.getState();
        let tabVersionObject =
            selectedVersionState.find(item => item.tabId === EngineeringTabEnum.RELEASEDASHBOARD.value);
        let versionId = tabVersionObject.version;
        let versionNumber = tabVersionObject.versionNumber;
        let rdState = this.getRDState();

        this.state = {
            timePlanData:[],
            qualityStatus: ["NONE", "COMMITMENT", "ROBUST", "WARNING", "OFF-TRACK"],
            selectedYear: rdState.year,
            versionId: versionId,
            versionNumber:versionNumber,
            editStatus: false
        }
    }

    /**
     * @description Get the current state of Release Dashboard.
     * @return {Object | Store}  Store object represent the Release Dashboard state.
     */
    getRDState() {
        let rdStore = store.getState();
        let rdState = rdStore.find(item => item.tabId === EngineeringTabEnum.RELEASEDASHBOARD.value);
        return rdState;
    }

    /**
     * @description Callback on Change of Version Dropdown
     * @param versionId : Dropdown Selected Version Id
     * @param versionNumber : Dropdown Selected Version Number
     */
    onVersionSelectCallback(versionId, versionNumber){
        this.setState({versionId:versionId, versionNumber:versionNumber});
    }

    /**
     * @description Callback on Selection of Year Dropdown
     * @param year
     */
    onYearSelectCallBack(year){
        this.refs.releaseSummaryTable ? this.refs.releaseSummaryTable.getSelectedVersion() : null;
    }

    componentDidMount(){
        document.title = "Release Dashboard";
    }


    render() {
        return <div className="row summeryTable">
            <EngineeringTitle
                title ="RELEASE DASHBOARD TABLE"
                engineeringTabId={EngineeringTabEnum.RELEASEDASHBOARD.value}
                onVersionSelectCallback={this.onVersionSelectCallback}
                onYearSelectCallBack={this.onYearSelectCallBack}
            />
            {this.state.versionId === 0
                ? <div className="col-md-8 center-block qualityReleaseTable">
                    <ReleaseSummaryTable ref="releaseSummaryTable"
                                         releaseSummaryTable={this.releaseSummaryTable}
                                         timePlanData={this.state.timePlanData}
                                         selectedYear={this.props.selectedYear}
                                         qualityStatus={this.state.qualityStatus} />
                </div>
                : <div className="container-dashboard">
                    <RDScope versionId={this.state.versionId} />
                    <RDUDNStatus
                        currentSelectedVersion={this.state.versionNumber}
                        selectedYear={this.state.selectedYear}
                        qualityStatus={this.state.qualityStatus}
                        editStatus={this.state.editStatus}
                        moduleList={this.props.moduleList}
                        moduleSelected={"ALL"}  />
                    <RDCapacity />
                    <RDQuality
                        currentSelectedVersion={this.state.versionNumber}
                        currentSelectedVersionId={this.state.versionId}/>
                    <RDFST
                        currentSelectedVersion={this.state.versionNumber}
                        currentSelectedVersionId={this.state.versionId}/>
                    <RDStatus
                        currentSelectedVersion={this.state.versionNumber}
                        currentSelectedVersionId={this.state.versionId}/>
                </div>}
        </div>
    }
}
export default UDNReleaseDashboard;