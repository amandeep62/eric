import React, {Component} from 'react';
import {DropdownList} from 'react-widgets';
import ProductReadinessEditTableView from "./ProductReadinessEditTableView";
import {userPermissions,EngineeringTabEnum} from "../../../../constants/constants";
import EngineeringTitle from "../EngineeringHeader/EngineeringTitle";
import RadarChart from "./RadarChart";
import './product-readiness.less'

var loadProductTitle; //using for callback
class ProductReadiness extends Component {
    constructor(props, context) {
        super(props, context);
        this.getProductReadinessData = this.getProductReadinessData.bind(this);
        this.productReadinessOnSelect = this.productReadinessOnSelect.bind(this);
        this.saveProductReadinessTableClick=this.saveProductReadinessTableClick.bind(this);
        this.editProductReadinessTableClick=this.editProductReadinessTableClick.bind(this);
        this.cancelProductReadinessTableClick=this.cancelProductReadinessTableClick.bind(this);
        this.addEditTitleCallBack=this.addEditTitleCallBack.bind(this);

        this.state={productReadinessData:[],selected_product:"File D/L",editTableView: false}
        this.getProductReadinessData();

    }


    /**
     * function to get the data from database
     * data from the database stored in productReadinessData
     * table view set to false
     */

    getProductReadinessData(){
        getHttpRequest('/getProdReadiness', (data)=> {
            if (data.length > 0) {
                let productReadinessData = JSON.parse(data);

                this.setState({
                    productReadinessData: productReadinessData,
                })

            }
        });
    }

    callBackToGetChildRef(_loadProductTitle){
        loadProductTitle = _loadProductTitle;
    }
    addEditTitleCallBack(){
        this.getProductReadinessData();
        loadProductTitle();
    }

    /**
     * selection of product title from drop down
     * product readiness page
     * @param val
     */
    productReadinessOnSelect(val){
        this.setState({selected_product:val})

        }

    /**
     * save button in product readiness page- table view
     * @param editTableView
     */
    saveProductReadinessTableClick(editTableView){
        this.refs.productReadinessEditTableView.saveProductReadinessTableClick(()=>{
            this.setState({editTableView:editTableView});
            this.getProductReadinessData();
        });

    }

    /**
     * cancel button in product readiness page- table view
     * @param editTableView
     */
    cancelProductReadinessTableClick(editTableView){
        this.setState({editTableView:editTableView});
    }

    /**
     * edit button in product readiness page graph view
     * @param editTableView
     */
    editProductReadinessTableClick(editTableView){
        this.setState({editTableView:editTableView});
    }

    componentDidMount(){
        document.title = "Product Readiness";
    }

/* header, table and chart html*/
    render() {

        let productReadinessResult = this.state.productReadinessData.filter((element)=>element.product_title==this.state.selected_product);
        let product_type = productReadinessResult.map(a => a.product_type);
        let product_current = productReadinessResult.map(a => a.current_quarter);
        let product_upcoming = productReadinessResult.map(a => a.upcoming_quarter);
        let product_next = productReadinessResult.map(a => a.next_quarter);
        let product_target = productReadinessResult.map(a => a.target_quarter);


        return <div className="row productReadinessPage">
            <EngineeringTitle ref="engineeringTitle" title ="PRODUCT READINESS" engineeringTabId={EngineeringTabEnum.PRODUCTREADINESS.value}
                              productReadinessOnSelect={this.productReadinessOnSelect}
                              editProductReadinessTableClick = {this.editProductReadinessTableClick}
                              saveProductReadinessTableClick ={this.saveProductReadinessTableClick}
                              cancelProductReadinessTableClick ={this.cancelProductReadinessTableClick}
                              callBackToGetChildRef={this.callBackToGetChildRef}
            />

            <div  className=" col-md-12 productReadinessGraph">
                    {this.state.editTableView ?
                        <ProductReadinessEditTableView ref="productReadinessEditTableView"
                                                       productReadinessData={this.state.productReadinessData}
                                                       addEditTitleCallBack={this.addEditTitleCallBack}
                        /> :
                        <div className="col-md-9">
            <RadarChart
                product_type={product_type}
                product_current={product_current}
                product_upcoming={product_upcoming}
                product_next={product_next}
                product_target={product_target}
            />
                        </div>}
            </div>



        </div>
    }
}

export default ProductReadiness;



