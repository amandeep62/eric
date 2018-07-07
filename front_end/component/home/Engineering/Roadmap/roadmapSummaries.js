
var color = ['#9F9F9F', '#218D88'];

import  {Component} from 'react'


class RoadmapSummaries extends Component {

    constructor(props, context) {
        super(props, context);


    }

    render() {
        var today = new Date();
        var date = parseInt(today.getUTCDate());
        var month = parseInt(today.getMonth() + 1);
        var year = today.getFullYear();
        let groupVersionArray = this.props.groupVersionArray;

        return (<div className="summaries">
            {
                groupVersionArray.map(function (element, index) {
                    var count = 0;
                    //This is used to make circle grey if version release date is greater than current month
                    if (parseInt(element.date.getFullYear()) > year) {
                        count = 0;
                    } else if (parseInt(element.date.getMonth() + 1) < month) {
                        count = 1;
                    } else if (parseInt(element.date.getMonth() + 1) == month && parseInt(element.date.getUTCDate()) < date) {
                        count = 1;
                    }
                    var fontSize;
                    var fontLength = element.version.length;
                    if(fontLength > 8) {
                        fontSize = 12;
                    } else {
                        fontSize = 14;
                    }
                    var styles = {"background": color[count], "fontSize": fontSize};
                    var version = element.version;


                    return (<div className="content-col" key={"div_1" + index}>
                        <div className="circular-div" style={styles}>
                            { version }
                            </div>
                        <div className="roadmap-desc">
                            <ul id="content-list">
                                {
                                    element.description.map(function (data, index) {
                                        {
                                            return (
                                                <li key={"li" + index} style={{"color": color[count]}}><span
                                                    style={{"color": 'white'}}>{data}</span></li>
                                            );
                                        }
                                    })
                                }
                            </ul>
                        </div>
                    </div>)
                })
            }
        </div>)
    }

}

export default RoadmapSummaries;