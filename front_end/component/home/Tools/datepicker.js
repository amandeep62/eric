import React, {Component} from 'react'
class DtPicker extends Component {

    constructor(props, context) {
        super(props, context);

    }
    componentDidMount () {
        var that = this;
        var start = moment().subtract(28, 'days')
        var end = moment();
        $(function () {
            $('[name="daterange"]').daterangepicker({
                startDate: start,
                endDate: end,
                timePickerIncrement: 30,
                locale: {
                    format: 'MMMM D, YYYY'
                },
                opens: "left",
                cancelClass: "cancelBtn",
                defaultDate: [moment().subtract(28, 'days'), moment()],
                ranges: {
                    'Today': [moment(), moment()],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 28 Days': [moment().subtract(27, 'days'), moment()],
                    'Month Till Date': [moment().startOf('month'), moment()],
                    'Year Till Date': [moment().startOf('year'), moment()]
                },
                alwaysShowCalendars: true
            }, cb);

            function cb(start, end) {

                var stHours = start / (1000 * 60 * 60);
                var absoluteHours = Math.floor(stHours);
                var sh = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
                var stSec = sh * 3600;


                var endHours = end / (1000 * 60 * 60);
                var absoluteHours = Math.floor(endHours);
                var eh = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
                var edSec = eh * 3600;

                that.props.getCPStartAndEndDate(stSec, edSec);
            }

            $(window).scroll(function () {
                if ($('input[name="daterange"]').length) {
                    $('input[name="daterange"]').daterangepicker("close");
                }
            });
        });
    }

    render () {
        {
            return (

                <div className="form-control dtDiv" aria-hidden="true" data-toggle="modal" id="dateId">
                    <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
                    <input type="text" className="dtInput" name="daterange" readOnly="readOnly"/>
                    <span data-target="#datepicker" className="glyphicon glyphicon-calendar" name="daterange"></span>
                </div>
            )
        }
    }
}
export default DtPicker;
