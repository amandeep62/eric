import  {Component} from 'react';
import Quality from '../../Quality/Quality';

class RDQuality extends Component {

    constructor(props, context) {
        super(props, context);
    }
    render() {
        return <div className="col-md-4">
            <div className="blueLine">
                <span>Quality</span>
                <h1></h1>
            </div>
            <div className="rd-donut-item">
                <Quality
                    isStatic={true}
                    centerFontSize = { 12 }
                    canvasSize={ {width:200, height:180} }
                    arcRadius={ 30 }
                    disableEngineeringTitle = { true }
                />
            </div>
        </div>
    }
}

export default RDQuality