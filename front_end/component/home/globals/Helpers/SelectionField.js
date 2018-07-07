/**
 * @description      : Component to create renderable input fields
 * @prop {String}    : inputID, required
 * @prop {Number}    : name, required
 * @prop {Number}    : value, required
 * @prop {Boolean}   : disabled, optional
 */
import { Component, PropTypes } from "react";

class SelectionField extends Component {
    constructor(props, context){
        super(props, context)
        this.handleChange = this.handleChange.bind(this);
        this.disabled  = this.props.disabled ? this.props.disabled : false;
        this.state = {
            inputID : this.props.inputID, // Required
            name    : this.props.name, // Required
            value   : this.props.value // Required
        };
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        // this.props.handleChangeModule(event.target.value,this.state.inputID);
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            inputID         : nextProps.inputID,
            name            : nextProps.name,
            value           : nextProps.value,
            selectOptions   : nextProps.options
        })
    }

    render(){
        return(
            <select disabled={ this.disabled } className="dropdown-button" id="qualityOptionlist" defaultValue={this.props.defaultValue?this.props.defaultValue:null} value={this.state.value} onChange={this.handleChange.bind(this)}>
                {
                    this.props.moduleList.map(function (data,index) {
                        return (<option key={"option"+index} value={data} className="dropdown-item">{data}</option>);
                    })
                }
            </select>
        )
    }
}


SelectionField.propTypes = {
    inputID : PropTypes.string.isRequired,
    name    : PropTypes.string.isRequired,
    value   : PropTypes.string.isRequired,
    disabled: PropTypes.bool
}

export default SelectionField;