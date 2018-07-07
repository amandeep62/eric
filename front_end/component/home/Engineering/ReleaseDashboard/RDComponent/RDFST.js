import  {Component} from 'react';
import FST from "../../FST/FST"

class RDFST extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {

        return <div className="col-md-4">
            <div className="blueLine">
                <span>FST</span>
                <h1></h1>
            </div>
            <div className="rd-donut-item">
                <FST
                    isStatic={true}
                    centerFontSize = { 12 }
                    canvasSize={ {width:200, height:180} }
                    arcRadius={ 30 }
                    disableEngineeringTitle = { true }
                    rdVersionSelected = {this.props.currentSelectedVersion}
                />
            </div>
        </div>
    }
}

export default RDFST