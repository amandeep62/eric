import {Component} from "react";
import {envList} from "../../../../constants/constants";
import {store} from "../Store/Store";

class EnvDropdownList extends Component {

    /**
     * Initialize the environment view dropdown list
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.state = {envArray: envList};

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);
        this.selectedEnv = tabVersionObject.env;

    }

    /**
     * Event handler when a new selection on the environment dropdown list has been triggered
     * @param e - The event object
     */
    onEnvSelect(e){
        let env = e.target.value;
        store.dispatch({ type: 'ENVIRONMENT_UPDATE', env: env, tabId: this.props.engineeringTabId });

        //then propagate the event to callback function
        if (typeof this.props.onEnvSelectCallback === 'function') {
            this.props.onEnvSelectCallback(env);
        }

    }


    /**
     * Render the dropdown list
     * @return {*}
     */
    render(){

        return <select
            className="select-udn"
            onChange={(e)=>this.onEnvSelect(e)}
            defaultValue={this.selectedEnv} >
            {
                this.state.envArray.map(function (name, index) {
                    return (<option key={"env_" + index} value={name}>{name}</option>)
                })
            }
        </select>
    }
}

export default EnvDropdownList;