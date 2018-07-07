import React, {Component} from 'react';
import DonutChartLevel from "../../Charts/DonutChart";


class UDNStatusDashboard extends Component {

    constructor(props, context) {
        super(props, context);
        this._handleDocumentClick = this._handleDocumentClick.bind(this);
        this.chartToolTip = this.chartToolTip.bind(this);
        this.resultToDrawFirstGraph = this.resultToDrawFirstGraph.bind(this);
        this.bugOrigin = null;
        this.priorityOrigin = null;
        this.statusOrigin = null;
        this.state = {
            resultToDrawGraph: [],
            loading: true,
            searchQuery:"",
            moduleList: ['"CDX"', '"UDNP"', '"CS"', '"DO"', '"DOC"', '"LB"', '"MON"', '"AN"', '"CIS"', '"RENG"'],
            statusGraph:false,
            priorityGraph:false,
            selectedSegmentIndex:null
        }

    }

    componentWillReceiveProps(nextProps) {
        let  moduleList = [];
        if(nextProps.moduleSelected == 'ALL'){
            moduleList = ['"CDX"', '"UDNP"', '"CS"', '"DO"', '"DOC"', '"LB"', '"MON"', '"AN"', '"CIS"', '"RENG"'];
        }else{
            let moduleListSelected = '"'+nextProps.moduleSelected+'"';
            moduleList.push(moduleListSelected)
        }

        this.fetchAllTheRecords(moduleList , nextProps.selectedVersion.replace("UDN ","")); // Only summary view

        this.setState({
            statusGraph:false,
            priorityGraph:false,
        })

    }
    componentWillMount () {
        document.addEventListener("click", this._handleDocumentClick, false);

    }

    chartToolTip(chart,e,chartSelectedId,data,elements) {
    }

    _handleDocumentClick(event){
    }

    // @fetchAllTheRecords(ModuleList[], version)
    fetchAllTheRecords(moduleList ,affectedVersion){
        let searchQuery;
        if(affectedVersion === "Summary"){
            searchQuery = 'jql=project in ('+ moduleList.toString() +') AND affectedVersion = '+ effectedVersion +'  AND issuetype in (Bug) AND status != "DONE"&fields=project,status,issuetype,priority,customfield_11600,versions,fixVersions';
        }else{
            let effectedVersion;
            if(affectedVersion == 2){

                effectedVersion = affectedVersion+".0";

            }else{
                effectedVersion = affectedVersion+".0";
            }

            searchQuery = 'jql=project in ('+ moduleList.toString() +') AND fixVersion = '+ effectedVersion +' AND status != "DONE"&fields=project,status,issuetype,priority' +
                ',versions,fixVersions';
        }
        getHttpRequest('/query?'+searchQuery, (result) =>{
            let records = JSON.parse(result);
            let totalList = this.formatApiResults(records);
            let resultToDrawGraph = this.resultToDrawFirstGraph(totalList);
            this.setState({
                resultToDrawGraph:resultToDrawGraph,
                loading: false,
                moduleList:moduleList.toString()
            });
        })
    }

    // @formatApiResults(records)
    formatApiResults(records) {
        let formattedRecords = [];
        records.map((element)=>{
            let item = {
                "priority":element.fields.priority.name,
                "filterKey":element.fields.project.key,
                "status":element.fields.status.name
            };
            formattedRecords.push(item);
        });
        return formattedRecords
    }

    resultToDrawFirstGraph(totalList){
        let dataToDrawChart = [];
        let labelArray = [];
        let dataArray= [];
        labelArray = totalList.map(function(obj) { return obj.status; });
        labelArray = labelArray.filter(function(v,i) { return labelArray.indexOf(v) === i; });

        labelArray.map((environmentName,index)=>{
            let tempArray = [];
            let count = 0;
            totalList.map((element)=>{
                if(element.status === environmentName){
                    if(dataArray[index] != null)
                        dataArray[index] = dataArray[index] + 1;
                    else
                        dataArray[index]=1;
                }
            });
        });


        let obj ={
            data: dataArray,
            label: labelArray
        }

        return obj;

    }


    render() {
        let statusOriginDonutChart;
        let statusGraphResult = this.state.resultToDrawGraph;
        let gridClass = "col-sm-offset-4 col-sm-4 col-sm-offset-4";

        const { loading } = this.state;
        let typeOfChart = "doughnut";
        let backgroundColor = [
            'rgba(112,118,127,0.7)',
            'rgba(148,188,255,0.7)',
            'rgba(225,236,255,0.7)',
            'rgba(0,172,214,0.7)',
            'rgba(180,189,204,0.7)'
        ];

        if(loading) {
            return (<div id="graphDiv"><div className="loader"></div></div>); // render null when app is not ready
        }
        if(statusGraphResult){
            let chartID=null;
             if(this.props.popUpStatusId){
                chartID=this.props.popUpStatusId;
             }
             else{
                chartID="status";
             }
            let statusChartData = statusGraphResult.data;
            let statusChartlegends = statusGraphResult.label;
            statusOriginDonutChart =
                <div className="brick brick-chart doughnut-chart">
                    <div className="chart">
                        <DonutChartLevel
                            chartTitle="Status"
                            dataSet={statusChartData}
                            backgroundColor={backgroundColor}
                            labels = {statusChartlegends}
                            legendClick=""
                            chartId={chartID}
                            typeOfChart={typeOfChart}
                            title={"status"}
                            toolTip={this.chartToolTip}
                        />
                    </div>
                    <div className="legend">
                        {
                            backgroundColor.map((v,i)=>{
                                if(i<statusChartlegends.length) {
                                    return (
                                        <div className="entry">
                                            <span className="swatch" style={{backgroundColor: v}}></span>{statusChartlegends[i]}
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                </div>;
        }

        return (

            <div id="quality-chart">
                <div className="content-section">
                    {statusOriginDonutChart}
                </div>
            </div>);
        {/* <ToolTipComponent list={["JIRA Link","Status","Priority"]}/>*/}

    }
}

export default UDNStatusDashboard;