/**
 * @description      : Component to to create custom Tooltip
 * @prop {Boolean}   : inverted, optional
 * @prop {String}    : label, required
 * @prop {String}    : color, optional
 * @prop {Boolean}   : visible, required
 * @prop {Object}    : position, required
 */
import { Component, PropTypes } from "react";
import "./Tooltip.less";

class Tooltip extends Component {
    constructor(props, context){
        super(props, context)
        this.inverted = this.props.inverted ? this.props.inverted : false; // optional
        this.label = this.props.label;// required
        this.color = this.props.color ? this.props.color : null; // optional
        this.visible = this.props.visible ? this.props.visible : false;// optional
        this.position = this.props.position;
    }

    componentWillReceiveProps(nextProps){
        this.label = nextProps.label;
        this.color = nextProps.color ? nextProps.color : '';
        this.visible = nextProps.visible ? nextProps.visible : '';
        this.position = nextProps.position;
    }

    render(){
        let tooltipHTML = this.visible ? <div className={ this.inverted ? "chartTooltip inverted" : "chartTooltip"} style={{ 'top':this.position.y, 'left':this.position.x }}> { this.color ? <div className="tooltipColorBox" style={{ 'background':this.color }}></div> : null} { this.label } </div> : null;
        return(
             tooltipHTML 
        )
    }
}


Tooltip.propTypes = {
    label       : PropTypes.string.isRequired,
    color       : PropTypes.string,
    visible     : PropTypes.bool.isRequired,
    position    : PropTypes.object.isRequired
}

export default Tooltip;