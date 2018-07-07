/**
 * Created by sumit.thakur on 9/6/17.
 */

import {Component} from 'react'
import Iframe from 'react-iframe';
import { DropdownList } from 'react-widgets';
import {getHttpRequest, postHttpRequest} from "../../../../httprequest/http_connection";

/***
 * state used in the component
 * @State-1 :  @Type ('string')urlLinkActive - To display default active value in 1st drop down
 * @State-2 :  @Type ('string')filePathActive - To display default active value in 2nd drop down
 * @State-3 :  @Type('string')urlLinkText - To display default active value in 1st drop down
 * @State-4 :  @Type(Array)urlLinks  - List of all  URL links
 * @State-5 :  @Type ('Array') : pdfList - List of all pdf files
 */
class ProcessContainer extends Component {
    /***
     * @class-desc : This class is used to upload pdf by https link or by file
     *               and displaying the uploaded pdf by drop down selection
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.sendPdfFile = this.sendPdfFile.bind(this);
        this.displaySelectedPdf = this.displaySelectedPdf.bind(this);
        this.changeUrl = this.changeUrl.bind(this);
        this.uploadUrl = this.uploadUrl.bind(this);
        this.selectedPdfUrlLink = this.selectedPdfUrlLink.bind(this);
        this.getAllPdfList();
        this.getAllUrlRecords();
        this.state = {
            filePathActive: '',
            pdfList:[],
            urlLinkText:'',
            urlLinks:[],
            urlLinkActive:''
        }
    }

    /**
     * @description : On trigger of change event updating the drop down value
     * @param {string} e - contains the value
     */
    changeUrl(e){
        this.setState({
            urlLinkText:e.target.value
        });
    }
    /**
     * @description : On click of upload button we're uploading link to backend
     */
    uploadUrl(){
        let  url = this.state.urlLinkText;
        let  body = {
            "upload_url":url
        };
        postHttpRequest('/uploadPdfLink', body, () => {
            this.getAllUrlRecords()
        })

    }
    /**
     * @description : On click of Upload Document button we are able to upload new documents to backend
     *
     */
    sendPdfFile(event) {
        event.preventDefault();
        let files = document.querySelector('input[type="file"]').files;
        if (files.length > 0) {

            let formData = new FormData();

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                formData.append('upload', file, file.name);

            }
            $.ajax({
                url: '/uploadPDF',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: ()=>{
                    this.getAllPdfList();
                    },
                xhr: function() {
                    // create an XMLHttpRequest
                    let xhr = new XMLHttpRequest();

                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', null, false);

                    return xhr;
                }
            });
        }
    }
    /**
     * @description : On click of Upload Document button we are able to upload new documents to backend
     */
    getAllPdfList(){
        getHttpRequest("/getAllPdfLists",  (list) => {
            let data = JSON.parse(list);
            let fileList = data.length > 0 ? data[0] : [];

            this.setState({
                pdfList:data,
                filePathActive:fileList
            })

        })
    }
    /**
     * @description : onSelect of drop down list item related view gets loaded
     * @param (String)selectedItem - Selected Item from drop down list
     */
    displaySelectedPdf(selectedItem){
        this.setState({
            filePathActive:selectedItem
        })
    }

    /**
     * @description : get all the uploaded records  to display in drop-down list
     *
     */
    getAllUrlRecords(){
        let urlRecord = [];
        getHttpRequest("/getAllUploadLinks", (uploadLinks) => {
            let uploadRecords = JSON.parse(uploadLinks);
            uploadRecords.data.map((element)=> {
                urlRecord.push(element.file_url);
            });
            this.setState({
                urlLinks:urlRecord,
                urlLinkActive:urlRecord[0]

            })
        });

    }

    /***
     * @description :
     * @param ('string')event :selected file to display
     */
    selectedPdfUrlLink(urlSelectedLink){
        let win = window.open(urlSelectedLink, '_blank');
        win.focus();
        this.setState({
            urlLinkActive:urlSelectedLink
        })
    }

    /***
     *
     * @returns {"div"}
     */
    render() {
        return (
            <div className="section-container">
                <div className="col-sm-2">
                    <label className="custom-file-upload">
                        <input type="file" name="upload" multiple
                               onChange={(e)=>this.sendPdfFile(e)}/>Upload Document
                    </label>
                </div>
                <div className="col-sm-4">
                    <div className="col-sm-8">
                        <input type="text" className="form-control"
                               value={this.state.urlLinkText} id="uploadLink"
                               placeholder="ADD URL LINK" onChange={(e)=>this.changeUrl(e)}/>
                    </div>
                    <div className="col-sm-4">
                        <input type="button"
                               className="btn btn-success" id="uploadLinkBtn"
                               value="submit"  onClick={(e)=>this.uploadUrl(e)}/>
                    </div>
                </div>
                <div className="col-sm-4">
                    <DropdownList
                        className="drop-down-all"
                        value={this.state.urlLinkActive}
                        data={this.state.urlLinks}
                        onSelect={(e) => this.selectedPdfUrlLink(e)}
                    />
                </div>
                <div className="col-sm-2 pull-right">
                    <DropdownList
                        className="drop-down-all"
                        value={this.state.filePathActive}
                        data={this.state.pdfList}
                        onSelect ={(e) => this.displaySelectedPdf(e)}
                    />
                </div>
                <div className="processContainer row">
                    <div className="col-md-12">
                    {this.state.filePathActive.length > 0 ?
                            <Iframe url={"/uploadPdf/" + this.state.filePathActive}
                                    allowfullscreen="false"/>
                            :
                            <div className='noDataAvailable'>"No PDF's Available"</div>}
                    </div>
                    </div>
            </div>

        );
    }
}

export default ProcessContainer;