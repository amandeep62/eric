
import React, {Component,PropTypes} from 'react';
import LoginForm from './loginform';
import loginSubmit from '../../httprequest/loginSubmit';
import { browserHistory } from 'react-router'
import {postHttpRequest,getHttpRequest,getHttpRequestWithStatus,getParameterByName} from '../../httprequest/http_connection'
import "./login.less";

var Loader = require('react-loader');


class Login extends Component{

    constructor(props, context) {
        
        super(props, context);
        this.state = {activityIndicatorLodaded: true};
        this.callbackAfterSubmit = this.callbackAfterSubmit.bind(this);
        this.salesforce = this.salesforce.bind(this);
        var user_id = getParameterByName("user_id");
        localStorage.removeItem("userPermissions");
        if(user_id){
            getHttpRequestWithStatus("/salesforceSession?user_id="+user_id,function(responsedData,status){
                if(status==200){
                    responsedData = JSON.parse(responsedData);
                    browserHistory.push("kpi")
                }
                else{

                }

            })
        }
        
    }

    callbackAfterSubmit(data){


        this.setState({activityIndicatorLodaded:false,showError:false})

        var that = this;
        postHttpRequest("/login",data,function (responsedData) {

            responsedData = JSON.parse(responsedData);
            if(responsedData.statusCode==200){
                localStorage.setItem("user_id",responsedData["user_id"]);
                //localStorage.setItem("role_type",responsedData["role_type"]);
                that.setState({activityIndicatorLodaded:true,showError:false,messageBody:''})

                getHttpRequest("/loginAs", function (data) {

                    localStorage.setItem("userPermissions",data);
                    browserHistory.push("kpi");
                })

            }
            else{
                var messageBody =  responsedData.message;
                that.setState({activityIndicatorLodaded:true,showError:true,messageBody:messageBody})
            }

        })
    }

    salesforce(){

        /*getHttpRequest('/salesforceLogin',function(res,req){
            return res;
        });*/
        window.location = "https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9GnaLrwG9TQTOZs7OKnZSnNQI7aXin5JGMgCqGgPwyDKSLPfz8ZHAXdbAGD6F9kDXAVsk.9fg9tQ6.dG2&redirect_uri=https://dashboard.ericssonudn.com/salesforceCallback"
    }    


    componentDidMount(){
        document.title = "Login";
        //this.props.callBack()
    }

    render() {

        var options = {

            color: 'white',
        }

        return (
            <div id="loginpage" className="row">
            <Loader loaded={this.state.activityIndicatorLodaded} options={options}><div className="container-fluid verCenter login">

                <LoginForm onSubmit={loginSubmit} callbackAfterSubmit ={this.callbackAfterSubmit} showError= {this.state.showError} messageBody ={this.state.messageBody} salesforce = {this.salesforce} />

            </div>
            </Loader>
            </div>
            );
    }
}



export default Login;
