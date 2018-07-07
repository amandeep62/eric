

import { Component } from 'react'
import classNames from 'classnames';
import Modal from '../../globals/ModalPopup/modal'
import {getAllVersions} from '../CommonFunction'
import {roadMapYearWidth,roadMapYearIncrement,userPermissions} from "../../../../constants/constants"
import "./roadmap.less";
import {DropdownList} from 'react-widgets';
import {deleteHttpRequest} from "../../../../httprequest/http_connection";
var DatePicker = require("react-bootstrap-date-picker");


class Roadmap extends Component {

    constructor(props, context) {
        super(props, context);

        this.dataUpdate = this.dataUpdate.bind(this);
        this.nextClick = this.nextClick.bind(this);
        this.prevClick = this.prevClick.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.saveEditClickCallback = this.saveEditClickCallback.bind(this);


        var currYear = new Date().getFullYear();
        this.sprintPlanData = [];


        this.state = ({
            sprintPlanArray: [],
            dataArray: this.props.dataArray,
            selectYear: currYear,
            formattedData: [],
            roadmapData: [],
            capabilities: [],
            selectedSession: 2,
            roadmapDataFix: [],
            versionsArray: [],
            modalViewOpen:false,
            roadMapXScrollNumber:roadMapYearWidth
        });

        this.loadRoadMapData();

    }

    loadRoadMapData(){
        var that = this;
        var currYear = new Date().getFullYear();
        getAllVersions(currYear,function (versionsArray) {
            getHttpRequest("/get_udn_roadmap", function (data) {
                var sprintDataArray = JSON.parse(data);
                getHttpRequest("/getCapabilities?versions=" + "'" + versionsArray.join(',') + "'", function (dataCapabilities) {
                    var capabilities = JSON.parse(dataCapabilities);
                    that.dataUpdate(currYear,sprintDataArray);
                    var yearCount = that.getYearCount(sprintDataArray);
                    that.setState({versionsArray:versionsArray,
                        sprintPlanArray:sprintDataArray,
                        roadmapArray:sprintDataArray,
                        roadMapXScrollNumber:roadMapYearWidth*(yearCount),
                        modalViewOpen:false
                    });

                });
            })

        })
    }

    dataUpdate(selectedYear,sprintDataArray) {
        switch (selectedYear) {
            case 2017:
                if (typeof (selectedYear) === 'number') {
                    selectedYear = selectedYear;
                } else if (typeof (selectedYear) === 'string') {
                    selectedYear = parseInt(selectedYear);
                }
                break;
            case "ALL": selectedYear = "ALL";
                break;
            default: selectedYear = parseInt(selectedYear);
        }

        let that = this;
        let yearArray;
        sprintDataArray.sort(function (value1, value2) {
            return (new Date(value1.end_date).getTime() - new Date(value2.end_date).getTime());
        });


        yearArray = [2016, 2017, 2018];

        sprintDataArray.map(function (element) {
            let queaterNumber = that.getQuarterPerYear(element.end_date)
            let obj = {
                end_date: element.end_date,
                name: element.name,
                feature: element.feature,
                quarter: queaterNumber,
                year: new Date(element.end_date).getFullYear()
            }
            that.sprintPlanData.push(obj);
        });

        let newArray = [];
        let quartersArray = [1, 2, 3, 4];

        yearArray.map(function (yearElement) {
            quartersArray.map(function (quarterElement) {
                let obj = {
                    end_date: null,
                    name: null,
                    feature: null,
                    quarter: quarterElement,
                    year: yearElement
                }
                newArray.push(obj);
            });
        });

        newArray.map(function (element, index) {
            that.sprintPlanData.map(function (dataElement) {
                if (element.year === dataElement.year) {
                    if (element.quarter === dataElement.quarter) {
                        newArray[index] = dataElement;
                    }
                }
            });
        });
        that.state.formattedData = newArray;
    }

    componentWillReceiveProps(nextProps) {
       //this.dataUpdate(nextProps.selectYear);
    }

    getYearCount(sprintPlanDataArray){
        var yearCount=1;
        var prevYear=0

        sprintPlanDataArray.filter(function(element,index,array){
            var date = new Date(element.end_date);
            var year = date.getFullYear();
            var currentDate = new Date();
            if(year==currentDate.getFullYear()){
                return;
            }
            else if(year<currentDate.getFullYear()){

                if(prevYear != year){
                    yearCount++;
                }
                prevYear = year;
            }
        })

        return yearCount;
    }

    getTotalYearCount(sprintPlanDataArray){
        var yearTotalCount=0;
        var prevYear=0

        sprintPlanDataArray.filter(function(element,index,array){
            var date = new Date(element.end_date);
            var year = date.getFullYear();
            var currentDate = new Date();
                if(prevYear != year){
                    yearTotalCount++;
                }
                prevYear = year;
        })

        return yearTotalCount;
    }


    getQuarterPerYear(date) {
        let newDate = new Date(date);
        let month = newDate.getMonth() + 1;
        if (month < 4) {
            return 1;
        } else if (month > 3 && month <= 6) {
            return 2;
        } else if (month >= 7 && month <= 9) {
            return 3;
        } else if (month >= 10 && month <= 12) {
            return 4;
        }
    }

    onVersionSelect(){

    }

    nextClick(){
        let roadMapXScrollNumber = this.state.roadMapXScrollNumber;
        let totalYearCount = this.getTotalYearCount(this.state.sprintPlanArray);

        let roadMapXScrollInc= roadMapXScrollNumber;
        if(roadMapXScrollNumber>=(totalYearCount-1)*(roadMapYearIncrement)){
            return;
        }
        else{
            roadMapXScrollInc= roadMapXScrollNumber+roadMapYearIncrement;
        }
        this.setState({roadMapXScrollNumber:roadMapXScrollInc});
    }

    prevClick(){

        let roadMapXScrollNumber = this.state.roadMapXScrollNumber;
        if(roadMapXScrollNumber<=roadMapYearIncrement){
            return;
        }

        let roadMapXScrollInc= roadMapXScrollNumber-roadMapYearIncrement;
        this.setState({roadMapXScrollNumber:roadMapXScrollInc});

    }

    openModal(){
        this.setState({modalViewOpen:true});
    }
    closeModal(){
        this.setState({modalViewOpen:false});
    }

    saveEditClickCallback(){
        this.loadRoadMapData()
    }

    render() {
        let quarterSpan = null;
        let yearSpan = null;
        let activeQuarter = null;

        var timeList = this.state.formattedData.map(function (data, index) {

            quarterSpan = null;
            yearSpan = null;
            activeQuarter = 'resetLine';

            if (data.feature) {
                var feature = data.feature.map(function (element, index) {
                    return <p key={index}>- {element}<br /></p>
                });
            }

            if (data.quarter !== null) {
                quarterSpan = <span className="quarterPeriod">Q{data.quarter}</span>
                activeQuarter = '';
            }

            if (data.quarter == 1) {
                yearSpan = <span className="yearPeriod">{data.year}</span>
            }

            let typeRel;
            let arrowClass;
            if (data.name) {
                if (data.name.toString().includes("Cloud")) {
                    typeRel = "classEven"
                    arrowClass = classNames({
                        'arrowHead': true,
                        'arrowEven': true
                    });
                } else {
                    typeRel = "classOdd";
                    arrowClass = classNames({
                        'arrowHead': true,
                        'arrowOdd': true
                    });
                }
            }

            return data.feature !== null ? <li key={index} className={activeQuarter}>
                {quarterSpan}
                {yearSpan}
                <span className={arrowClass}></span>
                <div className={typeRel}>
                    <time>{data.name}</time>
                    <article>
                        {feature}
                    </article>
                </div>
            </li> : <li key={index}>
                {quarterSpan}
                {yearSpan}
                <span></span>
            </li>

        });

        let roadMapXScrollNumber = this.state.roadMapXScrollNumber;
        let totalYearCount = this.getTotalYearCount(this.state.sprintPlanArray);

        return (
            <div>
                {this.sprintPlanData.length > 0 ?
                <div className="roadmap-View" style={{marginLeft:'100px',position:'relative'}}>
                    <section className="timeline">
                        <ol style={{transform: 'translateX('+-this.state.roadMapXScrollNumber+'px)'}}>
                            {this.sprintPlanData.length == 0 ? null : timeList}
                        </ol>
                    </section>
                    <div className="arrows">
                        <div id="leftArrow" className={roadMapXScrollNumber<=(roadMapYearIncrement)?"prevLeft disabled":"prevLeft"}>
                            <button className="arrow arrow__prev" onClick={()=>this.prevClick()} >
                                <span className="glyphicon glyphicon-chevron-left fa-3x"></span>
                            </button>
                        </div>
                        <div id="rightArrow" className="nextRight">
                            <button className= {roadMapXScrollNumber>=((roadMapYearIncrement)*(totalYearCount-1))?"arrow arrow__next disabled":"arrow arrow__next"} onClick={()=>this.nextClick()}>
                                <span className="glyphicon glyphicon-chevron-right fa-3x"></span>
                            </button>
                        </div>
                    </div>
                    {localStorage.userPermissions == userPermissions?
                        <div className="pull-right editRoadMapItems" onClick={this.openModal}>
                            <a className="editRoadMap badge">
                                <h6 className="glyphicon glyphicon-pencil fa-lg"></h6>
                            </a>
                        </div> : ""}
                </div> : null}

                <Modal isOpen={this.state.modalViewOpen} className="container-fluid inRoadmapModal" bgColor={'white'} onClose={() => this.closeModal()}>
                    <div className="cancelPlatformModal" onClick={() => this.closeModal()}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </div>
                    {this.state.roadmapArray?<RoadmapEdit roadmapArray={this.state.roadmapArray} saveEditClickCallback={this.saveEditClickCallback} />:null}
                </Modal>
            </div>
        )


    }

}

class RoadmapEdit extends Component {

    constructor(props, context) {
        super(props, context);
        this.addMore_Click = this.addMore_Click.bind(this);
        this.saveEdit_Click = this.saveEdit_Click.bind(this);
        this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
        this.onChangeRoadmapTypeDropdownlist = this.onChangeRoadmapTypeDropdownlist.bind(this);
        this.handlChangeDate = this.handlChangeDate.bind(this);
        this.delete_Click = this.delete_Click.bind(this);

        let roadmapFeature = this.props.roadmapArray;
        let roadmapNameWithIdDropDownList = roadmapFeature.map(function(a){
            return {id:a.roadmap_name_id,name:a.name}
        })

        let roadmapTypeWithIdDropDownList = roadmapFeature.map(function(a){
            return {id:a.roadmap_type_id,name:a.type}
        })

        roadmapTypeWithIdDropDownList = roadmapTypeWithIdDropDownList.filter((element, index, self) =>
            index === self.findIndex((t) => (
                t.name === element.name && t.id === element.id
            ))
        );

        this.state={roadmapFeature:roadmapFeature,
            roadmapNameWithIdDropDownList:roadmapNameWithIdDropDownList,
            roadmapTypeWithIdDropDownList:roadmapTypeWithIdDropDownList,
            nameSelectedId:1,
            typeSelectedId:1,
            onChangeFlag:false
        };


    }

    addMore_Click(roadmap_name_id){
        let roadmapFeature = this.state.roadmapFeature;
        let roadmaFeatureNameId= roadmapFeature.find((item)=>item.roadmap_name_id==roadmap_name_id);
        let featureWithId = roadmaFeatureNameId.featureWithId;
        let lastFeatureWithId = roadmapFeature[roadmapFeature.length-1].featureWithId;
        let maxFeaturedId = Math.max.apply(Math,lastFeatureWithId.map(function(o){return o.id;}));
        if(maxFeaturedId<0){
            maxFeaturedId = Math.min.apply(Math,lastFeatureWithId.map(function(o){return o.id;}));
        }
        maxFeaturedId =Math.abs(maxFeaturedId);
        featureWithId.push({id:-(maxFeaturedId+1),feature:""});
        this.setState({roadmapFeature:roadmapFeature,
            onChangeFlag:false,

        });
    }

    onChangeRoadmapTypeDropdownlist(typeSelectedId){
        let roadmaFeatureSelectedType= this.state.roadmapFeature.filter((item)=>item.roadmap_type_id==typeSelectedId);

        let nameSelectedId = roadmaFeatureSelectedType[0].roadmap_name_id;
        this.setState({
            typeSelectedId:typeSelectedId,
            nameSelectedId:nameSelectedId,
            onChangeFlag:false,
        })
    }

    addName_Click(typeSelectedId){
        let roadmapFeature = this.state.roadmapFeature;
        let maxId = Math.max.apply(Math,roadmapFeature.map(function(o){return o.id;}));
        let maxNameId = Math.max.apply(Math,roadmapFeature.map(function(o){return o.id;}));
        let roadmapTypeObject = this.state.roadmapTypeWithIdDropDownList.find((item)=>item.id==typeSelectedId);
        let lastFeatureWithId = roadmapFeature[roadmapFeature.length-1].featureWithId;
        let maxFeaturedId = Math.max.apply(Math,lastFeatureWithId.map(function(o){return o.id;}));
        if(maxFeaturedId<0){
            maxFeaturedId = Math.min.apply(Math,lastFeatureWithId.map(function(o){return o.id;}));
        }
        maxFeaturedId =Math.abs(maxFeaturedId);

        let dict ={
            id:maxId+1,
            type:roadmapTypeObject.name,
            roadmap_type_id:typeSelectedId,
            name:$("#inputName").val(),
            roadmap_name_id:maxNameId+1,
            end_date:new Date().toISOString(),
            featureWithId:[{id:-(maxFeaturedId+1),feature:""}],
        }
        roadmapFeature.push(dict);

        this.setState({roadmapFeature:roadmapFeature,onChangeFlag:false});
    }

    saveEdit_Click(){
        let roadmapFeature = this.state.roadmapFeature;

        //console.log(roadmapFeature);
        postHttpRequest("/roadmap",roadmapFeature,(data,statusCode)=>{
            if(statusCode==201){
                this.props.saveEditClickCallback();
            }
        })
    }

    onChangeTextCallback(id,value) {
        let roadmapFeature = this.state.roadmapFeature;
        let roadmapFeatureSelectedName = roadmapFeature.find((item) => item.roadmap_name_id == this.state.nameSelectedId);
        roadmapFeatureSelectedName.featureWithId.map((element, index) => {
            if (element.id == id) {
                element.feature = value;
            }
        })

        this.setState({roadmapFeature: roadmapFeature,onChangeFlag:true});
    }

    handlChangeDate(date,id){
        let roadmapFeature = this.state.roadmapFeature;
        let roadmaFeatureNameId= roadmapFeature.find((item)=>item.roadmap_name_id==this.state.nameSelectedId && item.roadmap_type_id==this.state.typeSelectedId);
        roadmaFeatureNameId.end_date = date;
        this.setState({roadmapFeature: roadmapFeature,onChangeFlag:false});
    }

    delete_Click(feautreId){

        var r = confirm("Are sure you want to delete?");
        if (r == true) {
            deleteHttpRequest("/roadmapFeature?featureId="+feautreId,(data,statusCode)=>{

                if(statusCode==200){
                    let roadmapFeature = this.state.roadmapFeature;
                    let roadmapFeatureSelectedName = roadmapFeature.find((item) => item.roadmap_name_id == this.state.nameSelectedId);

                    roadmapFeatureSelectedName.featureWithId.map((element, index,array) => {
                        if (element.id == feautreId) {
                            array.splice(index,1);
                        }
                    })

                    this.setState({roadmapFeature:roadmapFeature});
                }
            })
        } else {

        }


    }

    render(){

        let roadmapFeature = this.state.roadmapFeature;

        let roadmaFeatureNameId= roadmapFeature.find((item)=>item.roadmap_name_id==this.state.nameSelectedId && item.roadmap_type_id==this.state.typeSelectedId);

        let featureWithId = roadmaFeatureNameId.featureWithId;

        let roadmaFeatureNameIdDropDownList= this.state.roadmapFeature.filter((item)=>item.roadmap_type_id==this.state.typeSelectedId);


        let roadmapNameIdDropdownlist = roadmaFeatureNameIdDropDownList.map(function(a){
            return {id:a.roadmap_name_id,name:a.name}
        });

        return <div className="roadmap-modal-content">
                    <ul>
                        <li className="roadmap-modal-dropdown">
                            <DropdownList
                                className="drop-down-all"
                                data={this.state.roadmapTypeWithIdDropDownList}
                                valueField='id'
                                textField='name'
                                onChange={dict => this.onChangeRoadmapTypeDropdownlist(dict.id )}
                                defaultValue={1}
                            />
                        </li>
                        <li className="flex-layout">
                            <input id="inputName" className="projectTitleInput" type="text" placeholder="Enter a name" />
                            <button className="btn btn-default btn-udn-green" onClick={()=>this.addName_Click(this.state.typeSelectedId)}>Add name</button>
                        </li>
                        <li>
                            <DropdownList
                                className="drop-down-all"
                                data={roadmapNameIdDropdownlist}
                                valueField='id'
                                textField='name'
                                onChange={dict => this.setState({ nameSelectedId:dict.id,onChangeFlag:false })}
                                defaultValue={this.state.nameSelectedId}
                                value={this.state.nameSelectedId}
                            />
                        </li>
                        <li>
                            <DatePicker
                                id="datepicker"
                                value={roadmaFeatureNameId.end_date}
                                onChange={(e) => {this.handlChangeDate(e,roadmaFeatureNameId.id)}}
                            />
                        </li>
                        <li>
                            <ul className="roadmap-modal-features">
                                {featureWithId.map((featureElement,index)=>{
                                    return <li><FeatureInput  key={"featureInput"+index}
                                                          featureElement={featureElement}
                                                          index={index}
                                                          onChangeFlag={this.state.onChangeFlag}
                                                          onChangeTextCallback={this.onChangeTextCallback}
                                    /><span className="glyphicon glyphicon-remove text-danger" onClick={()=>this.delete_Click(featureElement.id)}></span></li>
                                })}
                                <li>
                                    <button className="btn btn-default btn-udn-green" onClick={()=>this.addMore_Click(this.state.nameSelectedId)}>Add More</button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <button className="btn btn-default btn-udn-green" onClick={()=>this.saveEdit_Click()}>Save</button>
            </div>
    }
}

class FeatureInput extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={value:this.props.featureElement.feature,id:this.props.featureElement.id}
    }
    componentWillReceiveProps(nextProps){
        if(!nextProps.onChangeFlag) {

            let id = this.state.id;
            let value = this.state.value;
            this.setState({
                value: id == nextProps.featureElement.id ? value : nextProps.featureElement.feature,
                id: nextProps.featureElement.id
            });
        }
    }

    onChangeText(e){
        this.setState({value:e.target.value})
        this.props.onChangeTextCallback(this.state.id,e.target.value);
    }

    render(){

        return <div>
                <input id={"inputFeature_"+this.props.index}  className="projectTitleInput"  value={this.state.value} onChange={(e)=>{this.onChangeText(e)}} type="text" placeholder="Feature" />
            </div>
    }
}


export default Roadmap
