/*  Created By Sandeep  */
import React, {Component} from 'react';
import SingleDtPicker from '../../../Tools/SingleDatePicker';
import moment from 'moment';
var DatePicker = require("react-bootstrap-date-picker");


class UDNSTimeScheduleTableCells extends Component {

    constructor(props, context) {
        super(props, context);
        // Binding events
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            timeScheduleTableCellData : this.props.dataElement
        }
    }
    componentWillReceiveProps(nextProps){
        this.state = {
            timeScheduleTableCellData : nextProps.dataElement
        }
    }

    handleChange(phase_id, pickerValue, type ,cellIndex) {
        let element = this.state.timeScheduleTableCellData;
       
        if ('start_time' === type) {
            if (element.phase_id === phase_id) {
                element.start_time = this.isoDate(pickerValue);
            }
        }
        if ('end_time' === type) {
            if (element.phase_id === phase_id) {
                element.end_time = this.isoDate(pickerValue);
            }
        }
        if ('actual_end_time' === type) {
            if (element.phase_id === phase_id) {
                element.actual_end_time = this.isoDate(pickerValue);
            }
        }
     
        this.setState({timeScheduleTableCellData: element});

        this.props.updateParent({timeScheduleTableCellData: element,cellIndex:cellIndex})
    }
     isoDate(date) {
        if (!date) {
            return null
        }
        date = moment(date).toDate();

        // don't call toISOString because it takes the time zone into
        // account which we don't want.  Also don't call .format() because it
        // returns Arabic instead of English

        let month = 1 + date.getMonth();
        if (month < 10) {
            month = '0' + month
        }
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day
        }
        return date.getFullYear() + '-' + month + '-' + day
    }


    render(){

        let cellData = this.state.timeScheduleTableCellData;
        let cellIndex = this.props.cellIndex;
        let minimumStartDate;
        let minimumEndDate;

        if(cellIndex === 0){
            minimumStartDate = '';
            minimumEndDate = cellData.start_time + '';
        }else{
            minimumStartDate = this.props.timeScheduleData[cellIndex - 1].end_time + '';
            minimumEndDate = cellData.start_time;
        }
        return(
           <tr className="timeScheduleBody" key={'schedule' + cellIndex}>
                <td className="UDNInputFieldPhase">
                    <input type='text' value={cellData.phase_name}
                           className="UDNInputField form-control" disabled={true}
                           onChange={(e) => {
                               this.handleChange(cellData.phase_id,
                                   e.target.value, 'phase_name', cellIndex)}}/>
                </td>
                <td>
                    <DatePicker id="datepicker" value={cellData.start_time}
                                minDate={ moment(minimumStartDate) }
                                onChange={(e) =>
                                {this.handleChange(cellData.phase_id, e, 'start_time',cellIndex)}} />
                </td>
                <td>
                    <DatePicker id="datepicker"
                                value={cellData.end_time}
                                minDate={ moment(minimumEndDate) }
                                onChange={(e) => {this.handleChange(cellData.phase_id, e,
                                    'end_time', cellIndex)}} />

                </td>
                <td>
                    <DatePicker id="datepicker"
                                value={cellData.actual_end_time}
                                onChange={(e) =>
                                {this.handleChange(cellData.phase_id, e, 'actual_end_time',cellIndex)}}
                                disabled={cellData.disableButton}/>

                </td>
       </tr>)

    }
}
export default UDNSTimeScheduleTableCells;