var postHttpRequest = function (url, postData, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {
            window.location.replace("/login");
        } else {
            if (this.readyState == 4) {
                var path = request.getResponseHeader("Location")
                if (path == "/login") {
                    window.location.replace("/login");
                } else {
                    callback(request.responseText,this.status);
                }
            }
        }
    };
    request.open("POST", window.location.origin + url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(postData));
}

var getHttpRequest = function (url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {
            window.location.replace("/login");
        } else {
            if (this.readyState == 4 && this.status == 200) {
                var path = request.getResponseHeader("Location")
                if (path == "/login") {
                    window.location.replace("/login");
                } else {
                    callback(request.responseText);
                }
            }
        }
    };
    request.open("GET", window.location.origin + url, true);
    request.send();
    return request;
}


var getHttpRequestPDF = function (url, callback) {
    var request = new XMLHttpRequest();
    request.responseType ="arraybuffer";
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {
            window.location.replace("/login");
        } else {
            if (this.readyState == 4 && this.status == 200) {
                var path = request.getResponseHeader("Location")
                if (path == "/login") {
                    window.location.replace("/login");
                } else {
                    callback(request.response);
                }
            }
        }
    };
    request.open("GET", window.location.origin + url, true);
    request.send();
    return request;
}