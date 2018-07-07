import React, {Component} from 'react'


class ModalNewVersion extends Component {

    constructor(props, context) {
        super(props, context);
        this.addNewVersionClick = this.addNewVersionClick.bind(this);
    }

    addNewVersionClick() {
        var newVersionName = this.refs.newVersionName.value;
        var newVersionNumber = this.refs.newVersionNumber.value;
        var newVersionDate = this.refs.newVersionDate.value;

        var that = this;
        getHttpRequest("/create_version?version_name=" + encodeURIComponent(newVersionName) + "&version_number=" +
            encodeURIComponent(newVersionNumber) + "&version_date=" +
            encodeURIComponent(newVersionDate), function (newVersionResponse) {
            newVersionResponse = JSON.parse(newVersionResponse);
            var modal = document.getElementById('new-version-modal');
            modal.style.display = "none";
            var newVersion_id = newVersionResponse["version_id"];
            that.props.updateAddNewReleaseClick('addRelease', newVersion_id);
        });
    }

    render() {

        return <div id="new-version-modal" className="modal modal-lg" style={{'width': '40%', 'margin': '5% 25%',}}>

            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" id="close-modal-new-version" data-dismiss="modal"
                            aria-hidden="true">×
                    </button>
                    <h4 className="modal-title">Add New Release</h4>
                </div>
                <div className="modal-body">
                    <form role="form">
                        <div className="form-group">
                            <label className="control-label" htmlFor="new-version-name">Release Name</label>
                            <input className="form-control" ref="newVersionName"/>
                            <label className="control-label" htmlFor="new-version-number">Release Number</label>
                            <input className="form-control" ref="newVersionNumber"/>
                            <label className="control-label" htmlFor="new-version-date">Date</label>
                            <input type="date" className="form-control" ref="newVersionDate"/>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <a className="btn btn-primary" id="add-version-button" onClick={this.addNewVersionClick}>Add
                        Release</a>
                </div>
            </div>
        </div>

    }
}


class ModalConfirmation extends Component {

    constructor(props, context) {
        super(props, context);

        this.confirmYesClick = this.confirmYesClick.bind(this);
        this.state = ({showModalConfirmation: false});

    }


    confirmYesClick() {
        if (this.props.opType == 'rename') {
            this.props.renameConfirmationVersionYesClick();
        }
        else if (this.props.opType == 'remove') {
            this.props.removeConfirmationVersionYesClick();
        }
        else if (this.props.opType == 'editVersion' || this.props.opType == 'addRelease') {
            this.props.editVersionFeaturesSaveYes();
        }
        else if (this.props.opType == 'discardChanges') {
            this.props.discardAllVersionChanges();
        } else if (this.props.opType == 'editCPfeatures') {
            this.props.editCustomerFeatureSaveYes();
        }

    }

    confirmCancelClick() {


        if (this.props.modalRename) {
        }
        else if (this.props.modalRemove) {
            this.props.confirmationModalClose();
        }
        if (this.props.opType == 'rename') {
            //this.props.renameConfirmationVersionCancelClick();
        }
        else if (this.props.opType == 'remove') {
            this.props.confirmationModalClose();
        }
        else if (this.props.opType == 'editVersion' || this.props.opType == 'addRelease') {
            this.props.confirmationModalClose();
        } else if (this.props.opType == 'discardChanges') {
            this.props.confirmationModalClose();
        } else if (this.props.opType == 'editCPfeatures') {
            this.props.confirmationModalClose();
        }


    }

    componentDidMount() {
        var renameVersionModal = document.getElementById("confirmation-modal");
        renameVersionModal.style.display = "block";
    }

    render() {
        return <div id="confirmation-modal" className="modal modal-lg" style={{'width': '40%', 'margin': '5% 25%',}}>

            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">Confirmation</h4>
                </div>
                <div className="modal-body">
                    <h4 className="modal-title" id="confirmation-text">Do you want to continue?</h4>
                </div>
                <div className="modal-footer">
                    <a className="btn btn-primary" id="confirmation-button" onClick={this.confirmYesClick}>Yes</a>
                    <a className="btn btn-default" id="cancel-button" onClick={this.confirmCancelClick}>Cancel</a>
                </div>
            </div>
        </div>
    }
}


class ModalRenameVersion extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = ({showModalConfirmation: false});


        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var version_date = this.props.version_date;
        var version_dateArray = version_date.split(' ');
        var day = version_dateArray[0];
        var month = version_dateArray[1];
        var selectedMonth = (monthNames.indexOf(month) + 1)
        var selectedMonthStr = selectedMonth.toString().length == 1 ? '0' + selectedMonth : selectedMonth;
        var date = new Date();
        var year = date.getFullYear();
        this.state = {
            version_id: this.props.version_id,
            version_name: this.props.version_name,
            version_date: year + '-' + selectedMonthStr + '-' + day,
            showModalConfirmation: false
        }

    }


    componentDidMount() {
        var renameVersionModal = document.getElementById("rename-version-modal");
        renameVersionModal.style.display = "block";
        renameVersionModal.style.left = "30%";
        renameVersionModal.style.width = "40%";
        renameVersionModal.style.margin = "5% 2%";
    }

    renameVersionClick() {

        this.setState({showModalConfirmation: true});
    }

    renameConfirmationVersionYesClick() {

        var that = this;
        getHttpRequest("/rename_version?version_name=" + encodeURIComponent(this.refs.renameVersionName.value) + "&version_id=" +
            encodeURIComponent(this.props.version_id) + "&version_date=" +
            encodeURIComponent(this.refs.renameVersionDate.value), function (renamedVersionResponse) {
            getHttpRequest("/versions", function (versionsResponse) {

                var versions = JSON.parse(versionsResponse);
                var unsupportedVersion = {
                    "date": '',
                    "name": 'Unsupported',
                    "number": UNSUPPORTEDVERSIONID,
                    "version_id": UNSUPPORTEDVERSIONID
                };
                var versionsNew = new Array;
                versions.forEach(function (entry, index) {
                    versionsNew.push(entry)
                    if (index == versions.length - 2) {
                        versionsNew.push(unsupportedVersion)
                    }
                })

                that.props.updateRenameVersionOnSaveClick(versionsNew, that.props.version_id);
            })

        });

        this.setState({showModalConfirmation: false});
    }

    confirmationVersionCancelClick() {
        this.setState({showModalConfirmation: false});
    }

    renameModalCloseClick() {
        this.props.renameModalClose();
    }

    render() {
        return <div id="rename-version-modal" className="modal modal-lg">

            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" id="close-modal-rename-version" data-dismiss="modal"
                            aria-hidden="true" onClick={this.renameModalCloseClick}>×
                    </button>
                    <h4 className="modal-title">Rename Release</h4>
                </div>
                <div className="modal-body">
                    <form role="form">
                        <div className="form-group">
                            <label className="control-label" htmlFor="rename-version-name">Release Name</label>
                            <input className="form-control" ref="renameVersionName"
                                   defaultValue={this.state.version_name}/>
                            <label className="control-label" htmlFor="rename-version-date">Date</label>
                            <input className="form-control" ref="renameVersionDate" type="date"
                                   defaultValue={this.state.version_date}/>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <a className="btn btn-primary" id="confirm-rename-version-button" onClick={this.renameVersionClick}>Rename
                        Release</a>
                </div>
            </div>
            {this.state.showModalConfirmation ? <ModalConfirmation
                renameConfirmationVersionYesClick={this.renameConfirmationVersionYesClick} opType={'rename'}
                renameConfirmationVersionCancelClick={this.confirmationVersionCancelClick}/> : ''}
        </div>


    }
}

export { // without default
    ModalNewVersion,
    ModalConfirmation,
    ModalRenameVersion

}
