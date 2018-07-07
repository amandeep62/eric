/**
 * @description      : Component to to create custom ChartMenu
 * @prop {Array}     : menuListObject, optional
 * @prop {String}    : menuHeader, required
 * @prop {String}    : menuColor, optional
 * @prop {Object}    : position, required
 * @prop {String}    : scope, required
 * @prop {Boolean}   : visible
 */
import { Component, PropTypes } from "react";
import "./ChartMenu.less";

class ChartMenu extends Component {
    /**
     * @description Constructor
     * @param {*} props 
     * @param {*} context 
     */
    constructor(props, context){
        super(props, context)

        this.menuClick = this.menuClick.bind(this);

        this.menuListObject = this.props.menu ? this.props.menu : [];
        this.menuHeader     = this.props.menuHeader;
        this.menuColor      = this.props.menuColor;
        this.position       = this.props.position;
        this.scope          = this.props.scope;
        this.visible        = this.props.visible;
    }

    /**
     * @description React lifcycle function
     * @param {*} nextProps 
     */
    componentWillReceiveProps(nextProps){
        this.menuListObject = nextProps.menu ? nextProps.menu : [];
        this.position = nextProps.position;
        this.menuColor = nextProps.menuColor;
        this.menuHeader = nextProps.menuHeader;
        this.scope      = nextProps.scope;
        this.visible    = nextProps.visible ? nextProps.visible : false;
    }

    /**
     * @description Invoked whenever chart menu item is clicked.
     * @param {*} index 
     * @param {*} label 
     * @param {*} sector 
     * @param {*} scope 
     */
    menuClick(index, label, sector, scope){
        sector = sector.split('(')[0].trim();
        this.props.chartMenuClickCallback(index, label, sector, scope);
    }

    /**
     * @description React lifecycle function
     */
    render(){
        let menuListHTML = this.menuListObject.map((menuItem, index)=>{
        // let menuAction = menuItem.action ? menuItem.action : menuItem.href ? menuItem.href : '';
            return <li 
                    key={ "menuItem" + index } 
                    onClick={ (e)=>this.menuClick(menuItem.index, menuItem.label, this.menuHeader, this.scope) }>
                    { menuItem.label }
                </li>
        });
        let chartMenu = (this.visible && this.menuListObject.length) ? <div className="chartMenu" style={{'top': this.position.y, 'left': this.position.x }}>
                <ul>
                    <li><div className="chartMenuColorBox" style={{'backgroundColor':this.menuColor}}></div>{this.menuHeader}</li>
                    { menuListHTML }
                </ul>
            </div> : null ;
        return(
             chartMenu
        )
    }
}

ChartMenu.propTypes = {
    menuListObject       : PropTypes.array,
    menuHeader           : PropTypes.string,
    menuColor            : PropTypes.string,
    position             : PropTypes.object.isRequired,
    scope                : PropTypes.string,
    visible              : PropTypes.bool
}

export default ChartMenu;