
import React, {Component,PropTypes} from 'react'
import { Field, reduxForm } from 'redux-form';

const required = value => value ? undefined : 'Required'
const maxLength = max => value =>
    value && value.length > max ? `Must be ${max} characters or less` : undefined

const maxLength15 = maxLength(15)
const number = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined
const minValue = min => value =>
    value && value < min ? `Must be at least ${min}` : undefined
const minValue18 = minValue(18)
const email = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
        'Invalid email address' : undefined
const tooOld = value =>
    value && value > 65 ? 'You might be too old for this' : undefined
const aol = value =>
    value && /.+@aol\.com/.test(value) ?
        'Really? You still use AOL for your email?' : undefined

const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (

    <div>

        <div>
            <input {...input} placeholder={label} type={type}/>
            {touched && ((error && <span style={{color:"red",marginLeft:'5px'}}>{error}</span>) || (warning && <span style={{color:"red",marginLeft:'2px'}}>{warning}</span>))}
        </div>
    </div>
)

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
    //return results[2];
}

function salesforce(){
        getHttpRequest('/salesforceLogin',function(res,req){
            return res;
        });
    }    


const LoginForm = props => {

    const { handleSubmit, pristine, reset, submitting } = props;

    

    var showError = props.showError? <div style={{color:"red"}}>{props.messageBody}</div>:'';

    return (
        <div>
            <form onSubmit={handleSubmit(props.callbackAfterSubmit)}>
                {showError}
                <div className="container">
                    <div className="loginForm">
                        <div><span className="loginFormInner"></span></div>
                        <div className="withValidation">
                            <Field name="username" component={renderField} type="text" className="col-xs-12"
                                   validate={[ required ]}
                            />
                        </div>
                        <div className="withValidation">
                            <Field name="password"  component={renderField} type="password" className="col-xs-12"
                                   validate={[ required]}
                            />
                        </div>
                        <button type="submit" className ="submit-btn">Login</button>
                        <br />
                        <input type="checkbox" defaultChecked="checked" /> <span className="remindMe">Remember me</span>
                    </div>

                    <div style={{'marginTop': '17%','marginLeft': '14%'}}>
                        <div className="welcomeTo">Welcome to UDN</div>
                        <div className="reviewCustomer">Review customer accounts, map product features, and
                            <br />manage Releases.</div>
                    </div>
                </div>
            </form>

            <div className="container">
                <div className ="salesForceForm">
                    <button className="salesForceButton" onClick={()=>props.salesforce()}  >Salesforce Login</button>
                </div>
            </div>
        </div>
    );
};





export default reduxForm({
    form: 'login', // a unique identifier for this form
})(LoginForm);
