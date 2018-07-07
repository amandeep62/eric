import React, { Component } from 'react'
import SelectionField from './SelectionField'
import './PlatformBoard.less'
import Modal from '../../globals/ModalPopup/modal'
import Tooltip from '../../Tools/ToolTipCustomComponent';
import {putHttpRequest,deleteHttpRequest,getHttpRequest,postHttpRequest} from "../../../../httprequest/http_connection";
import {userPermissions,EngineeringTabEnum,qualityStatus,QualityStatusEnum} from "../../../../constants/constants";
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle'

class PlatformBoard extends Component {
    constructor(props, context) {
        super(props, context);
        this.saveButtonClick = this.saveButtonClick.bind(this);
        this.deleteButtonClick = this.deleteButtonClick.bind(this);
        this.editParentCallBack = this.editParentCallBack.bind(this);
        this.insertPlatformBoard = this.insertPlatformBoard.bind(this);

        this.state={qualityStatus:qualityStatus,
            platformBoardList:[],editMode:false, insertPlatformBoard:false
        };
        let that = this;
        getHttpRequest("/platformBoard",function (data) {
            var platformBoardList = JSON.parse(data);
            platformBoardList.sort(function(a, b) {
                return (b.id-a.id);
            });

            that.setState({platformBoardList:platformBoardList});
        });
    }

    initializeTheGetAllModules() {

    }


    saveButtonClick(){
        var platformBoardList = this.state.platformBoardList;
        var maxId=1;
        if(platformBoardList.length>0){
            maxId= Math.max.apply(Math,platformBoardList.map(function(o){return o.id;}))+1
        }

        var date_stamp=new Date()
        var dict = {
            id:maxId,
            date_stamp:(date_stamp.getMonth()+1)+"/"+date_stamp.getDate()+"/"+date_stamp.getFullYear() ,
            projectTitle1:this.refs.txtProject1.value.trim(),
            projectTitle2:this.refs.txtProject2.value.trim(),
            projectTitle3:this.refs.txtProject3.value.trim(),
            projectTitle4:this.refs.txtProject4.value.trim(),
            projectTitle5:this.refs.txtProject5.value.trim(),
            indicator1:this.refs.indicator1.state.value,
            indicator2:this.refs.indicator2.state.value,
            indicator3:this.refs.indicator3.state.value,
            indicator4:this.refs.indicator4.state.value,
            indicator5:this.refs.indicator5.state.value,
            projectSummary:this.refs.textAreaSummary.value.trim(),
            edit:false,
            insertPlatformBoard:false
        }
        platformBoardList.push(dict);

        platformBoardList.sort(function(a, b) {
            return (b.id-a.id);
        });

        this.setState({platformBoardList:platformBoardList,insertPlatformBoard:false});

        postHttpRequest("/platformBoard",dict,function (data) {

        })

    }

    handleChangeModule(value,inputId){

    }



    deleteButtonClick(id){

        if (confirm('Are you sure you want to delete?')) {
            var platformBoardList = this.state.platformBoardList;
            platformBoardList.filter(function (element, index, array) {
                if (element.id == id) {
                    array.splice(index, 1);
                    return;
                }

            })

            this.setState(
                {platformBoardList: platformBoardList}
            );


            deleteHttpRequest("/platformBoard?id=" + id, function (data) {

            })
        }
    }

    editParentCallBack(edit){
        this.setState({editMode:edit})
    }

    closeModal(){

        this.setState(
            {insertPlatformBoard:false}
        );
    }

    insertPlatformBoard(){

        this.setState(
            {insertPlatformBoard:true}
        );
    }


    componentDidMount(){
        document.title = "Platform Board";
        $('.view-section').attr('style','overflow: auto');
    }

    render(){

        var that = this;
        return <div id="platformBoard" className="row">
            <EngineeringTitle title={"Platform Board"} engineeringTabId={EngineeringTabEnum.PLATFORMBOARD.value}  />

            {localStorage.userPermissions == userPermissions ? <a className="editRoadMap badge" onClick={()=>this.insertPlatformBoard()}><h6 className="glyphicon glyphicon-pencil fa-lg"></h6></a> : ""}
            <div id="platformBoardDashboard" className="col-md-12">
                <Modal isOpen={this.state.insertPlatformBoard} className="container-fluid col-xs-11 inPlatformModal" bgColor={'white'} onClose={() => this.closeModal()}>
                    <div className="cancelPlatformModal">
                        <div onClick={() => this.closeModal()}>
                            <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-2">
                            <input className="projectTitleInput" ref="txtProject1" type="text" placeholder="Project 1" />
                           <SelectionField ref="indicator1" moduleList={this.state.qualityStatus}  handleChangeModule={this.handleChangeModule} value={this.state.qualityStatus[0]} />
                        </div>
                        <div className="col-md-2">
                            <input className="projectTitleInput" ref="txtProject2" type="text" placeholder="Project 2" />
                            <SelectionField ref="indicator2" moduleList={this.state.qualityStatus}  handleChangeModule={this.handleChangeModule} value={this.state.qualityStatus[0]} />
                        </div>
                        <div className="col-md-2">
                            <input className="projectTitleInput" ref="txtProject3" type="text" placeholder="Project 3" />
                            <SelectionField ref="indicator3" moduleList={this.state.qualityStatus} handleChangeModule={this.handleChangeModule} value={this.state.qualityStatus[0]} />
                        </div>
                        <div className="col-md-2">
                            <input className="projectTitleInput" ref="txtProject4" type="text" placeholder="Project 4" />
                            <SelectionField ref="indicator4" moduleList={this.state.qualityStatus} handleChangeModule={this.handleChangeModule} value={this.state.qualityStatus[0]} />
                        </div>

                        <div className="col-md-2 ">
                            <input className="projectTitleInput" ref="txtProject5" type="text" placeholder="Project 5" />
                            <SelectionField ref="indicator5" moduleList={this.state.qualityStatus} handleChangeModule={this.handleChangeModule} value={this.state.qualityStatus[0]} />
                        </div>
                    </div>
                    <div className="row platformBoardTextArea">
                        <div className="platform-summary-title">Summary</div>
                        <textarea ref="textAreaSummary" cols="80" style={{height:"150px"}}></textarea>
                        <button value="addTheme" className="addThemeGreen pull-right btn-udn-green" id="addTheme" onClick={this.saveButtonClick}>Save</button>
                    </div>
                </Modal>
                {this.state.platformBoardList.map(function(element,index){

                    return <PlatformBoardResult key={"PlatformBoardResult_"+index} platformBoard={element} qualityStatus={that.state.qualityStatus} deleteButtonClick={that.deleteButtonClick} editParentCallBack={that.editParentCallBack} />
                })}
        </div>
        </div>
    }
}


class PlatformBoardResult extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = { edit:false,platformBoard:this.props.platformBoard};

        this.editButtonClick=this.editButtonClick.bind(this);
        this.closeModal= this.closeModal.bind(this);
    }

    handleChangeModule(value,inputId){

    }

    editButtonClick(id){

        var platformBoard = this.state.platformBoard;
        var edit = this.state.edit;

        if(edit==true){
            platformBoard.projectTitle1=this.refs.txtEditProject1.value.trim();
            platformBoard.projectTitle2=this.refs.txtEditProject2.value.trim();
            platformBoard.projectTitle3=this.refs.txtEditProject3.value.trim();
            platformBoard.projectTitle4=this.refs.txtEditProject4.value.trim();
            platformBoard.indicator1=this.refs.editIndicator1.state.value;
            platformBoard.indicator2=this.refs.editIndicator2.state.value;
            platformBoard.indicator3=this.refs.editIndicator3.state.value;
            platformBoard.indicator4=this.refs.editIndicator4.state.value;
            platformBoard.indicator5=this.refs.editIndicator5.state.value;
            platformBoard.projectSummary=this.refs.textEditAreaSummary.value.trim();
            //Jeet needs to work here
            putHttpRequest("/platformBoard?id="+id,platformBoard,function (data) {

            })
        }
        edit = !edit ;
        this.props.editParentCallBack(edit);

        this.setState(
            {platformBoard:platformBoard,edit:edit}
        );


    }

    componentWillReceiveProps(nextProps) {
        this.setState({platformBoard:nextProps.platformBoard});
    }

    closeModal(){
        this.props.editParentCallBack(false);
        this.setState(
            {edit:false}
        );
    }


    render(){



        var platformBoard = this.state.platformBoard;

        var date_stamp = new Date(platformBoard.date_stamp);
        var date_stampStr=(date_stamp.getMonth()+1)+"/"+date_stamp.getDate()+"/"+date_stamp.getFullYear()
        return <div  className="platform-summary">

            <div className="row">
                <span>{date_stampStr}</span>
                <div style={{marginBottom:'10px'}}></div>
                {!this.state.edit?
                    <div className="row">
                        <div className="col-md-2 text-center">
                            <div className="projectTitle">{platformBoard.projectTitle1}</div>
                            <span><IndicatorImage indicator={platformBoard.indicator1} /></span>
                        </div>
                        <div className="col-md-2 text-center">
                            <div className="projectTitle">{platformBoard.projectTitle2}</div>
                            <span><IndicatorImage indicator={platformBoard.indicator2} /></span>
                        </div>
                        <div className="col-md-2 text-center">
                            <div className="projectTitle">{platformBoard.projectTitle3}</div>
                            <span><IndicatorImage indicator={platformBoard.indicator3} /></span>
                        </div>
                        <div className="col-md-2 text-center">
                            <div className="projectTitle">{platformBoard.projectTitle4}</div>
                            <span><IndicatorImage indicator={platformBoard.indicator4} /></span>
                        </div>
                        <div className="col-md-2 text-center">
                            <div className="projectTitle">{platformBoard.projectTitle5}</div>
                            <span><IndicatorImage indicator={platformBoard.indicator5} /></span>
                        </div>
                    </div>
                    : <Modal isOpen={this.state.edit} className="container-fluid col-xs-11 inPlatformModal" bgColor={'white'} onClose={() => this.closeModal()}>
                        <div className="cancelPlatformModal">
                            <div onClick={() => this.closeModal()}>
                                <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            </div>
                        </div>
                        <div className="platformProjects">
                            <div className="col-md-2">
                                <input className="projectTitleInput" ref="txtEditProject1" type="text" defaultValue={platformBoard.projectTitle1} placeholder="Project 1" />
                                <SelectionField ref="editIndicator1" moduleList={this.props.qualityStatus} defaultValue={platformBoard.indicator1} value={platformBoard.indicator1} handleChangeModule={this.handleChangeModule} />
                            </div>
                            <div className="col-md-2">
                                <input className="projectTitleInput" ref="txtEditProject2" type="text" defaultValue={platformBoard.projectTitle2}  placeholder="Project 2" />
                                <SelectionField ref="editIndicator2" moduleList={this.props.qualityStatus} defaultValue={platformBoard.indicator2} value={platformBoard.indicator2} handleChangeModule={this.handleChangeModule} />
                            </div>
                            <div className="col-md-2">
                                <input className="projectTitleInput" ref="txtEditProject3" type="text" defaultValue={platformBoard.projectTitle3} placeholder="Project 3" />
                                <SelectionField ref="editIndicator3" moduleList={this.props.qualityStatus} defaultValue={platformBoard.indicator3} value={platformBoard.indicator3} handleChangeModule={this.handleChangeModule} />
                            </div>
                            <div className="col-md-2">
                                <input className="projectTitleInput" ref="txtEditProject4" type="text" defaultValue={platformBoard.projectTitle4} placeholder="Project 4"  />
                                <SelectionField ref="editIndicator4" moduleList={this.props.qualityStatus}  defaultValue={platformBoard.indicator4} value={platformBoard.indicator4} handleChangeModule={this.handleChangeModule} />
                            </div>
                            <div className="col-md-2">
                                <input className="projectTitleInput" ref="txtEditProject5" type="text" defaultValue={platformBoard.projectTitle5} placeholder="Project 5"  />
                                <SelectionField ref="editIndicator5" moduleList={this.props.qualityStatus}  defaultValue={platformBoard.indicator5} value={platformBoard.indicator5} handleChangeModule={this.handleChangeModule} />
                            </div>
                        </div>
                            <div>
                                {this.state.edit?
                                    <textarea ref="textEditAreaSummary" cols="50" style={{height:"150"}} defaultValue={platformBoard.projectSummary}></textarea>:
                                    <div style={{whiteSpace: 'pre'}} >{platformBoard.projectSummary}</div>
                                }
                                <div className="footerPlatformModal">
                                    {!this.state.edit?
                                        <button value="Edit" className="addThemeGreen pull-right btn-udn-green" id="editPlatformBoard" onClick={()=>this.editButtonClick(platformBoard.id)}>Edit</button>:
                                        <button value="Save" className="addThemeGreen pull-right btn-udn-green" id="savePlatformBoard" onClick={()=>this.editButtonClick(platformBoard.id)}>Save</button>
                                    }
                                </div>
                                {!this.state.edit?
                                    <span>
                                        <button value="addTheme" className="pull-right delete-board alert-danger" id="deletePlatformBoard" onClick={()=>this.props.deleteButtonClick(platformBoard.id)}>
                                            <span className="glyphicon glyphicon-remove"></span>
                                        </button>
                                    </span>:null}
                            </div>
                        </Modal>}
            </div>
            <div className="row" style={{marginTop:'10px',marginBottom:'20px', paddingBottom:'5px', borderBottom: 'solid 1px grey'}}>
                {this.state.edit?
                    <span><textarea ref="textEditAreaSummary1" cols="50" style={{height:"150"}}>{platformBoard.projectSummary}</textarea></span>:<div><div className="platform-summary-title">Summary</div><span style={{whiteSpace: 'pre'}} >{platformBoard.projectSummary}</span></div>}
                {localStorage.userPermissions == userPermissions ?
                    <span> {!this.state.edit ?
                        <button value="Edit" className="addThemeGreen pull-right btn-udn-green" id="editPlatformBoard" onClick={()=>this.editButtonClick(platformBoard.id)}>Edit</button>:
                    null}</span>:""}
                {!this.state.edit && localStorage.userPermissions == userPermissions ?
                    <span><button value="addTheme" className="pull-right delete-board alert-danger" id="deletePlatformBoard" onClick={()=>this.props.deleteButtonClick(platformBoard.id)}><i className="glyphicon glyphicon-remove"></i></button></span>:null}

            </div>
        </div>
    }

}

class IndicatorImage extends Component {
    constructor(props, context) {
        super(props, context);

    }

    render(){
        var indicator = this.props.indicator;
        var imagePath='';
        if (indicator == QualityStatusEnum.COMMITMENT.value) {
            imagePath = '/../icons/green.svg';
        } else if (indicator ==QualityStatusEnum.ROBUST.value) {
            imagePath = '/../icons/yellow.svg';
        } else if (indicator == QualityStatusEnum.WARNING.value) {
            imagePath = '/../icons/orange.svg';
        } else if (indicator ==  QualityStatusEnum.OFFTRACK) {
            imagePath = '/../icons/red.svg';
        } else {
            imagePath = '';
        }

        return  imagePath!=''?

            <Tooltip label={indicator}>
                <a href="javascript:void(0)" data-toggle="tooltip">
                    <img src={imagePath} style={{width:'78px'}} />
                </a>
            </Tooltip>

                :null;
    }

}

export default PlatformBoard