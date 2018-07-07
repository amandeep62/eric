import { createStore } from 'redux'

import { EngineeringTabEnum, STATUS_ENV_ENUM, STORE_ACTION_ENUM} from "../../../../constants/constants"





/**
 * Store the state of each tab.
 * @type {Store<[]>}
 */
export const store = createStore(storeSelectedDropdown, [
    {
        tabId:EngineeringTabEnum.PRODUCTREADINESS.value,
        version:0,
        env:"",
        module:"",
        time:0,
        versionNumber:"0",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.ROADMAP.value,
        version:0, env:"",
        module:"ALL",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.RELEASEDASHBOARD.value,
        version:0, env:"",
        module:"",
        time:0,
        versionNumber:"0",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.STATUS.value,
        env:STATUS_ENV_ENUM.DEV,
        version:0,
        versionNumber:"0",
        module:"ALL",
        bugPriority: [],
        thirdChartType: null,
        thirdChartLabel: [],
        fourthChartType: null,
        lastChartType: null,
        bugCurrentVersion: 0,
        bugCurrentModule: "ALL",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.CAPACITY.value,
        version:11, env:"",
        module:"ALL",
        time:0,
        versionNumber:"0",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.QUALITY.value,
        version:0,
        versionNumber:"0",
        module:"ALL",
        bugOrigin: [],
        secondChartType: null,
        secondChartLabel: [],
        thirdChartType: null,
        thirdChartLabel: [],
        fourthChartType: null,
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.FST.value,
        version:0,
        versionNumber:"0",
        module:"ALL",
        bugOrigin: [],
        secondChartType: null,
        secondChartLabel: [],
        thirdChartType: null,
        thirdChartLabel: [],
        fourthChartType: null,
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.PLATFORMBOARD.value,
        version:0,
        env:"",
        module:"",
        time:0,
        versionNumber:"0",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.PROCESS.value,
        version:0,
        env:"",
        module:"",
        time:0,
        versionNumber:"0",
        year:new Date().getFullYear()
    },
    {
        tabId:EngineeringTabEnum.TRENDS.value,
        version:11, // To Do : Need to get this one dynamic
        env:"",
        module:"ALL",
        time:0,
        versionNumber:"0",
        year:new Date().getFullYear()
    }
]);



/**
 *
 * @param state
 * @param action
 * @returns {Array}
 */
export function storeSelectedDropdown(state = [], action) {
    switch (action.type) {
        case STORE_ACTION_ENUM.VERSION_UPDATE:
            state.filter((element, index, array) => {
                if(element.tabId === action.tabId){
                    element.version = action.version;
                    element.versionName = action.versionName;
                    element.versionNumber = action.versionNumber;
                }
                array[index] = element;
            });
            return state;

        case STORE_ACTION_ENUM.ENVIRONMENT_UPDATE:
            state.filter((element, index, array)=>{
                if(element.tabId === action.tabId){
                    element.env = action.env;
                }
                array[index] = element;
            });
            return state;


        case STORE_ACTION_ENUM.TIME_UPDATE:
            state.filter((element, index, array)=>{
                if(element.tabId === action.tabId){
                    element.time = action.time;
                }
                array[index] = element;
            });
            return state;

        case 'YEAR_UPDATE':
            state.filter((element, index, array)=>{
                if(element.tabId === action.tabId){
                    element.year = action.year;
                }
                array[index] = element;
            });
            return state;


        case STORE_ACTION_ENUM.MODULE_UPDATE:
            state.filter((element, index, array) => {

                if(element.tabId === action.tabId){
                    element.module = action.module;
                }
                array[index] = element;
            });
            return state;

        case STORE_ACTION_ENUM.FST_UPDATE:
            state.filter((element, index, array) => {
                if(element.tabId === action.tabId){
                    element.bugOrigin = action.bugOrigin;
                    element.secondChartType = action.secondChartType;
                    element.secondChartLabel = action.secondChartLabel;
                    element.thirdChartType = action.thirdChartType;
                    element.thirdChartLabel = action.thirdChartLabel;
                    element.fourthChartType = action.fourthChartType;
                }
                array[index] = element;
            });
            return state;
        case STORE_ACTION_ENUM.QUALITY_UPDATE:
            state.filter((element, index, array) => {
                if(element.tabId === action.tabId){
                    element.bugOrigin = action.bugOrigin;
                    element.secondChartType = action.secondChartType;
                    element.secondChartLabel = action.secondChartLabel;
                    element.thirdChartType = action.thirdChartType;
                    element.thirdChartLabel = action.thirdChartLabel;
                    element.fourthChartType = action.fourthChartType;
                }
                array[index] = element;
            });
            return state;
        case STORE_ACTION_ENUM.BUG_STATUS_UPDATE:
            state.filter((element, index, array) => {
                if(element.tabId === action.tabId){
                    element.bugPriority = action.bugPriority;
                    element.lastChartType = action.lastChartType;
                    element.thirdChartType = action.thirdChartType;
                    element.thirdChartLabel = action.thirdChartLabel;
                    element.fourthChartType = action.fourthChartType;
                    element.bugCurrentVersion = action.bugCurrentVersion;
                    element.bugCurrentModule = action.bugCurrentModule;
                }
                array[index] = element;
            });
            return state;

        default:

            return state

    }
}




export const storeModule = createStore(storeAllModules, []);

/**
 * Update the state of the modules for all tabs when app is initialized.
 * @param state - current value of the module array
 * @param action - type of action for updating the module array
 * @return {Array} - the array of the modules
 */
export function storeAllModules(state = [], action) {
    switch (action.type) {
        case STORE_ACTION_ENUM.MODULE_UPDATE:
            state = action.moduleArray;
            break;

        case 'MODULE_INSERT':
            break;
    }

    return state

    }