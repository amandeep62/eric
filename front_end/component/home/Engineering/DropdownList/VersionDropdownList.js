import {Component} from 'react';
import PropTypes from 'prop-types';
import {store} from "../Store/Store";
import {getAllVersions, getVersionSummary} from "../CommonFunction";

/**
 * Dropdown list of versions of a specific year
 */
class VersionDropdownList extends Component {

    /**
     * Build the dropdown list of release versions of UDN by giving current the year as an input.
     * @param props
     * @param context
     */
    constructor(props, context) {

        super(props, context);

        //Method bindings
        this.onVersionSelect = this.onVersionSelect.bind(this);

        this.currentYear = this.props.year ? this.props.year : new Date().getFullYear();

        this.state = {
            versionArray:[],
            selectedVersion:0
        };


    }

    /**
     * Wait until the component is mounted before rendering the version list
     */
    componentDidMount() {

        let selectedVersionState = store.getState();
        let tabObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);

        this.currentYear = tabObject.year;

        getAllVersions(this.currentYear, (versionArray) => {

            //add a "Summary" option if needed
            if (this.props.summaryOptionEnabled) {
                getVersionSummary((summaryData) => {

                    if (summaryData) {
                        versionArray.unshift(summaryData);
                    }

                    //set the version list in the dropdown list
                    //and set the current version
                    this.setState({
                        versionArray: versionArray,
                    });
                });
            }
            else {
                //set the version list in the dropdown list
                this.setState({
                    versionArray: versionArray,
                });
            }

        });
    }


    /**
     * When receiving updated props, update the dropdown list (the list of versions could have changed in the meantime)
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){
        // let versionArray = this.state.versionArray;
        if(this.currentYear !== nextProps.year){
            this.currentYear = nextProps.year;
            this.updateVersionsList( nextProps.year );
        }
    }

    updateVersionsList( year ){
        getAllVersions(year, (versionArray) => {
            //add a "Summary" option if needed
            if (this.props.summaryOptionEnabled) {
                getVersionSummary((summaryData) => {

                    if (summaryData) {
                        versionArray.unshift(summaryData);
                    }
                    //first store everything
                    store.dispatch({
                        type: 'VERSION_UPDATE',
                        version: parseInt(versionArray[0].version_id),
                        versionNumber:versionArray[0].number,
                        tabId: this.props.engineeringTabId
                    });
                    //set the version list in the dropdown list
                    //and set the current version
                    
                    this.setState({
                        versionArray: versionArray,
                    });
                    if (typeof this.props.onVersionSelectCallback === 'function') {
                        this.props.onVersionSelectCallback(
                            versionArray[0].version_id,
                            versionArray[0].number,
                            versionArray[0].name.replace('Release', 'UDN'));
                    }
                });
            }
            else {

                //first store everything
                store.dispatch({
                    type: 'VERSION_UPDATE',
                    version: parseInt(versionArray[0].version_id),
                    versionNumber:versionArray[0].number,
                    tabId: this.props.engineeringTabId
                });
                if (typeof this.props.onVersionSelectCallback === 'function') {
                    this.props.onVersionSelectCallback(
                        versionArray[0].version_id,
                        versionArray[0].number,
                        versionArray[0].name.replace('Release', 'UDN'));
                }
                //set the version list in the dropdown list
                this.setState({
                    versionArray: versionArray,
                });
            }

        });
    }


    /**
     * This even handler is triggered when there is a change in the versions dropdown list selection.
     * @param e - Event object that resulted from this new selection
     */
    onVersionSelect(e){
        
        let version = e.target.value;
        let versionNumber = e.target.options[e.target.selectedIndex].attributes.name.value;
        let versionName = e.target.options[e.target.selectedIndex].textContent;

        //first store everything
        store.dispatch({
            type: 'VERSION_UPDATE',
            version: parseInt(version),
            versionNumber:versionNumber,
            tabId: this.props.engineeringTabId
        });

        //then propagate the event to callback function
        if (typeof this.props.onVersionSelectCallback === 'function') {
            this.props.onVersionSelectCallback(parseInt(version), versionNumber, versionName);
        }

        this.setState({selectedVersion:version});
    }


    /**
     * Render the version dropdown list
     * @returns {XML}
     */
    render(){

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);

        return <select
            className="select-udn"
            onChange={(e)=>this.onVersionSelect(e)}
            value={tabVersionObject.version}>
            {
                this.state.versionArray.map(function (data, index) {

                    return (<option key={index}
                                    value={data.version_id}
                                    name={data.number}
                                    id={"version_" + data.version_id}>{data.name.replace('Release', 'UDN')}</option>)
                })

            }
        </select>
    }

}

//Type checking of functions and class variables
VersionDropdownList.propTypes = {
    onVersionSelect: PropTypes.func,
};


export default VersionDropdownList;