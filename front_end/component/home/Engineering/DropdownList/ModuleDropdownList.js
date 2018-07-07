import {Component} from 'react';
import PropTypes from 'prop-types';
import {store} from "../Store/Store";
import {getAllModules} from "../CommonFunction";

/**
 * @description     : Component to create module dropdown list
 * @prop {Number}   : engineeringTabId, required
 * @prop {Function} : onModuleSelectCallback, optional
 */
class ModuleDropdownList extends Component {

    /**
     * Build the list of project modules in a dropdown list.
     * Get the one by default
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        //Method bindings
        this.onModuleSelect = this.onModuleSelect.bind(this);

        //render it and select "ALL" by default
        this.state = {
            moduleList: [],
            selectedModule: "ALL"
        };


    }


    /**
     * Wait until the component is mounted before rendering the module list
     */
    componentDidMount() {
        //get the list of all module names
        getAllModules((modules) => {
            this.setState({
                moduleList: modules
            });
        });
    }

    /**
     * This even handler is triggered when there is a change in the modules dropdown list selection.
     * @param {Object} e - Event object that resulted from this new selection
     */
    onModuleSelect(e){
        let module = e.target.value;


        //first store the value
        store.dispatch({
            type: 'MODULE_UPDATE',
            module: module,
            tabId: this.props.engineeringTabId
        });

        //then, propagate the event to callback function
        if (typeof this.props.onModuleSelectCallback === 'function') {
            this.props.onModuleSelectCallback(module);
        }


        this.setState({selectedModule: module});
    }


    /**
     * Render the module dropdown list
     * @returns {XML}
     */
    render(){

        //Find the object reference to this current tab so we can retrieve the current selected module.
        let selectedModuleState = store.getState();
        let currentTab = selectedModuleState.find(item => item.tabId === this.props.engineeringTabId);


        return <select
            className="select-udn"
            onChange={(e) => this.onModuleSelect(e)}
            value={currentTab.module}>
            {
                this.state.moduleList.map(function (data, index) {

                    return (<option key={index}
                                    value={data}
                                    name={data}
                                    id={"module_" + data}>{data}</option>)
                })
            }
        </select>
    }
}


ModuleDropdownList.propTypes = {
    engineeringTabId: PropTypes.number.isRequired,
    onModuleSelectCallback: PropTypes.func,
};


export default ModuleDropdownList;