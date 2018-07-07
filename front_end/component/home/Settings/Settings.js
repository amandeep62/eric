import {Component} from 'react'
import { browserHistory } from 'react-router'


import {userPermissions} from "../../../constants/constants"

    class Settings extends Component {

        constructor(props, context) {
            super(props, context);

            this.state = {
                settingsMenuArray: [
                ],
                showModalRenameVersion: false,
                page: this.props.page,
                actionType: this.props.actionType
            }
        }

        logOutUser() {
            getHttpRequest("/signout", function (data) {
                localStorage.removeItem("userPermissions");
                browserHistory.push("/login")
            });
        }

        render() {

            var that = this;
            var settingMenuShowArray = this.state.settingsMenuArray.filter(function (element) {
                return element.show==true
            });

            return <div>
                <ul className="nav navbar-nav navbar-right inMobile">
                    <li>
                        <div className="dropdown" id="settings-list">
                            <div className="btn-group">
                                <span id="hamburger-button" data-toggle="dropdown" aria-haspopup="true"
                                      aria-expanded="false" className="glyphicon glyphicon-cog"
                                      aria-hidden="true"></span>
                                <ul className="dropdown-menu" aria-labelledby="navbarDrop1">
                                    {settingMenuShowArray.map(function (menu, index) {
                                        return <li key={"li" + index}><a key={"a" + index} id={menu.id}
                                                                         onClick={that.menuItemClick}><span
                                            key={"span" + index} className={menu.className}
                                            aria-hidden="true"></span>{menu.name}</a></li>
                                    })}
                                    {localStorage.userPermissions == userPermissions ?<li><a href="/UserAccess" target="_blank"><span
                                        className="glyphicon glyphicon-user info-icon-padding"
                                        aria-hidden="true"></span> User Permissions</a></li>:null}

                                    <li><a onClick={this.logOutUser}><span
                                        className="glyphicon glyphicon-log-out info-icon-padding"
                                        aria-hidden="true"></span>Sign Out</a></li>
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>

            </div>

        }
    }


export default Settings;

