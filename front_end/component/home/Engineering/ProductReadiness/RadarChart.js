import React, {Component} from 'react';
import './RadarChart.less'


class RadarChart extends Component {
    constructor(props, context) {
        super(props, context);
        this.radius=100;
        this.totalAngle=360;
        this.dotMouseOver = this.dotMouseOver.bind(this);
        this.toolTipRemove = this.toolTipRemove.bind(this);
        this.describeRadar = this.describeRadar.bind(this);
        this.updateDimensions=this.updateDimensions.bind(this);
        this.scaleIncrement=10;
        this.state = {showToolTip:false,
            product_current:this.props.product_current,
            product_upcoming:this.props.product_upcoming,
            product_next:this.props.product_next,
            product_target:this.props.product_target,
            product_type:this.props.product_type,
            scaleX:1.0,
            scaleY:1.0
        }


    }


    componentWillReceiveProps(nextProps){
        let product_current = nextProps.product_current;
        let product_upcoming = nextProps.product_upcoming;
        let product_next = nextProps.product_next;
        let product_target = nextProps.product_target;
        let product_type = nextProps.product_type.length>0 ? nextProps.product_type : [];

        this.state = {showToolTip:false,
            product_current:product_current,
            product_upcoming:product_upcoming,
            product_next:product_next,
            product_target:product_target,
            product_type:product_type
        }

        var arr = [product_current,product_upcoming,product_next,product_target]; //a multidimensional array
        var maxRow = arr.map(function(row){ return Math.max.apply(Math, row); });
        var max = Math.max.apply(null, maxRow);
        var maxNearestTen = Math.ceil(max / 10) * 10;
        this.scaleIncrement =maxNearestTen<=100?20:10;
        this.radius = maxNearestTen<=100?200:100;

    }

     polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }


     describeRadarAxis(x, y,arr ){
         if(arr.length==0){
             return {d:"",dotPointArray:[]}
         }


        var totalAngle = this.totalAngle;
        let radius = this.radius;
        radius= radius<=100?radius+this.scaleIncrement:radius;
        var point=0;
        var d = [];
        var inc = totalAngle/(arr.length)
        var prevPoint = this.polarToCartesian(x, y, radius,0);
        for(var i=0;i<=totalAngle;i+=inc){
            point = this.polarToCartesian(x, y, radius,i);
            d.push("M"); d.push(x); d.push(y);
            d.push("L"); d.push(point.x); d.push(point.y);
            prevPoint = point;
        }

        for(var r=radius;r>0;r-=this.scaleIncrement){

            prevPoint = this.polarToCartesian(x, y, r,0);
            d.push("M"); d.push(prevPoint.x); d.push(prevPoint.y);
            for(var i=0;i<=totalAngle;i+=inc){
                point = this.polarToCartesian(x, y, r,i);
                d.push("L"); d.push(prevPoint.x); d.push(prevPoint.y);
                d.push("L"); d.push(point.x); d.push(point.y);
                prevPoint = point;
            }
        }

        var d1 = d.join(" ");

        return d1;
    }

     describeRadar(x, y,arr){

         if(arr.length==0){
             return {d:"",dotPointArray:[]}
         }

        var totalAngle = this.totalAngle;
        let radius = this.radius


        var point=0;
        var d = [];
        let dotPointArray=new Array;
        var inc = totalAngle/(arr.length)
        var angleInc=0;
        var prevPoint = this.polarToCartesian(x, y, radius,0);

        for(var i = 0;i<arr.length;i++){
            var ratio = arr[i]/100;
            var numberRadius = radius*ratio;
            //numberRadius=arr[i];
            if(i==0){
                prevPoint = this.polarToCartesian(x, y, numberRadius,0);
                d.push("M"); d.push(prevPoint.x); d.push(prevPoint.y);
            }

            point = this.polarToCartesian(x, y, numberRadius,angleInc);
            d.push("L"); d.push(prevPoint.x); d.push(prevPoint.y);
            d.push("L"); d.push(point.x); d.push(point.y);
            prevPoint = point;
            angleInc=angleInc+inc;
            dotPointArray.push({point:point,number:arr[i]});
        }

        var ratio = arr[0]/100;
        var numberRadius = radius*ratio
        point = this.polarToCartesian(x, y, numberRadius,angleInc);
        d.push("L"); d.push(prevPoint.x); d.push(prevPoint.y);
        d.push("L"); d.push(point.x); d.push(point.y);

        var d1 = d.join(" ");


        return {d:d1,dotPointArray:dotPointArray};
    }

    dotMouseOver(element,quarterName,index){
         let productTypeString = this.state.product_type[index];
        this.setState({showToolTip:true,dotElement:element,message:productTypeString,quarterName:quarterName});
    }

    toolTipRemove(){
        this.setState({showToolTip:false});
    }
    updateDimensions() {
        let width =  window.innerWidth;
        let height =  window.innerHeight;

        let scale = parseFloat(height)/parseFloat(750)
        if(scale>1.0){
            scale=1.0;
        }

        this.setState({scaleX:scale,scaleY:scale});
    }
    componentWillMount() {
        this.updateDimensions();
    }
    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }




    render(){
        let centerX = 205;
        let centerY = 205;
        let legendNameArray = [{name:"Current(2017 Q3)",color:"rgba(75, 119, 199, 1)"},{name:"2017 Q4",color:"rgba(191, 144, 0, 1)"},{name:"2018 Q1",color:"rgba(0, 176, 79, 1)"},{name:"Target",color:"rgba(166, 166, 166, 1)"}];
        let inc = this.totalAngle/(this.state.product_type.length)
        let angleInc = 0;
        let product_current=this.state.product_current;
        let radarAxisPath=this.describeRadarAxis(centerX,centerY,product_current);
        let radarPathProductCurrentObject=this.describeRadar(centerX,centerY,product_current);

        let product_upcoming=this.state.product_upcoming;
        let radarPathProductUpcomingObject=this.describeRadar(centerX,centerY,product_upcoming);

        let product_next=this.state.product_next;
        let radarPathProductNextObject=this.describeRadar(centerX,centerY,product_next);

        let product_target=this.state.product_target;
        let radarPathProductTargetObject=this.describeRadar(centerX,centerY,product_target);

        return <div>

            <div style={{marginBottom:"10px"}}>
                <ul style={{width:'800px',margin:'auto'}} className="productLegend">
                {legendNameArray.map((element,index)=>{
                    return <li key={"li_"+index}><div style={{float:"left",border:"solid 2px "+element.color,width:'50px',height:'20px',marginRight:"10px"}}></div>{element.name}</li>
                })}
                </ul>
            </div>
            {product_current.length>0?<div style={{width:'400px',height:'410px',margin:'auto',position:'relative',transformOrigin: "center top 0px",transform: "scale("+this.state.scaleX+","+ this.state.scaleY+")"}}>
            <svg style={{width:'400px',height:'410px'}} onClick={this.toolTipRemove}>
                <path fill="none" stroke="#0c1829" strokeWidth="1" d={radarAxisPath} />
                <path  fill="rgba(191, 144, 0, .1)" stroke="rgba(75, 119, 199, 1)" strokeWidth="3" d={radarPathProductCurrentObject.d} />
                <path  fill="rgba(0, 176, 79, .1)" stroke="rgba(191, 144, 0, 1)" strokeWidth="3" d={radarPathProductUpcomingObject.d} />
                <path  fill="rgba(166, 166, 166, .1)" stroke="rgba(0, 176, 79, 1)" strokeWidth="3" d={radarPathProductNextObject.d} />
                <path  fill="rgba(75, 119, 199, .1)" stroke="rgba(166, 166, 166, 1)" strokeWidth="3" d={radarPathProductTargetObject.d}  />

                {radarPathProductCurrentObject.dotPointArray.map((element,index)=>{
                    return <circle onMouseOver={()=>this.dotMouseOver(element,"Curent(2017 Q3)",index)}  key={"circle"+index} cx={element.point.x} cy={element.point.y} r="3" stroke="white" strokeWidth="1" fill="none" />
                })}

                {radarPathProductUpcomingObject.dotPointArray.map((element,index)=>{
                    return <circle onMouseOver={()=>this.dotMouseOver(element,"2017 Q4",index)}  key={"circle"+index} cx={element.point.x} cy={element.point.y} r="3" stroke="white" strokeWidth="1" fill="none" />
                })}

                {radarPathProductNextObject.dotPointArray.map((element,index)=>{
                    return <circle onMouseOver={()=>this.dotMouseOver(element,"2017 Q4",index)}  key={"circle"+index} cx={element.point.x} cy={element.point.y} r="3" stroke="white" strokeWidth="1" fill="none" />
                })}

                {radarPathProductNextObject.dotPointArray.map((element,index)=>{
                    return <circle onMouseOver={()=>this.dotMouseOver(element,"2018 Q1",index)}  key={"circle"+index} cx={element.point.x} cy={element.point.y} r="3" stroke="white" strokeWidth="1" fill="none" />
                })}

                {radarPathProductTargetObject.dotPointArray.map((element,index)=>{
                    return <circle onMouseOver={()=>this.dotMouseOver(element,"Target",index)}  key={"circle"+index} cx={element.point.x} cy={element.point.y} r="3" stroke="white" strokeWidth="1" fill="none" />
                })}
            </svg>
            {this.state.showToolTip?<div style={{position:'absolute',
                left:this.state.dotElement.point.x,
                top:this.state.dotElement.point.y,
                background:"black",
                color:'white',
                padding:'10px',
                fontSize:'10px'
            }}

            >
                <div>{this.state.message}</div>
                <div>{this.state.quarterName+" "+this.state.dotElement.number}</div>
            </div>:null}

            {
                this.state.product_type.map((productName,index)=>{

                let point = this.polarToCartesian(centerX, centerY, this.radius,angleInc);
                if(angleInc==0){
                    point.x = point.x-70;
                    point.y = point.y-30;
                }
                else if(angleInc==60){
                    point.x = point.x+10;
                    point.y = point.y-10;
                }
                else if(angleInc==120){
                    point.x = point.x+5;
                    point.y = point.y-10;
                }

                else if(angleInc==180){
                    point.x = point.x-20;
                    point.y = point.y+10;
                }
                else if(angleInc==240){
                    point.x = point.x-55;
                    point.y = point.y-10;
                }
                else if(angleInc==300){
                    point.x = point.x-200;
                    point.y = point.y-10;
                }
                    angleInc+=inc;
                    return <div key={"div_"+index} style={{ position:'absolute',
                        left:point.x,
                        top:point.y,
                        color:'white',
                        fontSize:'12px'
                    }}>{productName}</div>
            })}

        </div>:null}
        </div>

    }
}

export default RadarChart;