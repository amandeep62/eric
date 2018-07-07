import React, {Component} from 'react'
class Dropdown extends Component {


    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
        var selected = this.getSelectedFromProps(this.props);
        this.state= {
            selected: selected
        }
    }

    getDefaultProps() {
        return {
            value: null,
            valueField: 'value',
            labelField: 'label',
            onChange: null
        }
    }


    componentWillReceiveProps(nextProps) {
        var selected = this.getSelectedFromProps(nextProps);
        this.setState({
            selected: selected
        });
    }

    getSelectedFromProps(props) {
        var selected;
        if (props.value === null && props.options.length !== 0) {
            selected = props.options[0][props.valueField];
        } else {
            selected = props.value;
        }
        return selected;
    }

    render() {
        var self = this;
        var options = self.props.options.map(function(option) {
            return (
                <option key={option[self.props.valueField]} name = {option[self.props.value]} value={option[self.props.valueField]}>
                    {option[self.props.labelField].replace("Release","UDN")}
                </option>
            )
        });
        return (
            <select id={this.props.id}
                    className='form-control'
                    value={this.state.selected}
                    onChange={this.handleChange}>
                {options}
            </select>
        )
    }

    handleChange(e) {
        if (this.props.onChange) {
            var change = {
                oldValue: this.state.selected,
                newValue: e.target.value
            }
            this.props.onChange(change);
        }
        this.setState({selected: e.target.value});
    }

}

export default Dropdown