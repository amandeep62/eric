

var KPIChart = React.createClass({
    getInitialState: function () {

        return ({allCharts:this.props.allCharts});
    },

    addChart: function (event) {

        var chartType = event.target.name;
        var that = this;
        event.preventDefault();
        var version_id = this.props.version_id;
        var chartTitle = this.refs["chartTitle_"+chartType].value;
        if(chartTitle.trim()!='') {
            var dict = {version_id: version_id, title: chartTitle,chartType:chartType}
            postHttpRequest("/insert_development_kpi_cms", dict, function (data) {
                var that1 = that;
                alert(data)

                getHttpRequest("/get_development_kpi_cms?version_id=" + version_id, function (data) {
                    var allCharts = JSON.parse(data);
                    that1.setState({allCharts:allCharts});

                })
            })
        }
        else{
            alert("Please enter chart title");
        }
    },

    updateChartDataByVersion: function () {
        var version_id = this.props.version_id;
        var that = this;
        getHttpRequest("/get_development_kpi_cms?version_id=" + version_id, function (data) {
            var allCharts = JSON.parse(data);
            that.setState({allCharts:allCharts});
        })

    },

    componentDidMount: function(){
        window.updateChartDataByVersion = this.updateChartDataByVersion // Etc.
    },
    
    render: function () {

        var that = this;
        return <div>

            {this.state.allCharts.map(function (dictChart) {
                var arrayKPI = dictChart.chartKPI;
                return <div><div className="donutChartType">{dictChart.chartType}</div>
                    <div style={{margin:'auto 0',textAlign:'center'}}><input type="text" ref ={"chartTitle_"+dictChart.chartType} />&nbsp;<a href="#" onClick={that.addChart} name={dictChart.chartType} >Add</a></div>
                <div className="rTable">
                    <div className="rTableHead"><strong>Chart Title</strong></div>
                    <div className="rTableHead"><span style={{fontweight: 'bold'}}>Achieved</span></div>
                    <div className="rTableHead"><span style={{fontweight: 'bold'}}>Remaining</span></div>
                    <div className="rTableHead"><span style={{fontweight: 'bold'}}>Goal</span></div>
                    <div className="rTableHead"><span style={{fontweight: 'bold'}}>Seq</span></div>
                    <div className="rTableHead">&nbsp;</div>
                    <div className="rTableHead">&nbsp;</div>


                        { arrayKPI.map( function (dict) {
                            return <Chart dictChart={dict} version_id = {that.props.version_id} updateChartDataByVersion={that.updateChartDataByVersion} />
                        })
        }</div></div>
        })}
        </div>
    }

})

var Chart = React.createClass({
    getInitialState: function () {
     return({dictChart:this.props.dictChart,edit:false});
    },
    editClick:function (event) {
        event.preventDefault();
        var that = this;
        if(this.state.edit){
            var dictChart = {development_id:this.state.dictChart.development_id,title:this.refs.inputTitle.value,achieved:this.refs.inputAchieved.value,remaining:this.refs.inputRemaining.value,goal:this.refs.inputGoal.value,sequence_number:this.refs.inputSequenceNumber.value};
            postHttpRequest("/update_development_kpi_cms",dictChart,function (data) {
                alert(data)
                that.setState({dictChart:dictChart,edit:!that.state.edit});
            })
        }
        else{
            this.setState({edit:!this.state.edit});
        }


    },

    deleteClick: function (event) {

        var that = this;
        event.preventDefault();
        var r = confirm("Do you want to delete "+this.state.dictChart.title+" chart?");
        if (r == true) {
            var development_id = this.state.dictChart.development_id;
            getHttpRequest("/delete_development_kpi_cms?development_id=" + development_id, function (data) {
                var that1 = that;
                alert(data);
                that.props.updateChartDataByVersion();
            });
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            dictChart : nextProps.dictChart
        })
    },

    render: function () {
        var dictChart = this.state.dictChart;
        var edit = this.state.edit;
        return(
        <div className="rTableRow">
            <div className="rTableCell">{edit?<input type = 'text' size="15" ref="inputTitle" defaultValue = {dictChart.title} />:dictChart.title }</div>
            <div className="rTableCell">{edit?<input type = 'text' size="6" ref="inputAchieved" defaultValue = {dictChart.achieved} />:dictChart.achieved}</div>
            <div className="rTableCell">{edit?<input type = 'text' size="6" ref="inputRemaining" defaultValue = {dictChart.remaining} />:dictChart.remaining}</div>
            <div className="rTableCell">{edit?<input type = 'text' size="6" ref="inputGoal" defaultValue = {dictChart.goal} />: dictChart.goal}</div>
            <div className="rTableCell">{edit?<input type = 'text' size="6" ref="inputSequenceNumber" defaultValue = {dictChart.sequence_number} />: dictChart.sequence_number}</div>
            <div className="rTableCell"><a href="#" onClick={this.editClick}>{!edit?"Edit":"Save"}</a></div>
            <div className="rTableHead"><a href="#" onClick={this.deleteClick}>Delete</a></div>
        </div>);
    }
})


window.KPIChart = KPIChart;