import React, {Component} from 'react';
import Modal from '../../globals/ModalPopup/modal'
import {putHttpRequest,deleteHttpRequest} from "../../../../httprequest/http_connection";

class ProductReadinessEditTableView extends Component{
    constructor(props, context) {
        super(props, context);

        this.saveProductReadinessTableClick = this.saveProductReadinessTableClick.bind(this);
        this.onChangeProductTitle = this.onChangeProductTitle.bind(this);
        this.saveEdit_Click = this.saveEdit_Click.bind(this);
        this.deleteProductTitle = this.deleteProductTitle.bind(this);


        let product_titleArray = this.props.productReadinessData.map(function(a) {return {product_title:a.product_title,product_title_id:a.product_title_id}});
        product_titleArray = product_titleArray.filter((element, index, self) =>
            index === self.findIndex((t) => (
                t.product_title === element.product_title && t.product_title_id === element.product_title_id
            ))
        );


        this.state= {productReadinessData:this.props.productReadinessData,
            product_titleArray:product_titleArray,
            selectedProductTitle:product_titleArray.map((a)=>a.product_title),
            modalViewOpen:false,
        }
    }



    /**
     * comparision of two values
     * @param a
     * @param b
     * @returns {boolean}
     */
    compare(a, b) {

        return JSON.stringify(a) === JSON.stringify(b);
    }

    /**
     *productReadinessData prop gives values for table
     * affectedRows-has the edited table rows
     * making a post request to /editProdReadiness
     */
    saveProductReadinessTableClick(callBack){

        let productDataArray=[];

        this.state.productReadinessData.map((val, i)=>{
            if(this.refs["PRTargetQuarter_"+i]) {
                let productObject = {
                    id: parseInt(this.refs["id" + i].textContent),
                    product_type: this.refs["product_type" + i].textContent,
                    product_year: parseInt("2017"),
                    product_title: this.refs["product_title" + i].textContent,
                    target_quarter: parseInt(this.refs["PRTargetQuarter_" + i].refs["inputTargetQuarter_" + i].value),
                    current_quarter: parseInt(this.refs["PRCurrentQuarter_" + i].refs["inputCurrentQuarter_" + i].value),
                    next_quarter: parseInt(this.refs["PRNextQuarter_" + i].refs["inputNextQuarter_" + i].value),
                    upcoming_quarter: parseInt(this.refs["PRUpcomingQuarter_" + i].refs["inputUpcomingQuarter_" + i].value)
                }

                productDataArray.push(productObject);
            }

        })

        let affectedRows=[];
        for(let i=0; i<productDataArray.length;i++) {
            if(!(this.compare(productDataArray[i], this.state.productReadinessData[i]))){
                affectedRows.push(productDataArray[i]);
            }
        }
        postHttpRequest('/editProdReadiness', affectedRows, function (data,status) {
                if(status==200){
                    callBack();
                }
            });
    }

    onChangeProductTitle(e){
        let selectedProductTitle=[];
        let $nodes = $(e.target).closest('.addProduct').children();
        for(let i=1;i<$nodes.length;i++){
            let checkBoxElement = $($nodes[i]).find('input');
            if(checkBoxElement.prop('checked')){
                selectedProductTitle.push(checkBoxElement.val())
            }
        }

        this.setState({selectedProductTitle:selectedProductTitle});


    }

    componentWillReceiveProps(nextProps){
        let product_titleArray = nextProps.productReadinessData.map(function(a) {return {product_title:a.product_title,product_title_id:a.product_title_id}});
        product_titleArray = product_titleArray.filter((element, index, self) =>
            index === self.findIndex((t) => (
                t.product_title === element.product_title && t.product_title_id === element.product_title_id
            ))
        );


        this.setState({productReadinessData:nextProps.productReadinessData,
            product_titleArray:product_titleArray,
            selectedProductTitle:product_titleArray.map((a)=>a.product_title),
        });
    }


    closeModal(){

        this.setState(
            {modalViewOpen:false}
        );
    }

    saveEdit_Click(product_title_id){

        let product_title=this.refs.inputProductTitle.value.trim();
        let body = {product_title:product_title,product_title_id:product_title_id}

        if(product_title_id==0){

            postHttpRequest("/ProdReadinessTitle",body,(data,status)=>{
                if(status==201){

                    this.props.addEditTitleCallBack();
                }
            })
        }
        else{
            putHttpRequest("/ProdReadinessTitle",body,(data,status)=>{
                if(status==201){
                    this.props.addEditTitleCallBack();
                }
            })
        }

        this.closeModal();
    }

    deleteProductTitle(product_title_id){
        if (confirm("Are sure you want to delete?")) {
            deleteHttpRequest("/ProdReadinessTitle?id=" + product_title_id, (data) => {
                this.props.addEditTitleCallBack();
            })
        }
    }




    /*html for table headers and data product readiness page*/
    render(){

        return <div className="tableView">
                <div className="addProduct">
                    <button className="btn btn-default btn-udn-green" onClick={()=>this.setState({modalViewOpen:true,textValue:'',product_title_id:0})}>
                        <span className="glyphicon glyphicon-plus"></span>
                    </button>
                    {this.state.product_titleArray.map((element,index)=>{
                        return <div key={"tr"+index} className="productItem">
                                <input
                                    key={"input"}
                                    type="checkbox"
                                    name="filter"
                                    value={element.product_title}
                                    onChange={(e)=>this.onChangeProductTitle(e)}
                                    defaultChecked/>
                                <label htmlFor={"check" } style={{color:"white"}}>{element.product_title}</label>
                                <div className="udn-btn-group">
                                    <span onClick={()=>this.setState({modalViewOpen:true,textValue:element.product_title,product_title_id:element.product_title_id})}  className="glyphicon glyphicon-pencil"></span>
                                    <span onClick={()=>this.deleteProductTitle(element.product_title_id)} className="glyphicon glyphicon-remove text-danger"></span>
                                </div>
                            </div>
                    })}
                </div>
            <Modal isOpen={this.state.modalViewOpen} className="container-fluid inProductReadinessModal" bgColor={'white'} onClose={() => this.closeModal()}>
                <div className="cancelPlatformModal">
                    <div onClick={() => this.closeModal()}>
                        <span className="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span>
                    </div>
                </div>
                <input className="projectTitleInput" defaultValue={this.state.textValue} ref="inputProductTitle" type="text" placeholder="Product Title" />
                <button className="btn btn-default btn-udn-green" onClick={()=>this.saveEdit_Click(this.state.product_title_id)}>Save</button>
            </Modal>
            <table className="table table-striped table-analysis plan-table">
                <thead>
                    <tr className="plan-header-row">
                        <th className="table-sorter tdAlign">id</th>
                        <th className="table-sorter tdAlign">product Type</th>
                        <th className="table-sorter tdAlign">product Title</th>
                        <th className="table-sorter tdAlign">Target</th>
                        <th className="table-sorter tdAlign">Current</th>
                        <th className="table-sorter tdAlign">Upcoming</th>
                        <th className="table-sorter tdAlign">Next</th>
                    </tr>
                </thead>
            </table>
            <div className="tableList">
                <table className="table table-striped table-analysis plan-table">
                    <tbody className="plan-body-row">
                    {
                        this.state.productReadinessData.map((val, i)=>{
                            return this.state.selectedProductTitle.indexOf(val.product_title)>-1?  <tr key={i} >
                                        <td className="tdAlign" ref={"id"+(i)}>{val.id}</td>
                                        <td className="tdAlign" ref={"product_type"+(i)} >{val.product_type}</td>
                                        <td className="tdAlign" ref={"product_title"+(i)}>{val.product_title}</td>
                                        <td className="tdAlign">
                                            <PRInput ref={"PRTargetQuarter_"+(i)} inputId={"inputTargetQuarter_"+(i)} i={i} val={val.target_quarter}  />
                                        </td>
                                        <td className="tdAlign">
                                            <PRInput ref={"PRCurrentQuarter_"+(i)} inputId={"inputCurrentQuarter_"+(i)} i={i} val={val.current_quarter}  />
                                        </td>
                                        <td className="tdAlign">
                                            <PRInput ref={"PRUpcomingQuarter_"+(i)} inputId={"inputUpcomingQuarter_"+(i)} i={i} val={val.upcoming_quarter}  />
                                        </td>
                                        <td className="tdAlign">
                                            <PRInput ref={"PRNextQuarter_"+(i)} i={i} inputId={"inputNextQuarter_"+(i)} val={val.next_quarter}  />
                                        </td>
                                    </tr>:null;
                        })
                    }
                    </tbody>
                </table>
            </div>
        </div>
    }
}

class PRInput extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            i:this.props.i,
            val:this.props.val,
        }

    }

    onChangeText(e){
        let val = parseInt(e.target.value);

        if(val>100 || val<0){
            return;
        }
        else{
            this.setState({val:val})
        }


    }

    render(){
        return <input ref={this.props.inputId} className="quarterVal"  value={this.state.val} onChange={(e)=>this.onChangeText(e)} type="number" />
    }
}

export default ProductReadinessEditTableView;