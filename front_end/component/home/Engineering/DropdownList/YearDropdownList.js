import {Component} from 'react';
import {store} from "../Store/Store";

class YearDropdownList extends Component {

    /**
     * Initialize the year dropdown list by setting the current year.
     * @param props
     * @param context
     */
    constructor(props, context) {
        
        super(props, context);
        let currentDate = new Date();
        this.onYearSelect = this.onYearSelect.bind(this);
        this.currentYear = currentDate.getFullYear();

        //build the list of years for the dropdown list
        
        this.state = {
                yearsArray: [],
                selectedYear : this.props.year ? this.props.year : this.currentYear
            };
    }

    componentWillMount(){
        let that = this;
        getHttpRequest("/years", function (years) {
                    let allYears = JSON.parse(years);
                    allYears = allYears.map((item, index) => {
                        return { "id": index + 1, "year": item.year }
                    });
                    that.setState({
                        yearsArray : allYears
                    });
                });
    }

    /**
     * This even handler is triggered when there is a change in the year dropdown list selection.
     * @param e - Event object that resulted from this new selection
     */
    onYearSelect(e){
        let year = e.target.options[e.target.options.selectedIndex].text;
        
        //need to store it first
        store.dispatch({
            type: 'YEAR_UPDATE',
            year: parseInt(year),
            tabId: this.props.engineeringTabId
        });

        this.props.onYearSelectCallBack ? this.props.onYearSelectCallBack(year) : null;

        //then send the changes to the callback function
        this.setState({
            selectedYear: parseInt(year)
        });

    }


    /**
     * Render year dropdown list
     * @returns {XML}
     */
    render(){
        let selectedYearState = store.getState();
        let currentTab = selectedYearState.find(item => item.tabId === this.props.engineeringTabId);


        return <select
            className="select-udn"
            value={ currentTab.year }
            onChange={(e)=>this.onYearSelect(e)} >
            {
                this.state.yearsArray.map((data, index) => {
                    return (<option key={"Year" + index} value={data.year} >{data.year}</option>)
                })
            }
        </select>
    }
}

export default YearDropdownList;