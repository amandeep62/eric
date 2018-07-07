import { Component } from 'react';
import { DropdownList } from 'react-widgets';
import TrafficChartView from "./TrafficChartView";
import PropTypes from "prop-types";
const plotTrafficChart = {
    trafficTableData: PropTypes.array,
    cpAccountList: PropTypes.array,
};

class PlotTrafficChart extends Component {
    /***
     * This component is used display donut chart
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        let charts = ['Donut Chart'];
        this.checkBoxValue = this.checkBoxValue.bind(this);
        this.state = {
            chartType: charts[0],
            charts: charts,
            trafficTableData: this.props.trafficTableData,
            cpAccountList: this.props.cpAccountList,
            selectCheckBox: false,
            callBackSelectBox: false,
            getTableRecords: []
        }
    }

    /***
     * Changing Chart Type : As of now we have only one chart - Donut
     * @param value
     */
    changeChartType(value) {
        this.setState({
            chartType: value
        });
    }
    /***
     * Setting selected checkbox value
     * @param value
     */
    checkBoxValue(value) {
        this.setState({
            selectCheckBox: value,
            callBackSelectBox: false
        })
    }

    /***
     *
     * @returns {xml}
     */
    render() {
        let content = '';

        if (this.state.chartType === 'Donut Chart') {
            content = <div id='showChart'>
                <TrafficChartView chartType='quarter' cpAccountList={this.state.cpAccountList}
                    checkBoxValue={this.checkBoxValue} />
            </div>
        }

        return (
            <div className="traffic-graphs">
                <div className="row">
                    <div className="col-md-2 col-lg-2 col-sm-2 top_btn">
                        <DropdownList
                            className="drop-down-all"
                            defaultValue={this.state.chartType}
                            data={this.state.charts}
                            onChange={(e) => this.changeChartType(e)}
                        />
                    </div>
                </div>
                {content}
            </div>
        )
    }
}
PlotTrafficChart.propTypes = plotTrafficChart;
export default PlotTrafficChart;

