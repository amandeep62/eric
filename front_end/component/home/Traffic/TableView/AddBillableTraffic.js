import { Component } from 'react';
import { DropdownList } from 'react-widgets';
import {getHttpRequest, postHttpRequest} from "../../../../httprequest/http_connection";
const DatePicker = require("react-bootstrap-date-picker");
import moment from "moment";
import PropTypes from "prop-types";
import {isoDate} from '../TrafficHelpers';
const addBillableTraffic = {
    callApiWithStartAndEndDate     : PropTypes.func.isRequired,
    cpAccountList                  : PropTypes.array.isRequired,
    closeModal                     : PropTypes.func.isRequired,
    filterDrownDownList            : PropTypes.array.isRequired,
    setQuarter                     : PropTypes.func.isRequired,

};
/***
 * This modal class is used to add the billable date and update the billable date
 */
class AddBillableTraffic extends Component {
    /***
     *
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.fetchRecords();
        this.addBillableDate = this.addBillableDate.bind(this);
        this.selectedList = this.selectedList.bind(this);
        this.updateBillableDateEvent = this.updateBillableDateEvent.bind(this);
        this.editTableDate = this.editTableDate.bind(this);
        // Default cp account name which need to be displayed in drop down list
        let dropDownInitialName = this.props.cpAccountList[0].cp_account_name;
        // accountNumber :  This one is need to make api call for Default cp account
        let accountNumber = this.props.cpAccountList[0].cp_account_id;

        this.state = {
            dropDownList:[],
            setBillableDate:'',
            cpAccountList:this.props.cp_accounts,
            dropDownSelected: dropDownInitialName,
            accountNumber: accountNumber,
            tableList :this.props.trafficTableData,
        }
    }
    /***
     *
     * Fetching Data from Api
     * It will returns all the cp accounts list from db
     */
    fetchRecords(){
        getHttpRequest("/getCPAccounts", (result) => {
            let resultOutput = JSON.parse(result);
            this.setState({
                dropDownList: resultOutput.data
            })

        });

    }

    /***
     *
     * @param billableDateValue
     * It will update the billable date
     */
    updateBillableDateEvent(billableDateValue){
        this.setState({
            setBillableDate:billableDateValue
        })
    }

    /***
     *
     * @param name
     * It will returns all the the selected item from the drop down
     * to update the drop down list
     */
    selectedList(name){
        let account = this.state.dropDownList.filter((element)=>{
            return name === element.cp_account_name;
        });
        this.setState({
            dropDownSelected:name,
            cpAccountList:account,
            accountNumber:account[0].cp_account_id
        })
    }

    /***
     *
     * @param element
     * editTableDate -  We can update or edit the date using this method
     */
    editTableDate(element){
        let account = this.state.dropDownList.filter((list)=>{
            return  element.cp_account_name === list.cp_account_name;
        });
        let date = isoDate(account[0].cp_billableDate * 1000);
        this.setState({
            dropDownSelected: account[0].cp_account_name,
            setBillableDate : date,
            accountNumber: account[0].cp_account_id
        })
    }

    /***
     * addBillableDate: Method is used to add Billable
     * date in db with API call
     */
    addBillableDate(){
        let epoch = moment(this.state.setBillableDate).unix();
        if(!epoch){
            epoch = '';
        }
        let requestData = {
            "cpAccountName":this.state.dropDownSelected,
            "billableDate":epoch
        };
        postHttpRequest("/updateCPBillable", requestData, () => {
            this.fetchRecords();
            this.props.closeModal();
            this.callBackTrafficRecords()
        });
    }

    /***
     * @ Description : Onchange of checkbox it will be called
     */
    callBackTrafficRecords(){
        let current = new Date();
        let filterType = this.props.selectedFirstFilterType;
        if(filterType.toUpperCase() === 'MONTHLY'){
            let val = this.props.selectedSecondFilterValue;
            let values = this.props.filterDrownDownList[0].values;
            values.map((result, index) => {
                if(result === val){
                    this.props.callApiWithStartAndEndDate(current, index, "MONTHLY")
                }
            });
        }
        if(filterType.toUpperCase() === 'QUARTERLY'){
            let quadResult = this.props.setQuarter('january');
            let val = this.props.selectedSecondFilterValue;
            if(val === 'Q1'){
                this.props.callApiWithStartAndEndDate(current, quadResult.quarter1, "QUARTERLY")
            }else if(val === 'Q2'){
                this.props.callApiWithStartAndEndDate(current, quadResult.quarter2, "QUARTERLY")
            }else if(val === 'Q3'){
                this.props.callApiWithStartAndEndDate(current, quadResult.quarter3, "QUARTERLY")
            } else if(val === 'Q4'){
                this.props.callApiWithStartAndEndDate(current, quadResult.quarter4, "QUARTERLY")
            }


        }
        this.resetForm()
    }

    /***
     * resetForm : It will reset all the form fields
     */
    resetForm(){
        this.setState(
            {
                "setBillableDate":'',
                "dropDownSelected": this.props.trafficTableData[0].name
            }
        )
    }
    /***
     *
     * Close Modal - This will call the parent to close the modal
     */
    close(){
        this.props.closeModal();
    }
   /***
    * return (xml)
    */
    render() {
        let contentProviderList = [];
       let  dropDownSelected
        if(this.state.dropDownSelected.startsWith("Test_")){
           dropDownSelected = this.state.dropDownSelected.split("Test_")[1];
        }else if(this.state.dropDownSelected.startsWith("Trial_")){
            dropDownSelected = this.state.dropDownSelected.split("Trial_")[1];
        }
        if(this.state.dropDownList.length > 0){
            this.state.dropDownList.map((element)=> {
                let cp_account = element.cp_account_name;
                /* cp_account str startsWith("Test_") or startsWith("Trial") we need to remove */
                if (cp_account.startsWith("Test_")) {
                    cp_account = cp_account.split("Test_")[1]
                    } else if (cp_account.startsWith("Trial_")) {
                    cp_account = cp_account.split("Trial_")[1];
                }
                contentProviderList.push(cp_account);
                });
        }
        let list = this.state.dropDownList.map((element, index) => {
            let cp_account = element.cp_account_name;
            /* cp_account str startsWith("Test_") or startsWith("Trial") we need to remove */
            if (cp_account.startsWith("Test_")) {
                cp_account = cp_account.split("Test_")[1]
            } else if (cp_account.startsWith("Trial")) {
                cp_account = cp_account.split("Trial_")[1]
            }

            return (<tr key={"element" + index}>
                <td className="plan-table-td">
                    {cp_account}</td>
                <td className="plan-table-td">
                    {element.cp_billableDate ? isoDate(element.cp_billableDate * 1000) : ''}
                    </td>
                <td className="plan-table-td">
                    <span className="glyphicon glyphicon-pencil"
                          onClick={(e)=>this.editTableDate(element)}>
                    </span>
                </td>
            </tr>)
        });

    return (
            <div className="modal fade in udn-modal" id="billableModel"
                 tabIndex="-1" role="dialog" aria-labelledby="myModalLabel"
                 style={{display: "block"}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header traffic-header">
                            <button type="button" className="close"
                                    data-dismiss="modal" aria-label="Close"
                                    onClick={(e)=>{this.close(e)}}>
                                <span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title" id="myModalLabel">Add Billable Date</h4>
                        </div>
                        <div className="modal-body traffic-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <DropdownList
                                        className="billable_add drop-down-all"
                                        value={dropDownSelected}
                                        data={contentProviderList}
                                        onChange={(e) => {this.selectedList(e)}}
                                    />
                                </div>
                                <div className="col-md-6 picker">
                                    <DatePicker id="datepicker"
                                                className="date-picker-custom"
                                                value={this.state.setBillableDate}
                                                onChange={(e) => {this.updateBillableDateEvent(e)}} />
                                </div>
                            </div>
                            <table className="table table-striped table-analysis plan-table billable-table">
                                <thead className="thead-inverse">
                                <tr>
                                  {/*   <th className="plan-table-td"> Row Labels</th>*/}
                                    <th className="cont-width plan-table-td"> Content Provider</th>
                                    <th className="plan-table-td"> Billable Date</th>
                                    <th className="plan-table-td">&nbsp;</th>
                                </tr>
                                </thead>
                            </table>
                            <div className='billableDate-picked'>
                                <table className="table table-striped table-analysis plan-table billable-table">
                                    <tbody className="plan-body-row table-scroll">
                                    {
                                        list
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer traffic-footer">
                            <button type="button" className="btn btn-default"
                                    data-dismiss="modal"
                                    onClick={(e)=>{this.close(e)}}>Close</button>
                            <button type="button" className="btn btn-primary"
                                    onClick={(e)=>this.addBillableDate(e)}
                                    data-dismiss="modal">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>)

    }
}

/***
 *
 * @type {{callApiWithStartAndEndDate, cpAccountList, closeModal, filterDrownDownList, setQuarter}}
 */

AddBillableTraffic.propTypes = addBillableTraffic;
export default AddBillableTraffic;






