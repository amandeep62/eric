import React, {Component} from 'react'
import {userPermissions,EngineeringTabEnum} from "../../../../constants/constants";
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle'
import ProcessContainer from '../Process/ProcessContainer'
import './Process.less'

class Process extends Component {
    /***
     * @description : To display title and
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount(){
        document.title = "Process";
    }

    /***
     *
     * @returns {"Process Tab div"}
     */

    render(){
        return (<div id="engineeringProcessTab" className="row">
            <EngineeringTitle title={"Process"} engineeringTabId={EngineeringTabEnum.PROCESS.value}  />
            <ProcessContainer/>
        </div>)
    }
}

export default Process