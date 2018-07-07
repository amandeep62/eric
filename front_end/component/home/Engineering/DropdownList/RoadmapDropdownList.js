import {Component} from 'react';
import PropTypes from 'prop-types';
import {getHttpRequest} from "../../../../httprequest/http_connection";
import {store} from "../Store/Store";
import {EngineeringTabEnum} from "../../../../constants/constants"

/**
 * Dropdown list for the Roadmap tab
 */
class RoadmapDropdownList extends Component {

    /**
     * Build the dropdown list for the Roadmap tab. The list includes:
     * - Roadmap option item
     * - Sprint plan option item
     * - list of release versions of UDN for the current year
     * @param props
     * @param context
     */
    constructor(props, context) {

        super(props, context);

        let currentDate = new Date();
        // let currentYear = currentDate.getFullYear();
        this.currentYear = this.props.year ? this.props.year : new Date().getFullYear();
        this.state = {
            versionArray:[],
            selectedVersion:0
        };

        
        this.updateVersionList( this.currentYear );

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);
        this.selectedVersion = tabVersionObject.version;

    }


    updateVersionList( year ){
        getHttpRequest("/versionsByYear?year=" + year, (data, statusCode)=> {
            if(statusCode === 200){
                let versionArray = JSON.parse(data);
                versionArray = this.getVersionArrayBasedOnTab(versionArray, this.props.engineeringTabId);
                //add "Roadmap" option and "Sprint Plan" option in the list
                if(this.selectedVersion > 0){
                    // Actual selection of version starts from 2
                    this.selectedVersion = versionArray[2].version_id;
                    let versionName = versionArray[2].name.replace('Release', 'UDN');
                    store.dispatch({
                        type: 'VERSION_UPDATE',
                        version: parseInt(versionArray[2].version_id),
                        versionName: versionName,
                        tabId: this.props.engineeringTabId
                    });
                    // this.props.onVersionSelectionCallBack(this.selectedVersion, versionName);
                    this.props.onVersionSelectionCallBack
                            ? this.props.onVersionSelectionCallBack(this.selectedVersion, versionName, year)
                            : null;
                }
                else{
                    let selectedVersionState = store.getState();
                    let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);
                    this.props.onVersionSelectionCallBack(this.selectedVersion, tabVersionObject.versionName, year);
                }
                // else{

                // }
                this.setState({
                    selectedVersion:this.selectedVersion,
                    versionArray:versionArray
                });
            }
        });
    }

    /**
     * When receiving updated props, update the dropdown list (the list of versions could have changed in the meantime)
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){
        if(this.currentYear !== nextProps.year){
            this.currentYear = nextProps.year;
            this.updateVersionList( nextProps.year );
        }
    }


    /**
     * While mounting, remember what was the last selected version.
     */
    componentDidMount(){
        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);
        if(this.selectedVersion !== 0 && this.props.onVersionSelectionCallBack){
            this.props.onVersionSelectionCallBack(this.selectedVersion, tabVersionObject.versionName);
        }
    }

    /**
     *
     * @param versionArray
     * @param engineeringTabId
     * @returns {*}
     */
    getVersionArrayBasedOnTab(versionArray, engineeringTabId){

        let currentYear = this.currentYear;
        if (EngineeringTabEnum.ROADMAP.is(parseInt(engineeringTabId))
            ||
            EngineeringTabEnum.ROADMAPUDNVERSION.is(parseInt(engineeringTabId))){

            let sprintVersionObject = versionArray.find(item=>item.name === 'Sprint Plan');
            if(!sprintVersionObject){
                versionArray.unshift({
                    version_id: -1,
                    name:'Sprint Plan',
                    number: -1,
                    date: 'No feature',
                    'type': "release",  //TODO is type correct?
                    relYear: currentYear});
            }

            let roadmapVersionObject = versionArray.find(item=>item.name === 'Roadmap');
            if(!roadmapVersionObject){
                versionArray.unshift({
                    version_id: 0,
                    name: 'Roadmap',
                    number: 0,
                    date: 'No feature',
                    'type': "release",
                    relYear: currentYear
                });
            }
        }
        else if(EngineeringTabEnum.RELEASEDASHBOARD.is(parseInt(engineeringTabId))){
            let versionObject = versionArray.find(item => item.name === 'Sprint Plan');

            if(versionObject){
                versionArray.shift();
            }
        }



        return versionArray;
    }

    /**
     * TODO this is not a list of versions. It's a mix of other options with versions.
     * This even handler is triggered when there is a change in the versions dropdown list selection.
     * @param e - Event object that resulted from this new selection
     */
    onVersionSelect(e){
        let version = e.target.value;
        let versionName = e.target.options[e.target.selectedIndex].innerText;
        this.selectedVersion = parseInt(version);
        this.props.onVersionSelectionCallBack
            ? this.props.onVersionSelectionCallBack(version, versionName, this.currentYear)
            : null;
        store.dispatch({
            type: 'VERSION_UPDATE',
            version: parseInt(version),
            versionName:versionName,
            tabId: this.props.engineeringTabId
        });

        this.setState({selectedVersion:version});
    }


    /**
     * Render the dropdown list
     * @returns {XML}
     */
    render(){
        
        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId == parseInt(this.props.engineeringTabId));
        
        return <select
            className="select-udn"
            onChange={(e)=>this.onVersionSelect(e)}
            value={tabVersionObject.version}>
            {
                this.state.versionArray.map(function (data, index) {

                    return (<option key={index}
                                    value={data.version_id}
                                    name={data.version_id}
                                    id={"version_" + data.version_id}>{data.name.replace('Release', 'UDN')}</option>)
                })

            }
        </select>
    }

}

//Function type checks
RoadmapDropdownList.propTypes = {
    onVersionSelect: PropTypes.func,
};


export default RoadmapDropdownList;
