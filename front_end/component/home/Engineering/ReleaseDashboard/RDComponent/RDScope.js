import  {Component} from 'react';
import {getHttpRequest} from "../../../../../httprequest/http_connection";

class RDSCOPE extends Component {

    constructor(props, context) {
        super(props, context);

        this.getRoadMapVersion = this.getRoadMapVersion.bind(this);

        this.state = {roadMapList:[]};

        this.getRoadMapVersion(this.props.versionId);
    }

    componentWillReceiveProps(nextProps){
        this.getRoadMapVersion(nextProps.versionId);
    }

    getRoadMapVersion(versionId){
        getHttpRequest("/getReleaseDashboardVersion?version_id=" + versionId , (data)=>{
            let result = JSON.parse(data);
            this.setState({
                roadMapList:result.rows
            });
        })
    }
    render() {

        return <div className="col-md-4">
                    <div className="blueLine">
                        <span>SCOPE</span>
                        <h1></h1>
                    </div>
                    <ul id="content-list">
                        {
                            this.state.roadMapList.map((element, index)=>{
                                return(<li style={{"color": "rgb(159, 159, 159)"}}
                                           key={"roadMap" + index}>
                                    <span style={{"color": "white"}}
                                          className='text-center'>{element.release_features}
                                          </span></li>)
                            })
                        }
                    </ul>
                </div>
    }
}

export default RDSCOPE