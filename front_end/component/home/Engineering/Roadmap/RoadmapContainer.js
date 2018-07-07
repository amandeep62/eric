import { Component } from 'react'
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle'
import {EngineeringTabEnum,RoadmapVersionEnum} from "../../../../constants/constants"
import Roadmap from "./Roadmap.js"
import RoadmapSprintPlan from "./RoadmapSprintPlan"
import RoadmapUDNVersion from "./RoadmapUDNVersion"


var roadmapUDNVersionRef=null;
class RoadmapContainer extends Component {

    constructor(props, context) {
        super(props, context);

        this.onVersionSelect = this.onVersionSelect.bind(this);
        let year = new Date().getFullYear();
        this.state = ({version:RoadmapVersionEnum.ROADMAPVERSION.value, year: year})

    }



    onVersionSelect(version, versioName, year){
        this.setState({
            version:parseInt(version),
            versionName:versioName,
            year : year
        });

    }

    filterByModule(event) {

        roadmapUDNVersionRef.filterByModule(event);
    }

    callBackToGetRefOfRoadmapUDNVersion(ref){
         roadmapUDNVersionRef=null;
         roadmapUDNVersionRef = ref
    }

    componentDidMount(){
        document.title = "Roadmap";
    }

    render(){
        let container=null;
        let title = "ROADMAP";
        let engineeringTabId = EngineeringTabEnum.ROADMAP.value;
        switch (this.state.version){
            case RoadmapVersionEnum.ROADMAPVERSION.value:
                container = <Roadmap />
                break;
            case RoadmapVersionEnum.ROADMAPSPRINTPLANVERSION.value:
                container = <RoadmapSprintPlan year = { this.state.year }/>
                break;
             default:
                 container = <RoadmapUDNVersion version_id={this.state.version.toString()} releaseDashboardScope={false}
                                                callBackToGetRefOfRoadmapUDNVersion = {this.callBackToGetRefOfRoadmapUDNVersion}
                             />
                 title = this.state.versionName;
                break;
        }

        return <div className="row">
            <EngineeringTitle title={title}
                              engineeringTabId={engineeringTabId}
                              onVersionSelect={this.onVersionSelect}
                              filterByModule={this.filterByModule} />
            {container}
        </div>
    }
}

export default RoadmapContainer
