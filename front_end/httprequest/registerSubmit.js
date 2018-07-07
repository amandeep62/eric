
import { browserHistory } from 'react-router'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default (function showResults(values) {
    //await sleep(500); // simulate server latency
    values["phoneNumber"] = document.getElementById("phoneNumber").value;
    window.alert(`You submitted test:\n\n${JSON.stringify(values, null, 2)}`);
});
