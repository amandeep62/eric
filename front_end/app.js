import React, {Component} from 'react'
import { browserHistory } from 'react-router'
import Settings from './component/home/Settings/Settings'
import TopNavigation from './component/home/TopComponents/TopNavigation'
import {ModalNewVersion} from './component/home/Settings/ActionsModal'
import {UDNTabs, engineeringTabs,EngineeringTabEnum} from "./constants/constants";
import EngineeringNavigation from "./component/home/Engineering/EngineeringHeader/EngineeringNavigation"
import {store,storeModule} from "./component/home/Engineering/Store/Store"
import {getAllModules,getCurrentVersionForProduction,getCurrentVersion} from "./component/home/Engineering/CommonFunction"
import "./component/home/TopComponents/navbar.less";
import "./style.less";

class App extends Component {

    /**
     * Initialize the application: setup the versions, modules , etc for every page
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.state = ({
            searchResults : {},
            displayContainer:false,
        });

        let  engineeringTabsVersion = [];
        engineeringTabs.map(function (tabName) {
            engineeringTabsVersion.push({name:tabName, versionId:0})
        });

        //Initialize the current version for produtionfor specific tabs and store them
        getCurrentVersionForProduction((currentVersionProductionObject)=>{

            store.dispatch({
                type: 'VERSION_UPDATE',
                version: parseInt(currentVersionProductionObject.version_id),
                versionNumber:currentVersionProductionObject.number,
                tabId: EngineeringTabEnum.STATUS.value
            });

            store.dispatch({
                type: 'VERSION_UPDATE',
                version: parseInt(currentVersionProductionObject.version_id),
                versionNumber:currentVersionProductionObject.number,
                tabId: EngineeringTabEnum.CAPACITY.value
            });



            //Otherwise ,take the current version as of today
            getCurrentVersion((currentVersionObject)=>{
                store.dispatch({
                    type: 'VERSION_UPDATE',
                    version: parseInt(currentVersionObject.version_id),
                    versionNumber:currentVersionObject.number,
                    tabId: EngineeringTabEnum.FST.value
                });
                getAllModules((moduleArray)=>{

                    storeModule.dispatch({
                        type: 'MODULE_UPDATE',
                        moduleArray: moduleArray,
                    });
                    this.setState({displayContainer:true})

                })
            })
        })
    }

    render() {
        var pathname = browserHistory.getCurrentLocation().pathname;
        var pathnameArray = pathname.split("/");
        var mainPath = pathnameArray.length>0? pathnameArray[1]:'';
        var subPath = pathnameArray.length>1? pathnameArray[2]:'';
        var findMainPath = UDNTabs.find(tabName=>tabName.toLowerCase()==mainPath);
        var findSubPath = engineeringTabs.find(tabName=>tabName.toLowerCase().replace(' ','')==subPath);
        var finSubPathStr=''
        var engineeringRoutingPath;
        var routingPath;
        if(findMainPath) {
            if (findSubPath) {
                finSubPathStr = '/' + findSubPath.toLowerCase().replace(' ', '');
            }
            routingPath = '/' + findMainPath.toLowerCase() + finSubPathStr;
             engineeringRoutingPath = '/engineering' + finSubPathStr;
        }

        return <div id="mainPage" className="container-fluid">
            {pathname==routingPath?<TopHeader mainPath={mainPath} />:null}
            {pathname==engineeringRoutingPath?<EngineeringNavigation mainPath={mainPath} />:null}
            { this.state.displayContainer? this.props.children:null}
        </div>
    }
}


class TopHeader extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = ({searchResults: {}})
    }

    render(){
        return <div className="row">
            <div className="nav-top navbar-inverse navbar-static-top" role="navigation">
                <div className="container-fluid">

                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#udn-navbar-collapse">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand">
                            <img src="images/ericsson-udn-logo.png" alt=""/>
                        </a>
                    </div>

                    <div className="collapse navbar-collapse" id="udn-navbar-collapse">
                        <div className="lower-nav">
                            <Settings />
                            <TopNavigation mainPath={this.props.mainPath}/>
                        </div>
                    </div>
                </div>

            </div>
            

        </div>
    }


}




export default App;