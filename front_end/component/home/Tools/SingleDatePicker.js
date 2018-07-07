import React, {Component} from 'react'
class SingleDtPicker extends Component {

    constructor(props, context) {
        super(props, context);
        //this.changeMe = this.changeMe.bind(this);
    }
    componentDidMount () {
        let that = this;
       /* $(function() {
            $('input[name="birthdate"]').daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true
                },
                function(start, end, label) {
                    var years = moment().diff(start, 'years');
                    console.log(start._d);
                   this.changeInputDate(start)
                });
        });*/

        $(function() {

            $('input[name="datefilter"]').daterangepicker({
                autoUpdateInput: false,
                locale: {
                    cancelLabel: 'Clear'
                }
            });

            $('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
            });

            $('input[name="datefilter"]').on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
                $(this).val(this.props.dtValue);
            });

        });
    }

    render () {
        {
            return (
               <div>
                   <input type="text" name="datefilter" value="" />
               </div>
            )
        }
    }
}
export default SingleDtPicker;
