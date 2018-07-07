import React, {Component} from 'react';
import {engineeringTabs,userPermissions} from "../../../../constants/constants"
import { browserHistory } from 'react-router'
import Modal from '../../globals/ModalPopup/modal'
import UDNScopeSummary from "./UDNSummary/UDNScopeSummary"

class EngineeringNavigation extends Component {

    constructor(props, context) {
        super(props, context);
        this.closeModal = this.closeModal.bind(this);
        this.state={isModalOpen:false};
    }

    changeTab(tabName){
        let base = "/";
        let path =base+this.props.mainPath.toLowerCase()+'/'+tabName.toLowerCase().replace(' ','')
        browserHistory.push(path);
    }

    closeModal(){
        this.setState({isModalOpen:false});
    }
    render(){

        let pathname = browserHistory.getCurrentLocation().pathname;
        let pathnameArray = pathname.split("/");
        let mainPath = pathnameArray.length>0? pathnameArray[1]:'';
        let subPath = pathnameArray.length>1? pathnameArray[2]:'';
        subPath = subPath.toLowerCase();
        return <div className="row">
            <div className="col-md-12">
                {
                    engineeringTabs.map((tabName, index) => {
                        return (
                            <button key={"button_1" + index} className={subPath==tabName.replace(' ','').toLowerCase()?"btn btn-default btn-udn activeTab":"btn btn-default btn-udn"}
                                    aria-label="Left Align"
                                    onClick={()=>this.changeTab(tabName)} id={tabName.replace(" ","")}
                                    title={tabName}>{tabName}</button>
                        );
                    })
                }
                {subPath === "roadmap"?
                    <div className="pull-right adding-new-release" title="Add Release" onClick={()=>this.setState({isModalOpen:true})}>
                        <a className="editRoadMap badge version" id="badgeSummary">
                            <h6 className="glyphicon glyphicon-plus fa-lg">
                            </h6>
                        </a>
                    </div>:null}

                    {this.state.isModalOpen?<UDNScopeSummary closeModal={this.closeModal} />:null}
            </div>

        </div>
    }

}


export default EngineeringNavigation;