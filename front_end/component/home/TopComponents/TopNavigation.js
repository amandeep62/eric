import React, {Component} from 'react'
import { browserHistory } from 'react-router'
import {engineeringTabs,UDNTabs} from "../../../constants/constants";

class TopNavigation extends Component {

    constructor(props, context) {
        super(props, context);

        this.topNavigationClick = this.topNavigationClick.bind(this);
        this.state = ({topNavigation:
            [
                {name:UDNTabs[0],indexPage:'', highlighted:true},
                {name:UDNTabs[1],indexPage:'/'+engineeringTabs[0], highlighted:false},
                {name:UDNTabs[2],indexPage:'',highlighted:false},
            ]
        });
    }

    /**
     * TODO Explain what this method does. And choose a better name such as "handleTabSelection"
     *
     * @param event
     */
    topNavigationClick (event) {



        var name = event.target.name;

        var array = this.state.topNavigation;
        var indexPage='';


        //Find the tab index that has been clicked and update its highlighted property in the navigation bar
        array.filter(function(el, index,
                              arr) {

            var filteredDict = el;
            if(name == el.name){
                filteredDict.highlighted = true;
                indexPage=el.indexPage;
            }
            else{
                filteredDict.highlighted = false;
            }
            arr[index] = filteredDict;
        })

        this.setState({topNavigation:array});

        let base = "/";
        let path =base+name.toLowerCase()+indexPage.toLowerCase().replace(' ','')
        browserHistory.push(path);
    }

    componentDidMount(){
    }

    render () {
        //let topNavigationObject=this.state.topNavigation.find(item=>item.name.toLowerCase()==this.props.mainPath);
        var array = this.state.topNavigation;
        var that = this;

        //Find the tab index that has been clicked and update its highlighted property in the navigation bar
        array.filter(function(el, index,
                              arr) {

            if(el.name.toLowerCase()==that.props.mainPath.toLowerCase()) {
                el.highlighted = true;
            }
            else{
                el.highlighted = false;
            }
            arr[index] = el;
        })


        var that = this;
        var pathname = browserHistory.getCurrentLocation().pathname;

        return <div>
            <ul className="nav navbar-nav navbar-right">
                {array.map(function (dict,index) {
                    return <li className={dict.highlighted? "active" :''} key={"li"+index}>
                        <a key={"a"+index} data-toggle="pill" name ={dict.name}  onClick={that.topNavigationClick}>{dict.name}</a>
                        {dict.highlighted? <div key={"div3"+index} className="highlight"></div> :''}
                    </li>
                })
                }
            </ul>
        </div>
    }
}

export default TopNavigation;