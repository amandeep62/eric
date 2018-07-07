import {Component} from "react";
import {envList} from "../../../../constants/constants";
import {store} from "../Store/Store";

const GRANULARITY = {
    YEARLY    : 0,
    MONTHLY   : 1,
    QUARTERLY : 2,
    WEEKLY    : 3,
    DAILY     : 4
};

class GranularityDropdownList extends Component {

    
    /**
     * Initialize the environment view dropdown list
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.state = {envArray: envList};
        this.onGranularitySelect = this.onGranularitySelect.bind(this);

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);
        this.selectedGranularity = 1; //tabVersionObject.env;

    }

    /**
     * Event handler when a new selection on the environment dropdown list has been triggered
     * @param e - The event object
     */
    onGranularitySelect(e){
        this.props.onGranularitySelect(e.target.value);
    }


    /**
     * Render the dropdown list
     * @return {*}
     */
    render(){

        return <select
            className="select-udn"
            onChange={(e)=>this.onGranularitySelect(e)}
            defaultValue={this.selectedGranularity} >
            {
                Object.keys(GRANULARITY).map((name, index)=> {
                    return (<option key={"GRAN_" + index} value={index}>{name}</option>)
                })
            }
        </select>
    }
}

export default GranularityDropdownList;