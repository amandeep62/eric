import React from 'react';
import {render} from 'react-dom';
import { Router, Route, Link, browserHistory, IndexRoute  } from 'react-router'
import { Provider } from 'react-redux';
import store from './store/store';
import App from './app';
import Login from './component/login/login';
import KPI from './component/home/KPI/KPI';
import Engineering from './component/home/Engineering/ProductReadiness/ProductReadiness';
import Traffic from './component/home/Traffic/TableView/Traffic';
import Roadmap from './component/home/Engineering/Roadmap/Roadmap';
import RoadmapContainer from './component/home/Engineering/Roadmap/RoadmapContainer';
import PlatformBoard from './component/home/Engineering/PlatformBoard/PlatformBoard';
import ReleaseDashboard from './component/home/Engineering/ReleaseDashboard/ReleaseDashboard';
import Status from './component/home/Engineering/Status/Status'; //change the name to Status
import Capacity from './component/home/Engineering/Capacity/Capacity';
import Trends from './component/home/Engineering/Trends/Trends';
import Quality from './component/home/Engineering/Quality/Quality';
import FST from './component/home/Engineering/FST/FST';
import Process from './component/home/Engineering/Process/Process';


var IDLE_TIMEOUT = 200; //seconds
var _idleSecondsCounter = 0;
document.onclick = function() {
    _idleSecondsCounter = 0;
};
document.onmousemove = function() {
    _idleSecondsCounter = 0;
};
document.onkeypress = function() {
    _idleSecondsCounter = 0;
};



function CheckIdleTime() {
    _idleSecondsCounter++;
    if (_idleSecondsCounter >= IDLE_TIMEOUT) {
        window.clearInterval(myInterval);
        myInterval==null;
        localStorage.removeItem("user_id");
        browserHistory.push('/login');
    }


}

var myInterval = null;
function loggedIn() {

    if(localStorage.user_id){

        if(myInterval==null){
            myInterval = window.setInterval(CheckIdleTime, 1000);
        }
        return true;

    }
    else {
        if(myInterval!=null) {
            window.clearInterval(myInterval);
        }
        myInterval==null;
        return false;
    }
}


function requireAuth(nextState, replace) {

    if (!loggedIn()) {
        replace({
            pathname: '/login'
        })
    }
}


render(
    <Provider store={store}>
    <Router history = {browserHistory}>
        <Route path = "/" component = {App}>
            <IndexRoute   component={Login} />
            <Route path = "login" component = {Login}  />
            <Route path = "kpi" onEnter={requireAuth} component = {KPI}  />
            <Route path = "engineering/productreadiness" onEnter={requireAuth} component = {Engineering}  />
            <Route path = "engineering/roadmap" onEnter={requireAuth} component = {RoadmapContainer}  />
            <Route path = "engineering/releasedashboard" onEnter={requireAuth} component = {ReleaseDashboard}  />
            <Route path = "engineering/status" onEnter={requireAuth} component = {Status}  />
            <Route path = "engineering/capacity" onEnter={requireAuth} component = {Capacity}  />
            <Route path = "engineering/quality" onEnter={requireAuth} component = {Quality}  />
            <Route path = "engineering/fst" onEnter={requireAuth} component = {FST}  />
            <Route path = "engineering/process" onEnter={requireAuth} component = {Process}  />
            <Route path = "engineering/platformboard" onEnter={requireAuth} component = {PlatformBoard}  />
            <Route path = "engineering/trends" onEnter={requireAuth} component = {Trends}  />
            <Route path = "traffic" onEnter={requireAuth} component = {Traffic}  />

            {/*<Route path = "CMS_KPI" onEnter={requireAuth} component = {KPIChart} />*/}
        </Route>
    </Router>
    </Provider>

, document.getElementById('root'));

