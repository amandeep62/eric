import  {Component} from 'react';
import Status from '../../Status/Status'

class RDStatus extends Component {

    constructor(props, context) {
        super(props, context);
        }

    render() {
        return <div className="col-md-4">
            <div className="blueLine">
                <span>Status</span>
                <h1></h1>
            </div>
            <div className="rd-donut-item">
                <Status
                    isStatic={ true }
                    centerFontSize = { 12 }
                    canvasSize={ {width:200, height:180} }
                    arcRadius={ 30 }
                    disableEngineeringTitle = { true }
                    forceBugView = {true }
                    rdVersionSelected = {this.props.currentSelectedVersion}
                />
            </div>
        </div>
    }
}

export default RDStatus