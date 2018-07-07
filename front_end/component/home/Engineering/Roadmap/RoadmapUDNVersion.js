import React, {Component} from 'react';
import {userPermissions} from '../../../../constants/constants';
import {getAllModules,getAllThemes} from "../CommonFunction"

class RoadmapUDNVersion extends Component {

    constructor(props, context) {

        super(props, context);


        this.filterByModule = this.filterByModule.bind(this);

        var that = this;
        var version_id = this.props.version_id;
        var tempArray = [];


        this.props.callBackToGetRefOfRoadmapUDNVersion(this);

        getHttpRequest('/getReleaseScopeByVersion?version_id=' + version_id, function (data) {
            getAllModules((allModulesArray)=>{
                getAllThemes((allThemesArray)=>{

                    if (data.length > 0) {
                        var allChartData = JSON.parse(data);
                        that.state.allScopeList.map(function (data1) {
                            if (allChartData.rows[0].module_name === data1.module_name) {
                                tempArray.push(data1);
                            }
                        });
                        that.setState({
                            scopeList: allChartData.rows,
                            allScopeList: allChartData.rows,
                            scopeHeader: allChartData.rows.length>0?allChartData.rows[0].module_name:"",
                            moduleList:allModulesArray,
                            themeList:allThemesArray,
                        });
                    }
                    else {
                        that.setState({
                            scopeList: null,
                            allScopeList: null,
                            scopeHeader: '',
                            moduleList:allModulesArray,
                            themeList:allThemesArray,
                        });
                    }

                })
            })


        });


        this.state = ({
            scopeList: [],
            allScopeList: [],
            moduleList: [],
            themeList: [],
            scopeHeader: null,
            moduleCheck: "ALL",
            themeCheck: "ALL",
            didEditable: []
        });
    }

    componentWillReceiveProps(nextProp) {
        var version_id = nextProp.version_id;
        var that = this;
        getHttpRequest('/getReleaseScopeByVersion?version_id=' + version_id, function (data) {
            var allChartData = JSON.parse(data);
            that.setState({
                scopeList: allChartData.rows,
                allScopeList: allChartData.rows,
                moduleCheck: "ALL",
                themeCheck: "ALL"
            });
        });
    }


    filterByModule(event) {
        var tempArray = [];
        var scope = $("#scopelist").val();
        var theme = $("#themelist").val();

        if(this.state.allScopeList.length>0) {
            let scopeThemeArray;
            if(scope=="ALL" && theme=="ALL"){
                scopeThemeArray = this.state.allScopeList;
            }
            else if(scope=="ALL"){
                scopeThemeArray = this.state.allScopeList.filter(item => (
                      theme.toUpperCase() == item.release_theme.toUpperCase()))
            }
            else if(theme=="ALL"){
                scopeThemeArray = this.state.allScopeList.filter(item => (
                    scope.toUpperCase() == item.module_name.toUpperCase()))
            }

            else{
                scopeThemeArray = this.state.allScopeList.filter(item => (
                    scope.toUpperCase() == item.module_name.toUpperCase())
                    &&  ((theme.toUpperCase() == item.release_theme.toUpperCase())))
            }



            this.setState({
                scopeList: scopeThemeArray,
                themeCheck: theme,
                moduleCheck: scope,
            });
        }
    }





    render() {
        var tableData = [];
        var that = this;
        if (this.state.scopeList !== null) {
            tableData = this.state.scopeList;
        }
        if(!this.props.releaseDashboardScope) {
            return (
                <div className="section-container">

                    <div className="tableDivScroller">
                        {this.state.themeList.map(function (theme, index) {
                            if ((theme.toUpperCase() == that.state.themeCheck.toUpperCase() || that.state.themeCheck.toUpperCase() == "ALL") && (theme.toUpperCase() != "ALL"))
                                return (
                                    <div  key={"div"+index}>
                                        <div>
                                            <div className="themeHeader pull-left">{theme}</div>
                                            {localStorage.userPermissions == userPermissions ?
                                                <div id={index} className="pull-right dropdown editScope">

                                                    <ul className="dropdown-menu dropdown-menu-right">
                                                        <li>
                                                            <a className="deleteScope" onClick={that.deleteScopeAll}
                                                               id={index}>
                                                            <span
                                                                className="glyphicon glyphicon-remove info-icon-padding deleteIcon"
                                                                aria-hidden="true"></span>
                                                                Delete</a>
                                                        </li>
                                                        <li>
                                                            <a className="addScope"
                                                               onClick={() => that.addScopeIcon(theme, index)}>
                                                                <div
                                                                    className="glyphicon glyphicon-plus info-icon-padding addIcon">
                                                                </div>
                                                                Add
                                                            </a>
                                                        </li>
                                                    </ul>

                                                </div> : ""}
                                        </div>

                                        <table id={"scopeTable" + index}
                                               className="table table-striped table-analysis plan-table">
                                            <thead>
                                            <tr className="plan-header-row">
                                                <th style={{display: 'none',}}>
                                                    Scope
                                                </th>
                                                <th style={{display: 'none',}}>
                                                    Theme
                                                </th>
                                                <th className="plan-table-td">
                                                    JIRA link
                                                </th>
                                                <th className="plan-table-td">
                                                    Executive Summary
                                                </th>
                                                <th>
                                                    Modules
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="plan-body-row">{
                                                tableData.map(function (data, index) {
                                                    let contentEditable = false;
                                                    var editable = false
                                                    that.state.didEditable.map(function (editId,index) {
                                                        if (data.scope_id == editId) {
                                                            editable = true;
                                                        }
                                                    });
                                                    if (data.release_theme.toUpperCase() == theme.toUpperCase()) {
                                                        var blankTD = "";

                                                        if (data.module_name == "" || editable == true) {
                                                            contentEditable = true;
                                                            blankTD = <select  key={"Select"+index} className="dropdown-button"
                                                                              id={"module_name1" + index}
                                                                              value={that.selectedItems}>
                                                                {
                                                                    that.state.moduleList.map(function (dataModule,index) {
                                                                        return (<option className="dropdown-item"
                                                                                        value={dataModule}>{dataModule}</option>);
                                                                    })
                                                                }
                                                            </select>;
                                                        }
                                                        else {
                                                            blankTD = data.module_name;
                                                        }
                                                        return (
                                                            <tr  key={"tr"+index} id={"id" + index} contentEditable={contentEditable}>
                                                                <td ref="scopeId"
                                                                    style={{display: 'none',}}>{data.scope_id}</td>
                                                                <td ref="releaseTheme"
                                                                    style={{display: 'none',}}>{data.release_theme}</td>
                                                                <td ref="capabilities"
                                                                    className="plan-table-td"><a style={{fontSize: '12px',color:'white'}} href={"https://jira.ericssonudn.net/browse/"+data.issue_key} target="_blank" >{data.issue_key}</a></td>
                                                                <td ref="description"
                                                                    className="plan-table-td">{data.description}</td>
                                                                <td ref="module_name">
                                                                    {blankTD}

                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                )
                        })}

                    </div>
                </div>

            );
        }else{
            let easeOfOperations = [];
            let customerExperience = [];
            let performance = [];
           if(tableData.length>0){
              tableData.map((element)=>{
                  if(element.release_theme == 'Ease of Operations'){
                      easeOfOperations.push(element)
                  }
                  if(element.release_theme =='Customer Experience'){
                      customerExperience.push(element)
                  }
                  if(element.release_theme =='Performance'){
                      performance.push(element)
                  }

              })

           }
            return(
                <div>
                <div className="row" style={{"color":"#ffffff"}}>
                    <div className="col-md-4">
                        <div className="blueLine"><span>Ease of Operations</span><h1></h1></div>
                        {easeOfOperations.length>0?easeOfOperations.map((element,index)=>{
                                return(<div  key={"div1"+index} className="col-md-12">
                                    <li>{element.capabilities}</li>
                                </div>)
                            }):"NO Records"
                        }
                    </div>
                    <div className="col-md-4">
                        <div className="blueLine"><span>Customer Experience</span><h1></h1></div>

                        {customerExperience.length>0?customerExperience.map((element,index)=>{
                            return(<div  key={"div2"+index} className="col-md-12">
                                <li>{element.capabilities}</li>
                            </div>)
                        }):"NO Records"
                        }
                    </div>
                    <div className="col-md-4">
                        <div className="blueLine"><span>Performance</span><h1></h1></div>

                        {performance.length>0?performance.map((element,index)=>{
                            return(<div  key={"divPerformance"+index} className="col-md-12">
                                <li>{element.capabilities}</li>
                            </div>)
                        }):"NO Records"
                        }
                    </div>
                </div>
                </div>
            )
        }
    }
}

export default RoadmapUDNVersion;


