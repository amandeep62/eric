import { Component } from 'react';
import PropTypes from "prop-types";

const billableTrafficListProtoTypes =  {
    callBackFunctionFromBillableCheckBox :  PropTypes.func.isRequired,
    cpAccountList                        :  PropTypes.array.isRequired,
    closeModal                           :  PropTypes.func.isRequired
};
class BillableTrafficList extends Component {
    /***
    *
    * @param props
    * @param context
    */
    constructor(props, context) {
        super(props, context);
        this.onAccountSelectChange = this.onAccountSelectChange.bind(this);
        this.close = this.close.bind(this);
        this.state = {
            cpAccountList:this.props.cpAccountList
        }

    }

    onAccountSelectChange(element){
        let name = element.cp_account_name;
        let newValue = [];
        this.state.cpAccountList.map((element_data)=>{
            if(element_data.cp_account_name === name){
                
                element.checked = !element.checked;
                newValue.push(element);
            }


        });
        this.setState({
            element: newValue
        })

    }

    close(){
        this.props.closeModal();
    }

    selectedList(){
        let list = this.state.cpAccountList;
        this.props.callBackFunctionFromBillableCheckBox(list);
        this.props.closeModal();
    }

    render() {
        let list = this.state.cpAccountList.map((element, index) => {
            if(element.cp_billableDate === ''){
                return
            }
            let cp_account = element.cp_account_name;
            /* cp_account str startsWith("Test_") or startsWith("Trial") we need to remove */
            if (cp_account.startsWith("Test_")) {
                cp_account = cp_account.split("Test_")[1]
            } else if (cp_account.startsWith("Trial")) {
                cp_account = cp_account.split("Trial_")[1]
            }
            if(element.cp_billableDate) {
                return (<tr key={"billableList" + index}>
                    <td className="plan-table-td">
                        {cp_account}</td>
                    <td className="plan-table-td">
                        {element.cp_billableDate ? new Date(element.cp_billableDate * 1000).toLocaleDateString() : ''}
                    </td>
                    <td className="plan-table-td">
                        <input type="checkbox"  checked={element.checked} onChange={(e) => {
                            this.onAccountSelectChange(element)
                        }}/>
                    </td>
                </tr>)
            }
        });

        return (
            <div className="modal fade in udn-modal" id="billableModelGraph"
                 tabIndex="-1" role="dialog" aria-labelledby="myModalLabel"
                 style={{display: "block"}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header traffic-header">
                            <button type="button" className="close"
                                    data-dismiss="modal" aria-label="Close"
                                    onClick={(e)=>{this.close(e)}}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title"
                                id="myModalLabel">Billable CP’s</h4>
                        </div>
                        <div className="modal-body traffic-body">
                                <table className="table table-striped table-analysis plan-table billable-table">
                                    <thead className="thead-inverse">
                                    <tr>
                                        {/* <th className="plan-table-td"> Row Labels</th>*/}
                                        <th className="contprov-width plan-table-td"> Content Provider</th>
                                        <th className="billdate-width plan-table-td"> Billable Date</th>
                                        <th className="plan-table-td">Filter</th>
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
                            <button type="button"
                                    className="btn btn-primary"
                                    onClick={(e)=>this.selectedList(e)}
                                    data-dismiss="modal">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>)

    }
}
BillableTrafficList.propTypes = billableTrafficListProtoTypes;


export default BillableTrafficList;






