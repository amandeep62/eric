import {
    Component
} from 'react';
import {
    DropdownList
} from 'react-widgets';
import {
    getHttpRequest
} from "../../../../httprequest/http_connection";
import moment  from 'moment'
import {
    SERVICE_PROVIDER_ENUM as _SERVICE_PROVIDER_ENUM,
    MONTHS,
    QUARTERLY as QUARTERS,
    SELECTORS,
    SELECTORS_TYPE
} from "../../../../constants/constants";
import {
    addDays,
    getDateFromWeekNumber,
    formatDate,
    convertBytesToHigherValues,
    getCurrentWeekNumber
} from '../TrafficHelpers';
import PropTypes from "prop-types";
const graphWithFiltersProtoTypes = {
    billableTrafficList :   PropTypes.array,
    chartType           :   PropTypes.string.isRequired,
    cpAccountList       :   PropTypes.array.isRequired,
    isBillable          :   PropTypes.bool.isRequired

};
class GraphWithFilters extends Component {
    /***
     *
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.epochStartAndEndDateConverter = this.epochStartAndEndDateConverter.bind(this);
        this.drawDonutCharts = this.drawDonutCharts.bind(this);
        this.formatData = this.formatData.bind(this);

        let currentDate = new Date();
        this.schedulerRunDate = ''; // @type {string}  -> schedulerRunDate (Last Scheduler run date)
        this.cpAccount = [];

        this.labelArray = [];
        this.donutChartDataTotalCount = null;
        this.donutChartData = null;
        this.donutChartDataWithUnits = null;
        this.title = null;

        getHttpRequest('/getSchedulerRunDate', (result)=>{
            let scheduler = JSON.parse(result);
            let schedulerRunDate = scheduler.data[0].scheduler_run;
            let newDate = this.getGMTTime(schedulerRunDate);
            this.yearsListSelected = this.props.yearsListSelected;
            this.schedulerRunDate =  MONTHS[newDate.getMonth()]+'/'+ newDate.getDate();
            if (this.props.chartType === SELECTORS_TYPE.Quarterly.key) {
                this.showQuarterChart(currentDate.getMonth(), this.yearsListSelected);
            } else if (this.props.chartType === SELECTORS_TYPE.Monthly.key) {
                this.showMonthlyChart(currentDate.getMonth() + 1, this.yearsListSelected);
            } else if (this.props.chartType === SELECTORS_TYPE.Weekly.key) {
                let weekNumber = getCurrentWeekNumber(currentDate);
                this.showWeeklyChart(weekNumber, this.yearsListSelected);
            }
        });
        let defaultSelected = this.getDefaultSelection(this.props.chartType);
        this.state = {
            chartType: this.props.chartType,
            selectedType: this.props.chartType,
            cpAccountList: this.props.cpAccountList,
            isBillable: this.props.isBillable,
            selectedValue: defaultSelected,
            year:this.props.yearsListSelected,
            height: this.minHeight,
            width: this.minWidth,
        }
    }
    /***
     *
     * @param nextProps change of selector type will receive new props
     */
    componentWillReceiveProps(nextProps) {
        this.cpAccount = nextProps.cpAccountList;
        this.yearsListSelected = nextProps.yearsListSelected;
        let  cpAccountList = nextProps.cpAccountList;
        let currentDate = new Date();
        let defaultSelected;

        if (this.state.selectedType === SELECTORS_TYPE.Quarterly.key) {
            this.cpAccount = [];
            if(currentDate.getFullYear() === this.yearsListSelected){
                this.showQuarterChart(currentDate.getMonth(), this.yearsListSelected);
                defaultSelected = this.getDefaultSelection(this.props.chartType);
            }
            if(currentDate.getFullYear() !== this.yearsListSelected){
                this.updateQuarterlyData(QUARTERS[3], this.yearsListSelected);
                defaultSelected = QUARTERS[3];
            }
            cpAccountList.filter((element)=>{
                if(element.checked === true && element.cp_billableDate){
                    this.cpAccount.push(element.cp_account_name)
                }
            })

        } else if (this.state.selectedType === SELECTORS_TYPE.Monthly.key) {
            //Selected CP'S List Array
            this.cpAccount = [];
            if(currentDate.getFullYear() === this.yearsListSelected){
                this.showMonthlyChart(currentDate.getMonth() + 1, this.yearsListSelected);
                defaultSelected = this.getDefaultSelection(this.props.chartType);
            }
            if(currentDate.getFullYear() !== this.yearsListSelected){
                this.updateMonthlyData(MONTHS[11], this.yearsListSelected);
                defaultSelected = MONTHS[11];
                // this.updateQuarterlyData('', this.yearsListSelected);
            }
            cpAccountList.filter((element)=>{
                if(element.checked === true && element.cp_billableDate){
                    this.cpAccount.push(element.cp_account_name)
                }
            })
        } else if (this.state.selectedType === SELECTORS_TYPE.Weekly.key) {
            //Selected CP'S List Array
            this.cpAccount = [];
            if(currentDate.getFullYear() === this.yearsListSelected){
                let weekNumber = getCurrentWeekNumber(currentDate);
                this.showWeeklyChart(weekNumber, this.yearsListSelected);
                defaultSelected = this.getDefaultSelection(this.props.chartType);
            }
            if(currentDate.getFullYear() !== this.yearsListSelected){
                let updatedDate = new Date(this.yearsListSelected, 11, 31);
                let weekNumber = getCurrentWeekNumber(updatedDate);
                this.updateWeeklyData(weekNumber, this.yearsListSelected);
                defaultSelected = weekNumber;
            }
             cpAccountList.filter((element)=>{
                if(element.checked === true && element.cp_billableDate){
                    this.cpAccount.push(element.cp_account_name)
                }
            })
        }

        this.setState({
            isBillable: nextProps.isBillable,
            selectedValue: defaultSelected,
            set: false
        });

    }
    componentDidMount(){
        document.title = "Trends";
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize.bind(this))
    }

    /***
     * resize - Resizing the donuts based on screen size
     */
    resize(){
        try {
            if(this.labelArray.length > 0){
                this.drawDonutCharts(this.labelArray, this.donutChartDataTotalCount,
                    this.donutChartData, this.donutChartDataWithUnits, this.title );
            }
        }catch(e) {
          console.log(e)

        }
        }



    /***
     *
     * @param timestamp - Epoch Time
     * @returns {GMT Date} - Converted to GMT Time from Local time
     */
    getGMTTime(timestamp){
// Multiply by 1000 because JS works in milliseconds instead of the UNIX seconds
        let date = new Date(timestamp * 1000);

        let year = date.getUTCFullYear();
        let month = date.getUTCMonth(); // getMonth() is zero-indexed,
        // so we'll increment to get the correct month number
        let day = date.getUTCDate();
        let hours = date.getUTCHours();
        let minutes = date.getUTCMinutes();
        let seconds = date.getUTCSeconds();

         month = (month < 10) ? '0' + month : month;
        day = (day < 10) ? '0' + day : day;
        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds: seconds;
        return new Date(year, month, day, hours, minutes, seconds)

       // return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    }

    /***
     *
     * @param selectedMonth  -> user selected month from drop down
     * @param selectedYear   -> User Selected year from drop down
     */
    showQuarterChart(selectedMonth, selectedYear) {
        if (selectedMonth >= 0 && selectedMonth < 3) {
            selectedMonth = 0;
        } else if (selectedMonth >= 3 && selectedMonth < 6) {
            selectedMonth = 3;
        } else if (selectedMonth >= 6 && selectedMonth < 9) {
            selectedMonth = 6;
        } else {
            selectedMonth = 9;
        }

        this.epochStartAndEndDateConverter(selectedMonth, 'quarter', selectedYear);
    }
    /***
     *
     * @param selectedMonth  ->  0-11 - Jan - Dec
     * @param selectedYear   ->  2016, 2017, 2018
     */
    showMonthlyChart(selectedMonth, selectedYear) {
        this.epochStartAndEndDateConverter(selectedMonth, 'month', selectedYear);
    }
    /***
     *
     * @param selectedWeek - User selected week number
     * @param selectedYear - User selected year
     */
    showWeeklyChart(selectedWeek, selectedYear) {
        this.epochStartAndEndDateConverter(selectedWeek, 'week', selectedYear);
    }

    /****
     *
     * @param current - Start Date
     * @returns {newDate} Format Sun Oct 01 2017 00:00:00 GMT-0700 (PDT)
     */
    getStartDate(current) {
        return new Date(current.getFullYear(), current.getMonth(), 1);
    }

    /***
     *epochStartAndEndDateConverter
     * @param selectMonth    -> User Selected Month
     * @param type - quarter, month, week
     */
    epochStartAndEndDateConverter(selectMonth, type, selectedYear) {
        let current = new Date();
        let previous = new Date();
        let prevDate;
        let currentDate;
        if (type === "quarter") {
            if (selectMonth === 0) {
                current.setMonth(2);
                current.setDate(30);
            } else if (selectMonth === 3) {
                current.setMonth(5);
                current.setDate(30);
            }
            else if (selectMonth === 6) {
                current.setMonth(8);
                current.setDate(30);
            } else {
                current.setMonth(11);
                current.setDate(30);
            }
            currentDate = current;
            previous.setMonth(selectMonth);
            prevDate = this.getStartDate(previous);
        } else if (type === "month") {
            current.setMonth(selectMonth - 1);
            current.setDate(30);
            currentDate = current;

            prevDate = this.getStartDate(current);
        }
        else if (type === "week") {
            // WEEK Start and End date
            let getStartWeek = getDateFromWeekNumber(selectedYear, selectMonth);
            let endWeek = addDays(getStartWeek, 6);

            prevDate = getStartWeek;
            currentDate = endWeek;

        }

        /* Format date [Year ,Month, Date] */
        let startDate = formatDate(prevDate);
        let endDate = formatDate(currentDate);
        startDate[2] = selectedYear;
        endDate[2] =   selectedYear;


        /* Epoch Start and End Date */
        let epochStartDate = new Date(startDate[2],
            startDate[0], startDate[1],
            -(new Date().getTimezoneOffset() / 60), 0).getTime() / 1000;
        let epochEndDate = new Date(endDate[2],
            endDate[0],
            endDate[1], -(new Date().getTimezoneOffset() / 60), 0).getTime() / 1000;

        this.getTrafficData(epochStartDate, epochEndDate, type);
    }

    /***
     ** WE WILL GET SP EDGE,UDN CORE AND UDN_PLUS Entire Data (Non Billable)
     * @param epochStartDate - epochFormatStartDate
     * @param epochEndDate - epochFormatEndDate
     * @param type - Month or weekly,quarterly
     */
    getTrafficData(epochStartDate, epochEndDate, type) {
        //showBillable
        let isChecked = $('#billableCheck').is(":checked");
        if(!isChecked){
            getHttpRequest("/getAllCPAccountsList?dateFrom=" +
                encodeURIComponent(epochStartDate) + "&dateTo=" + encodeURIComponent(epochEndDate),
                (result) => {
                let resultOutput = JSON.parse(result);
                this.getNonBillableDate(resultOutput, epochStartDate, epochEndDate , type);
            });
        }
        if(isChecked){
            getHttpRequest("/getAllCPAccountsListWithBillableData?dateFrom=" +
                encodeURIComponent(epochStartDate) + "&dateTo=" + encodeURIComponent(epochEndDate),
                (billableResult) => {
                let billable =  JSON.parse(billableResult);
                this.getBillableDate(billable,epochStartDate, epochEndDate , type);

            });
        }

    }

    /***
     * WE WILL GET SP EDGE,UDN CORE AND UDN_PLUS Billable Data
     * @param billable
     * @param epochStartDate
     * @param epochEndDate
     * @param type
     */
    getBillableDate(billable, epochStartDate, epochEndDate , type){
        let normalFormatStartDate = moment.unix(epochStartDate).format('YYYYMMDDHH');
        let normalFormatEndDate = moment.unix(epochEndDate).format('YYYYMMDDHH');
        getHttpRequest("/getTotalChinaDataTableBillable?dateFrom=" +
            encodeURIComponent(normalFormatStartDate) + "&dateTo=" + encodeURIComponent(normalFormatEndDate) ,
            (chinaBillableDataResult) => {
            let chinaBillableData = JSON.parse(chinaBillableDataResult);
            if(chinaBillableData.data.length > 0){
                chinaBillableData.data.map((element)=>{
                    element['traffic_total'] = element['billable_traffic_total'];
                    element['details_sp_account'] = _SERVICE_PROVIDER_ENUM.CHINA;
                    element['from'] = "ChinaTable";
                    //sum(dis.details_bytes)
                    billable.data.push(element)
                });
                this.allAccountsBillableTraffic = billable.data;
                this.formatData(billable.data, type);
            }else{
                this.allAccountsBillableTraffic = billable.data;
                this.formatData(billable.data, type);
            }
        })

    }
    /***
     * WE WILL GET CHINA DATA WITH THIS API CALL
     * @param  resultOutput
     * @param epochStartDate
     * @param epochEndDate
     * @param type
     */
    getNonBillableDate(
        resultOutput,
        epochStartDate,
        epochEndDate,type) {
        let normalFormatStartDate =
            moment.unix(epochStartDate).format('YYYYMMDDHH');
        let normalFormatEndDate =
            moment.unix(epochEndDate).format('YYYYMMDDHH');
        getHttpRequest("/getTotalChinaDataTable?dateFrom=" +
            encodeURIComponent(normalFormatStartDate) + "&dateTo=" +
            encodeURIComponent(normalFormatEndDate) , (chinaNonBillableData) => {
            let nonBillabillable = JSON.parse(chinaNonBillableData);
            nonBillabillable.data.map((element) => {
                element['total_bytes'] = element.traffic_total;
                element['details_sp_account'] = _SERVICE_PROVIDER_ENUM.CHINA;  // china
                element['from'] = "ChinaTable";
                resultOutput.data.push(element);
            });
            this.formatData(resultOutput.data, type);
            this.trafficData = resultOutput.data

        })
    }

    /***
     *
     * @param formatData
     * @param type -> quarter or month or weekly
     */
    formatData(formatData, type) {
        if (type === 'quarter') {
            this.drawDonutChart(formatData, type);
        } else if (type === 'month') {
            this.drawDonutChart(formatData, type);
        } else {
            this.drawDonutChart(formatData, type);
        }

    }

    /***
     *  dataArray - Contains combined SP-EDGE,UDN CORE, UDN PLUS, UDN OFFLOAD(UDN CHINA)
     * @param dataArray
     * @param type
     */
    drawDonutChart(dataArray, type) {
        let labelArray = [];
        let donutChartData = [];
        let donutChartDataWithUnits = [];
        let donutChartDataTotalCount = 0;
        let cpAccounts = {};
        let resultArray = [];
        if(this.cpAccount.length > 0){
            this.cpAccount.map( (element) =>{
                dataArray.map((data)=>{
                    if(element === data.cp_account_name){
                        resultArray.push(data)
                    }
                });
                // dataArray = result;
            });
        }
        /***
         * On Change of Billable date new array assigned it contains
         * Selected list
         */

        if(this.cpAccount.length > 0){
            dataArray = resultArray;
        }
            dataArray.map((element)=> {
                if (!cpAccounts['UDNCore']) {
                    cpAccounts['UDNCore'] = {};
                    cpAccounts.UDNCore['label'] = "UDN Core";
                    cpAccounts.UDNCore['count'] = 0;
                }
                if (!cpAccounts['UDNPlus']) {
                    cpAccounts['UDNPlus'] = {};
                    cpAccounts.UDNPlus['label'] = "UDNPlus";
                    cpAccounts.UDNPlus['count'] = 0;
                }
                if(!cpAccounts['UDNChina']){
                    cpAccounts['UDNChina'] = {};
                    cpAccounts.UDNChina['label'] = "UDN Offload";
                    cpAccounts.UDNChina['count'] = 0;
                }
                if (!cpAccounts['SPEdge']) {
                    cpAccounts['SPEdge'] = {};
                    cpAccounts.SPEdge['label'] = "SPEdge";
                    cpAccounts.SPEdge['count'] = 0;
                }
                if (element.details_sp_account <= _SERVICE_PROVIDER_ENUM.UDN.value) {
                    cpAccounts.UDNCore['count'] =
                        cpAccounts.UDNCore['count'] + element['total_bytes'];
                } else if (element.details_sp_account ===
                    _SERVICE_PROVIDER_ENUM.UDN_PLUS.value) {
                    cpAccounts.UDNPlus['count'] =
                        cpAccounts.UDNPlus['count'] + element['total_bytes'];
                } else if(element.details_sp_account.value ===
                    _SERVICE_PROVIDER_ENUM.CHINA.value){
                    if(!isNaN(element.traffic_total)){
                        cpAccounts.UDNChina['count'] =
                            cpAccounts.UDNChina['count'] + element.traffic_total;
                    }

                } else{

                    cpAccounts.SPEdge['count'] =
                        cpAccounts.SPEdge['count'] + element['total_bytes'];
                }
            });
        /***
         * Convert Units from bytes to KB,GB,TB Etc
         */
        for (let prop in cpAccounts) {
                //if(cpAccounts[prop].label !=='UDNPlus'){
                    labelArray.push(cpAccounts[prop].label);
                    let convertUnits =
                        convertBytesToHigherValues(cpAccounts[prop].count);
                    donutChartDataWithUnits.push(Math.round(convertUnits[0]) +" "+ convertUnits[1]);
                    donutChartData.push(cpAccounts[prop].count);
                    donutChartDataTotalCount += cpAccounts[prop].count;
                //}
        }
        let title = '';
        let valueId = this.props.chartType + '-value';
        // create chart id
        if (type === 'quarter') {
            let quarter = $('#' + valueId + ' .rw-input').text();
            let selectedMonth = 0;
            if (quarter === 'Q1') {
                selectedMonth = 0;
            } else if (quarter === 'Q2') {
                selectedMonth = 3;
            } else if (quarter === 'Q3') {
                selectedMonth = 6;
            } else {
                selectedMonth = 9;
            }
            let current = new Date();
            current.setMonth(selectedMonth);

            let date = new Date();
            let y = current.getFullYear();
            let m = current.getMonth();

            let firstDay = new Date(y, m, 1);
            let lastDay = new Date(y, m + 3, 0);
            if (date.getMonth() >= firstDay.getMonth() &&  date.getMonth() <= lastDay.getMonth()) {
                lastDay = date;
            }
            if(date.getMonth() + 1 === lastDay.getMonth() + 1
                && this.yearsListSelected === new Date().getFullYear()){
                title = 'Quarterly Traffic - '
                    + MONTHS[selectedMonth] + '/' + firstDay.getDate()
                    + ' to '  + this.schedulerRunDate;

            }else{
                title = 'Quarterly Traffic - '
                    + MONTHS[selectedMonth] + '/' + firstDay.getDate()
                    + ' to ' + MONTHS[selectedMonth + 2]
                    + '/' + lastDay.getDate();
            }

        } else if (type == 'month') {
            let month = $('#' + valueId + ' .rw-input').text();
            let current = new Date();
            let monthIndex = MONTHS.indexOf(month);
            current.setMonth(monthIndex);

            let date = new Date(), y = current.getFullYear(), m = current.getMonth();
            let firstDay = new Date(y, m, 1);
            let lastDay = new Date(y, m + 1, 0);
            let currentDate = new Date();
            if (date.getMonth() == monthIndex
                && this.yearsListSelected === new Date().getFullYear()) {
                lastDay = date;
            }
            if(currentDate.getMonth() === lastDay.getMonth()
                && this.yearsListSelected === new Date().getFullYear()){
                title = 'Monthly Traffic - '
                    + month + '/' + firstDay.getDate()
                    + ' to ' + this.schedulerRunDate;
            }else{

                title = 'Monthly Traffic - '
                    + month + '/' + firstDay.getDate()
                    + ' to ' + month + '/' + lastDay.getDate();

            }
        } else if (type == 'week') {
            let weeks = $('#' + valueId + ' .rw-input').text();
            let current = new Date();
            current.setFullYear(this.yearsListSelected);
            let weekNumber = getCurrentWeekNumber(current);
            let getStartWeek = getDateFromWeekNumber(current.getFullYear(), weeks);
            let endWeek = addDays(getStartWeek, 6);
            if(parseInt(weekNumber) === parseInt(weeks)
                && this.yearsListSelected === new Date().getFullYear()){
                title = 'Weekly Traffic - '
                    + MONTHS[getStartWeek.getMonth()] + '/'
                    + getStartWeek.getDate() + ' to '
                    + this.schedulerRunDate ;
            }else{
                      title = 'Weekly Traffic - '
                        + MONTHS[getStartWeek.getMonth()]
                        + '/' + getStartWeek.getDate()
                        + ' to ' + MONTHS[endWeek.getMonth()]
                        + '/' + endWeek.getDate();
            }


        }
   this.drawDonutCharts(labelArray, donutChartDataTotalCount, donutChartData, donutChartDataWithUnits, title );
        this.labelArray = labelArray;
        this.donutChartDataTotalCount = donutChartDataTotalCount;
        this.donutChartData = donutChartData;
        this.donutChartDataWithUnits = donutChartDataWithUnits;
        this.title = title;
    }

    /****
     *
     * @param labelArray
     * @param donutChartDataTotalCount
     * @param donutChartData
     * @param donutChartDataWithUnits
     * @param title
     */
    drawDonutCharts(labelArray, donutChartDataTotalCount, donutChartData, donutChartDataWithUnits, title){
        let makerColors = [
            ['rgb(255, 127, 14)', 'rgb(214, 39, 40)', 'rgb(44, 160, 44)', 'rgb(31, 119, 180)'],
            ['rgb(255, 127, 14)', 'rgb(214, 39, 40)', 'rgb(31, 119, 180)']
        ];
        let colorsSet = labelArray.length > 3 ? 0 : 1;
        let chartValue = convertBytesToHigherValues(donutChartDataTotalCount);

        let data = [{
            labels: labelArray,
            values: donutChartData,
            text: donutChartDataWithUnits,
            marker: {
                colors: makerColors[colorsSet]
            },
            textposition: 'outside',
            hoverinfo: 'none',
            textinfo: "text",
            hole: .4,
            type: 'pie',
            textfont: {
                family: 'sans serif',
                size: 18,
                color: 'rgba(255, 255, 255, 25)'
            },
        }];
        let width = $(".quarter-content").width() / 3 < 400 ? 400 : $(".quarter-content").width() / 3;
        let layout = {
            title: title,
            titlefont: {
                color: 'rgba(255, 255, 255, 25)',
            },
            margin: {
                l: 80,
                r: 50,
                b: 50,
                t: 135
            },
            annotations: [
                {
                    font: {
                        family: 'sans serif',
                        size: 18,
                        color: 'rgba(255, 255, 255, 25)',
                    },
                    showarrow: false,
                    text: Math.round(chartValue[0])+" "+chartValue[1],
                }],
            height: 400,
            width: width,
            plot_bgcolor: 'radial-gradient(circle, ' +
            'rgba(123, 6, 99, 0), ' +
            'rgba(123, 6, 99, .2)),' +
            ' linear-gradient(rgba(0, 169, 212, .5), rgba(0, 169, 212, .25))',
            paper_bgcolor: 'rgba(255, 255, 255, 1) transparent',
            legend: {
                orientation	:"h",
                y:'-0.15'
            }
        };

        $("#" + this.state.chartType + '-donutChart').html('');
        Plotly.newPlot(this.state.chartType + '-donutChart', data, layout);

    }

    /***
     * To get all the filter default values
     * @returns {Array}
     */
    getFilterValues() {
        if (this.state.selectedType === SELECTORS_TYPE.Quarterly.key) {
            return QUARTERS;
        } else if (this.state.selectedType === SELECTORS_TYPE.Monthly.key) {
            return MONTHS;
        } else if (this.state.selectedType === SELECTORS_TYPE.Weekly.key) {
            let weekArray = [];
            let numberOfWeeks = moment().isoWeeksInYear();
            for (let i = 1; i <= numberOfWeeks; i++) {
                weekArray.push(i);
            }
            return weekArray;
        }
    }

    /***
     * updating value based on drop down selection
     * @param chartType - Quarterly
     * @returns {number}
     */
    getDefaultSelection(chartType) {
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let selectedQarter = 0;
        if (chartType === SELECTORS_TYPE.Quarterly.key) {
            if (currentMonth >= 0 && currentMonth < 3) {
                selectedQarter = 0;
            } else if (currentMonth >= 3 && currentMonth < 6) {
                selectedQarter = 1;
            } else if (currentMonth >= 6 && currentMonth < 9) {
                selectedQarter = 2;
            } else {
                selectedQarter = 3;
            }
            return QUARTERS[selectedQarter];
        } else if (chartType === SELECTORS_TYPE.Monthly.key) {
            return MONTHS[currentDate.getMonth()];
        } else if (chartType === SELECTORS_TYPE.Weekly.key) {
            let currentDate = new Date();
            return getCurrentWeekNumber(currentDate);

        }
    }

    /***
     * It will update WeeklyData
     * @param event -  selected month index
     * @param selectedYear - selected year
     */
    updateWeeklyData(event, selectedYear) {
        this.showWeeklyChart(parseInt(event), selectedYear)
    }
    /***
     * It will update MonthlyData
     * @param event -  selected month index
     * @param selectedYear - selected year
     */
    updateMonthlyData(event, selectedYear) {
        this.showMonthlyChart(MONTHS.indexOf(event) + 1, selectedYear)
    }
    /****
     * It will update QuarterlyData
     * @param event
     * @param selectedYear
     */
    updateQuarterlyData(event, selectedYear) {
        let selectedMonth = this.getSelectedForQuarter(event);
        this.showQuarterChart(selectedMonth, selectedYear)
    }
    /***
     *
     * @param event -> Q1,Q2,Q3,Q4
     * @returns {number} ->selected quarter month
     */
    getSelectedForQuarter(event) {
        let selectedMonth = 0;
        if (event === 'Q1') {
            selectedMonth = 0;
        } else if (event === 'Q2') {
            selectedMonth = 3;
        } else if (event === 'Q3') {
            selectedMonth = 6;
        } else {
            selectedMonth = 9;
        }
        return selectedMonth;
    }
    /***
     *
     * @param value -> Monthly or Weekly or Quarterly it will
     * update the drop down selector
     */
    updateWithSelector(value) {
        let currentDate = new Date();
        if (value === SELECTORS_TYPE.Quarterly.key) {
            this.showQuarterChart(currentDate.getMonth(),  this.yearsListSelected);
        } else if (value ===  SELECTORS_TYPE.Monthly.key) {
            this.showMonthlyChart(currentDate.getMonth() + 1,  this.yearsListSelected);
        } else if (value === SELECTORS_TYPE.Weekly.key) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            this.showWeeklyChart(moment(currentDate).isoWeek(),  this.yearsListSelected);
        }

        let defaultSelection = this.getDefaultSelection(value);
        this.setState({
            selectedType: value,
            selectedValue: defaultSelection
        })
    }
    /***
     *
     * @param value -> (Month- Jan - Dec) or (Week - 1- 51) or (Quad - Q1 - Q4)
     */
    updateWithValue(value) {
        if (this.state.selectedType === SELECTORS_TYPE.Weekly.key) {
            this.showWeeklyChart(parseInt(value), this.yearsListSelected)
        } else if (this.state.selectedType === SELECTORS_TYPE.Monthly.key) {
            this.showMonthlyChart(MONTHS.indexOf(value) + 1, this.yearsListSelected)
        } else if (this.state.selectedType === SELECTORS_TYPE.Quarterly.key) {
            let selectedMonth = 0;
            if (value === 'Q1') {
                selectedMonth = 0;
            } else if (value === 'Q2') {
                selectedMonth = 3;
            } else if (value === 'Q3') {
                selectedMonth = 6;
            } else {
                selectedMonth = 9;
            }
            this.showQuarterChart(selectedMonth, this.yearsListSelected)
        }
        this.setState({
            selectedValue: value
        })
    }

    /***
     *
     * @returns {xml}
     */
    render() {
        let defaultValues = this.getFilterValues();
        
        return <div>
            <div className='quarter-content'>
                <div className="col-md-6 col-lg-4 col-sm-12 dropdown-item-donut">
                    <DropdownList
                        className="selector-dropdown drop-down-all"
                        id={this.props.chartType + '-selector'}
                        value={this.state.selectedType}
                        data={SELECTORS}
                        onChange={(e) => this.updateWithSelector(e)}
                    />
                    <DropdownList
                        className="value-dropdown drop-down-all"
                        value={this.state.selectedValue}
                        id={this.props.chartType + '-value'}
                        data={defaultValues}
                        onChange={(e) => this.updateWithValue(e)}
                    />
                    <div id={this.props.chartType + "-donutChart"}></div>
                </div>
            </div>
        </div>
    }
}


export default GraphWithFilters;

GraphWithFilters.propTypes = graphWithFiltersProtoTypes;
