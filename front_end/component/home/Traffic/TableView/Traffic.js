import { Component } from 'react';
import TrafficTable from "./TrafficTable";
import moment from "moment";
import {MONTHS as _MONTHS,
    QUARTERLY as _QUARTERLY,
    userPermissions} from "../../../../constants/constants";
import { times  as _times} from "lodash";

export default class Traffic extends Component {

    constructor(props, context) {
        super(props, context);
        let date = new Date();
        /***
         *
         * @WEEKS() --> Returns [ 0 - 51] totalWeeks per year
         */
        let WEEKS =  () => {
            let numberOfWeeks = moment().isoWeeksInYear();
            return _times(numberOfWeeks);
        };
        /***
         * DropDown  Selector Type with respective values -> Eg. Monthly,Weekly,Yearly
         */
        let filterDrownDownList = [{
            "type": "Monthly",
            "values": _MONTHS
        }, {
            "type": "Quarterly",
            "values": _QUARTERLY,
        }, {
            "type": "Yearly",
            "values": date.getFullYear(),
        }, {
            "type": "Weekly",
            "values": WEEKS()
        }];
        this.state = {
            filterDrownDownList: filterDrownDownList
        }
    }

    componentDidMount(){
        document.title = "Traffic";
    }


    render() {
        let traffic = <TrafficTable filterDrownDownList={this.state.filterDrownDownList}/>
        return (<div className="row">{traffic}</div>)

    }
}
