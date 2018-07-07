import React from 'react';
import './ToolTipCustomComponent.less'
class Tooltip extends React.Component {
    constructor () {
        super();
        this.state = {
            isVisible: false,
        };
        this.timer;
    }

    componentWillUnmount () {
        clearTimeout(this.timer);
    }

    handleMouseEnter () {
        this.timer = setTimeout(() => {
            this.setState({
                isVisible: true
            });
        }, this.props.delayTime);
    }

    handleMouseMove (e) {
        let offset = $(ReactDOM.findDOMNode(this)).offset();
        let x = e.pageX- offset.left;
        let y = e.pageY- offset.top;
        $(ReactDOM.findDOMNode(this)).find('.tooltip-label').css({'top':(e.pageY+10)+'px','left':e.pageX+'px'});
    }
    handleMouseLeave () {
        clearTimeout(this.timer);
        this.setState({
            isVisible: false
        });
    }

    render () {
        const isVisible = this.state.isVisible ? 'is-visible':'is-hidden';
        const className = `tooltip1 ${isVisible}`;
        return (
            <div
                className={className}
                onMouseEnter={this.handleMouseEnter.bind(this)}
                onMouseLeave={this.handleMouseLeave.bind(this)}
                onMouseMove={this.handleMouseMove.bind(this)}>
                <div className="tooltip-label">{this.props.label}</div>
                {this.props.children}
            </div>
        );
    }
}

Tooltip.defaultProps = {
    delayTime: 100
};

Tooltip.propTypes = {
    label: React.PropTypes.string
};

export default Tooltip;



