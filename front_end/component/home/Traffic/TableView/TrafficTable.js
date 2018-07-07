import {Component} from 'react';
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import PlotTrafficChart from "../ChartView/PlotTrafficChart";
import AddBillableTraffic from "./AddBillableTraffic";
import {DropdownList} from "react-widgets";
import {getHttpRequest} from "../../../../httprequest/http_connection";
import moment from "moment";
import PropTypes from "prop-types";

import {
    SERVICE_PROVIDER_ENUM as _SERVICE_PROVIDER_ENUM,
    userPermissions as _userPermissions
} from "../../../../constants/constants";
import {
    addDays,
    getDateFromWeekNumber,
    getStartDate,
    getEndDate,
    formatDate,
    convertBytesToHigherValues
} from '../TrafficHelpers';

/***
 * @type {{userPermissions: string , filterDrownDownList:array }}
 */
const trafficTableProtoTypes = {
    filterDrownDownList: PropTypes.array.isRequired,
};

class TrafficTable extends Component {
    /***
     * This class will use to display traffic table
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.updateWithSelector = this.updateWithSelector.bind(this);
        this.displayGraphicalView = this.displayGraphicalView.bind(this);
        this.updateWithValue = this.updateWithValue.bind(this);
        this.callApiWithStartAndEndDate = this.callApiWithStartAndEndDate.bind(this);
        this.setQuarter = this.setQuarter.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.yearSelection = this.yearSelection.bind(this);
        let current = new Date();

        /***
         * getStartDate(currentDate,currentMonth) return Thu Aug 31 2017 00:00:00 GMT-0700 (PDT)
         * getEndDate(currentDate,currentMonth) return  Aug 1 2017 00:00:00 GMT-0700 (PDT)
         */
        let prevMonthLastDate = getStartDate(current, current.getMonth() + 1);
        let prevMonthFirstDate = getEndDate(current, current.getMonth() + 1);

        /***
         * formatDate(startDateOfMonth) returns array [Year ,Month, Date]
         * formatDate(endDateOfMonth) returns array [Year ,Month, Date]
         */
        let startDate = formatDate(prevMonthFirstDate);
        let endDate = formatDate(prevMonthLastDate);
        /* Epoch Start and End Date
         * epochStartDate -> return EpochFormatDate
         * formatDate(endDateOfMonth)
         */
        let epochStartDate = new Date(startDate[2], startDate[0], startDate[1]).getTime() / 1000;
        let epochEndDate = new Date(endDate[2], endDate[0], endDate[1]).getTime() / 1000;

        let selectedFirstFilterType = this.props.filterDrownDownList[0].type;
        /* Setting default value to the monthly child drop down*/
        let selectedSecondFilterValue = this.props.filterDrownDownList[0].values[current.getMonth()];
        let selectedFilter = this.props.filterDrownDownList[0];
        this.getTrafficData(epochStartDate, epochEndDate, current.getFullYear());
        this.state = {
            filterDrownDownList: this.props.filterDrownDownList,
            selectedFilter: selectedFilter,
            selectedFirstFilterType: selectedFirstFilterType,
            trafficTableData: [],
            selectedSecondFilterValue: selectedSecondFilterValue,
            showGraph: true,
            loading: true,
            showModel: false,
            cp_accounts:[],
            yearSelected: current.getFullYear()
        }
    }
    /***
     *
     * @param value - year selected
     */
    yearSelection(value){
        let current = new Date();
        let prevMonthLastDate = getStartDate(current, current.getMonth() + 1);
        let prevMonthFirstDate = getEndDate(current, current.getMonth() + 1);

        let startDate = formatDate(prevMonthFirstDate);
        let endDate = formatDate(prevMonthLastDate);
        let epochStartDate;
        let epochEndDate;

        /***
         * If condition is for current year
         * else condition is for other years
         */
        if(value === current.getFullYear()){
             epochStartDate = new Date(current.getFullYear(), startDate[0], startDate[1]).getTime() / 1000;
             epochEndDate = new Date(current.getFullYear(), endDate[0], endDate[1]).getTime() / 1000;
            this.getTrafficData(epochStartDate, epochEndDate, value);
            this.setState({
                yearSelected:value,
                selectedFirstFilterType: this.state.filterDrownDownList[0].type,
                selectedSecondFilterValue: this.state.filterDrownDownList[0].values[current.getMonth()]

            })
        }else{
            epochStartDate = new Date(value, "00", "01").getTime() / 1000;
            epochEndDate = new Date(value, "11", " 31").getTime() / 1000;
            this.getTrafficData(epochStartDate, epochEndDate, value);
            this.setState({
                yearSelected:value,
                selectedFirstFilterType: this.state.filterDrownDownList[0].type,
                selectedSecondFilterValue: this.state.filterDrownDownList[0].values[11]
            })
        }
        }


    /***
     * This method will use to get records for non billable
     * @param epochStartDate
     * @param epochEndDate
     */
    getTrafficData(epochStartDate, epochEndDate) {
        this.setState({
            loading: true
        });
        getHttpRequest("/getAllTableCPAccountsList?dateFrom="
            + encodeURIComponent(epochStartDate) + "&dateTo=" + encodeURIComponent(epochEndDate), (result) => {
            let resultOutput = JSON.parse(result);
            this.getBillableDate(resultOutput, epochStartDate, epochEndDate);
        });

    }

    /***
     * Method used to call the api to get records for billable and
     * data other than china
     * @param {Array}resultOutput
     * @param {string} epochStartDate
     * @param {string} epochEndDate
     */

    getBillableDate(resultOutput, epochStartDate, epochEndDate) {
        getHttpRequest("/getAllTableCPAccountsListWithBillableData?dateFrom="
            + encodeURIComponent(epochStartDate) + "&dateTo=" + encodeURIComponent(epochEndDate), (billableResult) => {
            let billable = JSON.parse(billableResult);
            resultOutput.data.map((element) => {
                billable.data.map((billableElement) => {
                    if (element.cp_account_name == billableElement.cp_account_name) {
                        element["billableTraffic"] = billableElement["total_bytes"];
                        element["cp_billableDate"] = billableElement.cp_billableDate;
                    }
                    element["table"] = "NonChinaTable";
                })
            });
            this.getChinaDataWithoutBillable(resultOutput.data, epochStartDate, epochEndDate);

        });


    }

    /***
     * This method will use to get all the china data will billable and non billable
     * @param resultOutput
     * @param epochStartDate
     * @param epochEndDate
     */
    getChinaDataWithoutBillable(resultOutput, epochStartDate, epochEndDate) {
        let normalFormatStartDate = moment.unix(epochStartDate).format("YYYYMMDDHH");
        let normalFormatEndDate = moment.unix(epochEndDate).format("YYYYMMDDHH");
        // Getting all china billable data
        getHttpRequest("/getTotalTableChinaDataTableBillable?dateFrom="
            + encodeURIComponent(normalFormatStartDate) + "&dateTo=" + encodeURIComponent(normalFormatEndDate),
            (chinaBillableDataResult) => {
                let chinaBillableData = JSON.parse(chinaBillableDataResult);
                // Getting all china data
                getHttpRequest("/getTotalTableChinaDataTable?dateFrom="
                    + encodeURIComponent(normalFormatStartDate)
                    + "&dateTo=" + encodeURIComponent(normalFormatEndDate),
                    (chinaNonBillableData) => {
                    let nonBillabillable = JSON.parse(chinaNonBillableData);
                    // @ China Billable data Exit
                    if (chinaBillableData.data.length > 0) {
                        chinaBillableData.data.map((billableElement) => {
                            nonBillabillable.data.map((element) => {
                                if (element.cp_account_name
                                    == billableElement.cp_account_name) {
                                    element["billableTraffic"] = element.traffic_total;
                                }
                                element["total_bytes"] = element.traffic_total;
                                element["details_sp_account"] = _SERVICE_PROVIDER_ENUM.CHINA;
                                element["from"] = "NonChinaTable";
                                resultOutput.push(element);
                            })
                        });
                    } else {
                        // @ China Billable data Not Exit
                        nonBillabillable.data.map((element) => {
                            element["billableTraffic"] = 0;
                            element["total_bytes"] = element.traffic_total;
                            element["details_sp_account"] =
                                _SERVICE_PROVIDER_ENUM.CHINA;  // Added this to differentiate china traffic
                            element["from"] = "NonChinaTable";
                            resultOutput.push(element);
                        })

                    }
                    this.formatData(resultOutput);
                });

            });
    }

    /***
     *  This method will use to format the data in required format
     * @param {Array}resultOutput
     */
    formatData(resultOutput) {
        let formatData = [];
        resultOutput.map((element) => {
            let cp_account = element.cp_account_name;
            /* cp_account str startsWith("Test_") or startsWith("Trial") we need to remove */
            if (cp_account.startsWith("Test_")) {
                cp_account = element.cp_account_name.split("Test_")[1];

            } else if (cp_account.startsWith("Trial")) {
                let res = element.cp_account_name;
                cp_account = res.split("Trial_")[1];
            }

            formatData.push({
                "cpName": cp_account,
                "sp": this.getServiceProviderName(element.details_sp_account),
                "bytes": element["total_bytes"],
                "billableTraffic": element.billableTraffic ? element.billableTraffic : 0,
                "cpAccountList": [],
                "billableDate": element.cp_billableDate,
                "details_account": element.cp_account_name
            });
        });
        this.fetchRecords((cpAccounts) => {
            this.setState({
                trafficTableData: formatData,
                cp_accounts: cpAccounts,
                loading: false
            })
        });
    }

    /***
     * This one will use to set the service provider based on the account id
     * @param {string} accountId - Account id
     * @returns {string}
     */
    getServiceProviderName(accountId) {
        let account = Number(accountId);
        if (account <= _SERVICE_PROVIDER_ENUM.UDN) {
            return "UDN"
        } else if (account === _SERVICE_PROVIDER_ENUM.UDN_PLUS) {
            return "UDN Plus"
        } else if (account === _SERVICE_PROVIDER_ENUM.CHINA) {
            return "UDN China"
        } else {
            return "SP Edge"
        }
    }

    /***
     * This method will use to fetchRecords from backend
     * @param {}callBack: callBack on receiving data
     */
    fetchRecords(callBack) {
        getHttpRequest("/getCPAccounts", (result) => {
            let resultOutput = JSON.parse(result);
            callBack(resultOutput.data);
        });

    }

    /***
     * This method will use to set new quarter
     * @param startMonth - january,april
     * @returns {{}}
     */
    setQuarter(startMonth) {
        let obj = {};
        if (startMonth === "january") {
            obj.quarter1 = {
                start: moment().month(0).startOf("month"),
                end: moment().month(2).endOf("month")
            };
            obj.quarter2 = {
                start: moment().month(3).startOf("month"),
                end: moment().month(5).endOf("month")
            };
            obj.quarter3 = {
                start: moment().month(6).startOf("month"),
                end: moment().month(8).endOf("month")
            };
            obj.quarter4 = {
                start: moment().month(9).startOf("month"),
                end: moment().month(11).endOf("month")
            };
            return obj;
        }
        else if (startMonth === "april") {

            obj.quarter1 = {
                start: moment().month(3).startOf("month"),
                end: moment().month(5).endOf("month")
            };
            obj.quarter2 = {
                start: moment().month(6).startOf("month"),
                end: moment().month(8).endOf("month")
            };
            obj.quarter3 = {
                start: moment().month(9).startOf("month"),
                end: moment().month(11).endOf("month")
            };
            obj.quarter4 = {
                start: moment().month(0).startOf("month").add("years", 1),
                end: moment().month(2).endOf("month").add("years", 1)
            };
            return obj;
        }
    }

    /***
     *
     * @param value = "MONTHLY","QUARTERLY","YEARLY","WEEKLY"
     */
    updateWithSelector(value) {
        let newValue;
        let date = new Date();
        let currentMonth = date.getMonth();
        let changeChildDropDownOnSelection;

        if (value.toUpperCase() === "MONTHLY") {
            newValue = "Monthly";
            changeChildDropDownOnSelection = this.state.filterDrownDownList[0].values[currentMonth];
            this.callApiWithStartAndEndDate(date, currentMonth, "MONTHLY")
        } else if (value.toUpperCase() === "QUARTERLY") {
            newValue = "Quarterly";
            let quadIndex;
            if (currentMonth <= 3) {
                quadIndex = 0;
                let quadResult = this.setQuarter("january");
                this.callApiWithStartAndEndDate(date, quadResult.quarter1, "QUARTERLY")
            } else if (currentMonth <= 6) {
                quadIndex = 1;
                let quadResult = this.setQuarter("january");
                this.callApiWithStartAndEndDate(date, quadResult.quarter2, "QUARTERLY")
            } else if (currentMonth <= 9) {
                quadIndex = 2;
                let quadResult = this.setQuarter("january");
                this.callApiWithStartAndEndDate(date, quadResult.quarter3, "QUARTERLY")
            } else if (currentMonth <= 12) {
                quadIndex = 3;
                let quadResult = this.setQuarter("january");
                this.callApiWithStartAndEndDate(date, quadResult.quarter4, "QUARTERLY")
            }
            changeChildDropDownOnSelection = this.state.filterDrownDownList[1].values[quadIndex]

        } else if (value.toUpperCase() === "YEARLY") {
            newValue = "Yearly";
            changeChildDropDownOnSelection = date.getFullYear();
            let yearlyResult = this.setQuarter("january");
            let yearlyStartAndEndDate = {
                start: yearlyResult.quarter1.start._d,
                end: yearlyResult.quarter4.end._d
            };
            this.callApiWithStartAndEndDate(date, yearlyStartAndEndDate, "YEARLY")
        } else if (value.toUpperCase() === "WEEKLY") {
            newValue = "Weekly";
            changeChildDropDownOnSelection = moment(date).isoWeek();
            // this.callApiWithStartAndEndDate(current,0,"YEARLY");
            let getStartWeek = getDateFromWeekNumber(date.getFullYear(), changeChildDropDownOnSelection - 1);
            let endWeek = addDays(getStartWeek, 7);
            let startAndEndWeek = {
                "startWeek": getStartWeek,
                "endWeek": endWeek
            };
            this.callApiWithStartAndEndDate(date, startAndEndWeek, "WEEKLY")
        }
        this.setState({
            selectedFirstFilterType: newValue,
            selectedSecondFilterValue: changeChildDropDownOnSelection
        })
    }

    /*** Method updateWithValue : It will update with new value
     (@PARAMS-> MONTH(Jan - Dec)
     (@PARAMS-> Quad(Q1 - Q4))
     (@PARAMS-> Weekly(1 - 52))
     ***/
    updateWithValue(value) {
        let current = new Date();
        if (this.state.selectedFirstFilterType.toUpperCase() === "MONTHLY") {
            this.state.filterDrownDownList[0].values.map((element, foundIndex) => {
                if (element === value) {
                    this.callApiWithStartAndEndDate(current, foundIndex, "MONTHLY")
                }
            });

        }
        if (this.state.selectedFirstFilterType.toUpperCase() === "QUARTERLY") {
            let changeChildDropDownOnSelection;
            this.state.filterDrownDownList[1].values.map((element, foundIndex) => {
                let quadIndex;

                if (value === "Q1") {
                    quadIndex = 0;
                    let quadResult = this.setQuarter("january");
                    this.callApiWithStartAndEndDate(current, quadResult.quarter1, "QUARTERLY")
                } else if (value === "Q2") {
                    quadIndex = 1;
                    let quadResult = this.setQuarter("january");
                    this.callApiWithStartAndEndDate(current, quadResult.quarter2, "QUARTERLY")
                } else if (value === "Q3") {
                    quadIndex = 2;
                    let quadResult = this.setQuarter("january");
                    this.callApiWithStartAndEndDate(current, quadResult.quarter3, "QUARTERLY")
                } else if (value === "Q4") {
                    quadIndex = 3;
                    let quadResult = this.setQuarter("january");
                    this.callApiWithStartAndEndDate(current, quadResult.quarter4, "QUARTERLY")
                }
                changeChildDropDownOnSelection = this.state.filterDrownDownList[1].values[quadIndex];
            });


        }
        if (this.state.selectedFirstFilterType.toUpperCase() === "YEARLY") {
            let changeChildDropDownOnSelection = current.getFullYear();
            let yearlyResult = this.setQuarter("january");
            let yearlyStartAndEndDate = {
                start: yearlyResult.quarter1.start._d,
                end: yearlyResult.quarter4.end._d
            };
            this.callApiWithStartAndEndDate(current, yearlyStartAndEndDate, "YEARLY")
        }
        if (this.state.selectedFirstFilterType.toUpperCase() === "WEEKLY") {
            // this.callApiWithStartAndEndDate(current,0,"YEARLY");
            let getStartWeek = getDateFromWeekNumber(current.getFullYear(), value - 1);
            let endWeek = addDays(getStartWeek, 7);
            let startAndEndWeek = {
                "startWeek": getStartWeek,
                "endWeek": endWeek
            };
            this.callApiWithStartAndEndDate(current, startAndEndWeek, "WEEKLY")
        }
        this.setState({
            selectedSecondFilterValue: value
        });

    }

    /***
     * This method is used for get the start and end date to call Api
     * @param current - This one will be the current date
     * @param selectMonth - Selected month
     * @param type - MONTHLY,QUARTERLY,YEARLY,WEEKLY
     */
    //Method :callApiWithStartAndEndDate:getAllRecordsFromApi(CurrentDate,SelectedMonth(01-11))
    callApiWithStartAndEndDate(current, selectMonth, type) {
        let prevMonthFirstDate;
        let prevMonthLastDate;
        if (type === "MONTHLY") {
            prevMonthLastDate = getStartDate(current, selectMonth + 1);
            prevMonthFirstDate = getEndDate(current, selectMonth + 1);
        }
        if (type === "QUARTERLY") {
            prevMonthLastDate = selectMonth.end._d;
            prevMonthFirstDate = selectMonth.start._d;

        }
        if (type === "YEARLY") {
            prevMonthLastDate = selectMonth.end;
            prevMonthFirstDate = selectMonth.start;
        }
        if (type === "WEEKLY") {
            prevMonthLastDate = selectMonth.endWeek;
            // Fri Mar 31 2017 00:00:00 GMT-0700 (PDT)
            prevMonthFirstDate = selectMonth.startWeek;
        }
        /* Format date [Year ,Month, Date] */
        let startDate = formatDate(prevMonthLastDate);
        let endDate = formatDate(prevMonthFirstDate);

        startDate[2] = this.state.yearSelected;
        endDate[2]   = this.state.yearSelected;
        /* Epoch Start and End Date */
        let epochStartDate =
            Math.floor(moment.utc(new Date(startDate[2], startDate[0], startDate[1])).startOf("day") / 1000);
        let epochEndDate = Math.floor(moment.utc(new Date(endDate[2], endDate[0], endDate[1])).endOf("day") / 1000);
        this.getTrafficData(epochEndDate, epochStartDate);
    }

    /***
     * This method set new state to display table or graphical view
     */
    displayGraphicalView() {
        this.setState({
            showGraph: !this.state.showGraph
        })
    }

    /***
     * This method is used for open the modal
     */
    openModal() {
        this.setState({
            showModel: true
        });
    }

    /***
     * This method is used for close the modal
     */
    closeModal() {
        this.setState({
            showModel: false
        });
    }
    isoDate(date){
        if (!date) {
            return null
        }
        date = moment(date).toDate();
        let month = 1 + date.getMonth();
        if (month < 10) {
            month = '0' + month
        }
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day
        }
        return date.getFullYear() + '-' + month + '-' + day
    };

    render() {
        let rightSideFilter;
        let showTableView = "hidden";
        let tableResults;
        let addBillableModel;
        const {loading} = this.state;

        if (loading) {
            return (<div id="graphDiv">
                <div className="loader"></div>
            </div>); // render null when app is not ready
        }

        if (localStorage.userPermissions === _userPermissions) {
            showTableView = 'visible';
        }
        /*
        * AddBillableTraffic : This one is for modal where user can add billable traffic
        *
        * */
        if (this.state.trafficTableData.length > 0 && this.state.cp_accounts.length > 0) {
            addBillableModel = <AddBillableTraffic
                billableDate={this.state.trafficTableData}
                cpAccountList={this.state.cp_accounts}
                callApiWithStartAndEndDate={this.callApiWithStartAndEndDate}
                trafficTableData={this.state.cp_accounts}
                filterDrownDownList={this.props.filterDrownDownList}
                setQuarter={this.setQuarter}
                closeModal={this.closeModal}
                selectedFirstFilterType={this.state.selectedFirstFilterType}
                selectedSecondFilterValue={this.state.selectedSecondFilterValue}
            />
        }


        if (this.state.selectedFirstFilterType.toUpperCase() === 'MONTHLY'
            && !this.state.showGraph) {
            rightSideFilter = <DropdownList
                className="drop-down-all"
                value={this.state.selectedSecondFilterValue}
                data={this.state.filterDrownDownList[0].values}
                onChange={(e) => this.updateWithValue(e)}
            />
        }
        if (this.state.selectedFirstFilterType.toUpperCase() === 'QUARTERLY'
            && !this.state.showGraph) {
            rightSideFilter = <DropdownList
                className="drop-down-all"
                value={this.state.selectedSecondFilterValue}
                data={this.state.filterDrownDownList[1].values}
                onChange={(e) => this.updateWithValue(e)}
            />
            //   onChange={(e)=>this.updateWithSelector(e)}
        }
        if (this.state.selectedFirstFilterType.toUpperCase() === 'YEARLY'
            && !this.state.showGraph) {
            let date = new Date();
            let currentYear = date.getFullYear();
            rightSideFilter = <DropdownList
                className="drop-down-all"
                value={this.state.selectedSecondFilterValue}
                data={[currentYear]}
                onChange={(e) => this.updateWithValue(e)}
            />
        }
        if (this.state.selectedFirstFilterType.toUpperCase() === 'WEEKLY' && !this.state.showGraph) {
            rightSideFilter = <DropdownList
                className="drop-down-all"
                value={this.state.selectedSecondFilterValue}
                data={this.state.filterDrownDownList[3].values}
                onChange={(e) => this.updateWithValue(e)}
            />
        }
        if (this.state.showGraph) {
            tableResults =
                <PlotTrafficChart userPermissions={this.props.userPermissions}
                                  cpAccountList={this.state.cp_accounts}
                                  trafficTableData={this.state.trafficTableData}/>
        } else {

            this.state.trafficTableData.length > 0 ?
                tableResults =
                    <table
                        className="table table-striped table-analysis plan-table table-fixed"
                        id="table-to-xls">
                        <thead className="thead-inverse">
                        <tr>
                            {/* <th className="plan-table-td"> Row Labels</th>*/}
                            <th className="plan-table-th col-xs-3"> Content
                                Provider
                            </th>
                            <th className="plan-table-th col-xs-3"> Service
                                Provider
                            </th>
                            <th className="plan-table-th col-xs-3"> Sum of
                                Traffic in TB
                            </th>
                            <th className="plan-table-th col-xs-3"> Billable
                                Traffic
                            </th>
                        </tr>
                        </thead>
                        <tbody className="plan-body-row table-scroll">
                        {
                            this.state.trafficTableData.map((element, index) => {
                                return (<tr key={"element" + index}>
                                    <td className="plan-table-td col-xs-3">
                                        {element.cpName}</td>
                                    <td className="plan-table-td col-xs-3">
                                        {element.sp}</td>
                                    <td className="plan-table-td col-xs-3">
                                        {convertBytesToHigherValues(element.bytes)}</td>
                                    <td className="plan-table-td col-xs-3">
                                        {convertBytesToHigherValues(element.billableTraffic)}</td>
                                </tr>)
                            })
                        }
                        </tbody>
                    </table> : tableResults = <div><h1>No Results</h1></div>;
        }

        let tableWithFilter = <div className="row" style={{
            'padding': '10px',
            "backgroundColor": "#0b2236"
        }}>
            {!this.state.showGraph ? <div className="col-sm-2">
                <DropdownList
                    className="drop-down-all granularity"
                    value={this.state.selectedFirstFilterType}
                    data={[
                        'Monthly',
                        'Quarterly',
                        'Yearly',
                        'Weekly'
                    ]}
                    onChange={(e) => this.updateWithSelector(e)}
                />
            </div> : null}
            <div className="col-sm-2">
                {rightSideFilter}
            </div>
            {!this.state.showGraph ? <div className="col-sm-2">
                <DropdownList
                    className="value-dropdown drop-down-all"
                    value={this.state.yearSelected}
                    id={"yearSelection"}
                    data={[2017,2018]}
                    onChange={(e) => this.yearSelection(e)}
                />
            </div>:null}
            <div className="col-sm-2 pull-right"
                 style={{visibility: showTableView}}>
                <button type="button"
                        className={!this.state.showGraph ?
                            "btn btn-primary btn-md glyphicon glyphicon-signal btn-width"
                            : "btn btn-primary btn-md btn-width"}
                        onClick={(e) => this.displayGraphicalView(e)}>
                    <strong>{!this.state.showGraph ? "Analytics" : "Table"}</strong>
                </button>
            </div>
            {
                !this.state.showGraph && this.state.trafficTableData.length > 0 ?
                    <div className="col-sm-2">
                        {/*ADD Billable Date Button*/}
                        <button type="button"
                                className="btn btn-primary btn-md billable-date btn-width"
                                data-toggle="modal"
                                onClick={(e) => this.openModal(e)}>
                            ADD Billable Date
                        </button>
                    </div> : ''}
            {!this.state.showGraph ? <div className="col-sm-2">
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="btn btn-primary download-table-xls-button btn-width"
                    table="table-to-xls"
                    filename="tablexls"
                    sheet="tablexls"
                    buttonText="Download as XLS"/>
            </div> : null}
        </div>;

        return (
            <div className="col-sm-12 col-md-12 trafficTableContainer">
                {this.state.showModel && !this.state.showGraph ? addBillableModel : null}
                {tableWithFilter}
                <div className="traffic-results">
                    {tableResults}
                </div>
            </div>
        )
    }
}

TrafficTable.propTypes = trafficTableProtoTypes;


export default TrafficTable;