/**
 * Created by sumit.thakur on 9/25/17.
 */

import { Component } from 'react';
import GraphWithFilters from "./GraphWithFilters";
import BillableTrafficList from "./BillableTrafficList";
import { DropdownList } from 'react-widgets';

class TrafficChartView extends Component {
    /***
     * Displaying three charts for quarterly, weekly and monthly
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.onBillableChecked = this.onBillableChecked.bind(this);
        this.yearSelection = this.yearSelection.bind(this);
        this.callBackFunctionFromBillableCheckBox = this.callBackFunctionFromBillableCheckBox.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        let current =  new Date();
        // setting
       this.props.cpAccountList.map((element)=>{
            element['checked'] = false;
        });
        this.state = {
            showBillable: false,
            showModal:false,
            billableTrafficList:[],
            yearSelected : current.getFullYear()
        }
    }

    /***
     * Called on selecting cp's from model
     * @param event
     */
    onBillableChecked(event) {
       // this.props.checkBoxValue(event.target.checked);
        if(event.target.checked){
            this.props.cpAccountList.map((element)=>{
                element['checked'] = true;
            });
        }else{
            this.props.cpAccountList.map((element)=>{
                element['checked'] = false;
            });
        }
        this.setState({
            showBillable: event.target.checked
        })
    }

    /***
     *
     * @param value - year selected
     */
    yearSelection(value){
        this.setState({
            yearSelected:value
        })
    }

    /***
     * Called on selecting show billable checkbox
     * @param list
     */
    callBackFunctionFromBillableCheckBox(list){
        // once you select the checkbox the billable will set to false
        this.setState({
            billableTrafficList:list
        })
    }
    /***
     * It will open the model on event trigger
     */
    openModal(){
        this.setState({
            showModal: true
        })

    }

    /***
     * It will close the model on event trigger
     */
    closeModal(){
        this.setState({
            showModal: false
        })
    }

    /***
     *
     * @returns {xml}
     */
    render() {
        let yearsList = [2017, 2018];
        return <div>
            <div className="col-sm-12 billable-traffic">
                <div className="col-sm-2">
                    <input type="checkbox" id="billableCheck" onChange={(e)=>this.onBillableChecked(e)}/>
                    <label htmlFor="billableCheck">Billable Traffic</label>
                </div>
                <div className="col-sm-2">
                    <button type="button" className="btn btn-primary"
                            data-toggle="modal"
                            onClick={(e) => this.openModal()}>
                       Billable Cp's
                    </button>
                </div>
                <div className="col-sm-2">
                    <DropdownList
                        className="value-dropdown drop-down-all"
                        value={this.state.yearSelected}
                        id={"yearSelection"}
                        data={yearsList}
                        onChange={(e) => this.yearSelection(e)}
                    />
                </div>
                {this.state.showModal?<BillableTrafficList
                    cpAccountList ={this.props.cpAccountList}
                    closeModal={this.closeModal}
                    callBackFunctionFromBillableCheckBox = {this.callBackFunctionFromBillableCheckBox}
                />:null}
            </div>
            <div className="chart-container">
                <GraphWithFilters chartType='Quarterly' isBillable={this.state.showBillable}
                                  cpAccountList={this.props.cpAccountList}
                                  yearsListSelected={this.state.yearSelected}
                                  billableTrafficList={this.state.billableTrafficList}
                />
                <GraphWithFilters chartType='Monthly' isBillable={this.state.showBillable}
                                  cpAccountList={this.props.cpAccountList}
                                  yearsListSelected={this.state.yearSelected}
                                  billableTrafficList={this.state.billableTrafficList}
                />
                <GraphWithFilters chartType='Weekly' isBillable={this.state.showBillable}
                                  cpAccountList={this.props.cpAccountList}
                                  yearsListSelected={this.state.yearSelected}
                                  billableTrafficList={this.state.billableTrafficList}
                />
            </div>
        </div>
    }
}


export default TrafficChartView;
