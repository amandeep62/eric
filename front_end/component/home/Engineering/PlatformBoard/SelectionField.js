import React, {Component} from 'react';

class SelectionField extends Component {
    constructor(props, context){
        super(props, context)
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            inputID:this.props.inputID,
            name: this.props.name,
            value: this.props.value
        };
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.handleChangeModule?this.props.handleChangeModule(event.target.value,this.state.inputID):null;
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            inputID:nextProps.inputID,
            name: nextProps.name,
            value: nextProps.value,
            selectOptions: nextProps.options
        })
    }

    render(){
        return(
            <select ref="qualityOptionlist" className="dropdown-button" id="qualityOptionlist" defaultValue={this.props.defaultValue?this.props.defaultValue:null} value={this.state.value} onChange={this.handleChange.bind(this)}>
                {
                    this.props.moduleList.map((data,index)=> {
                        return (<option key={"option"+index}  value={data} className="dropdown-item">{data}</option>);
                    })
                }
            </select>
        )
    }
}

 class SelectionFieldNameID extends Component {
    constructor(props, context){
        super(props, context)
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            inputID:this.props.inputID,
            name: this.props.name,
            value: this.props.value
        };
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.handleChangeModule?this.props.handleChangeModule(event.target.value,this.state.inputID):null;
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            inputID:nextProps.inputID,
            name: nextProps.name,
            value: nextProps.value,
            selectOptions: nextProps.options
        })
    }

    render(){
        return(
            <select ref="qualityOptionlist" className="dropdown-button" id="qualityOptionlist" defaultValue={this.props.defaultValue?this.props.defaultValue:null}  onChange={this.handleChange.bind(this)}>
                {
                    this.props.moduleList.map((data,index)=> {
                        return (<option key={"option"+index}  value={data.id} className="dropdown-item">{data.name}</option>);
                    })
                }
            </select>
        )
    }
}


export default SelectionField