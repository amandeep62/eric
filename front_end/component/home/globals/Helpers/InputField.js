/**
 * @description      : Component to create renderable input fields
 * @prop {String}    : inputID, required
 * @prop {Number}    : name, required
 * @prop {Number}    : value, required
 */
import { Component, PropTypes } from "react";


class InputField extends Component {
    
    constructor(props, context){
        super(props, context)
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            inputID : this.props.inputID, // Required
            name    : this.props.name, // Required
            value   : this.props.value // Required
        };
    }
    
    extract(str, pattern){ return (str.match(pattern) || []).pop() || '' }
    extractAlphanum(str){ return this.extract(str, "[0-9a-zA-Z]+") }
    extractNumber(str){ return this.extract(str, "[0-9.]+") } // Previously used regex [0-9.]+


    handleChange(event) {
        
        let filterValue = this.extractNumber(event.target.value);
        this.setState({ value: filterValue });
        this.props.handleChangeFault(filterValue,this.state.inputID);
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            inputID : nextProps.inputID,
            name    : nextProps.name,
            value   : nextProps.value
        })
    }

    render(){
        return(
            <input id={this.state.inputID} name={this.state.name} className="testing" type="text" value={this.state.value} onChange={(e)=>this.handleChange(e)} />
        )
    }
}

InputField.propTypes = {
    inputID : PropTypes.string.isRequired,
    name    : PropTypes.string.isRequired,
    value   : PropTypes.number
}

export default InputField;
