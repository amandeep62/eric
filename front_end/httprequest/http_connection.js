
var livePath = "assuredplus.ericssonudn.com";
var urlPath = window.location.host.indexOf(livePath)>-1?"/developer":"" ;
var CASKPath =window.location.host.indexOf(livePath)>-1?"/developer":"" ;

    export function postHttpRequest(url, postData, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 0) {

            } else {
                if (this.readyState == 4 && this.status == 200) {

                    callback(request.responseText);
                }
            }
        };
        request.open("POST", urlPath + url, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(postData));
    }



export function putHttpRequest(url, postData, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {

        } else {
            if (this.readyState == 4) {

                callback(request.responseText,this.status);
            }
        }
    };
    request.open("PUT", urlPath + url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(postData));
}

export function deleteHttpRequest(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {

        } else {
            if (this.readyState == 4 && this.status == 200) {

                callback(request.responseText,this.status);
            }
        }
    };
    request.open("DELETE", urlPath + url, true);
    request.send();
}

export function postHttpRequestCASK(url, postData, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {

        } else {
            if (this.readyState == 4 && this.status == 200) {

                callback(request.responseText);
            }
        }
    };
    request.open("POST", urlPath + url, true);
    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    request.send(postData);
}

export function putHttpRequestCASK(url, postData, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {

        } else {
            if (this.readyState == 4 && this.status == 200) {

                callback(request.responseText);
            }
        }
    };
    request.open("PUT", urlPath + url, true);
    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    request.send(postData);
}

export function postHttpRequestUploadFile(url, file, callback,callBackProgress) {

    var xhr = new XMLHttpRequest();
    var fd = new FormData();

    xhr.open("POST", url, true);

    xhr.upload.onprogress = function (evt) {
        if (evt.lengthComputable)
        {  // evt.loaded the bytes the browser received
            // evt.total the total bytes set by the header
            // jQuery UI progress bar to show the progress on screen
            var percentComplete = (evt.loaded / evt.total) * 100;
            callBackProgress(file.name,percentComplete)
        }
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Every thing ok, file uploaded
            callback(xhr.responseText)
        }
    };
    fd.append("upload_file", file);
    xhr.send(fd);

}

function updateProgress(evt)
{
    if (evt.lengthComputable)
    {  // evt.loaded the bytes the browser received
        // evt.total the total bytes set by the header
        // jQuery UI progress bar to show the progress on screen
        var percentComplete = (evt.loaded / evt.total) * 100;
    }
}




export function deleteHttpRequestCASK(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {

        } else {
            if (this.readyState == 4 && this.status == 200) {

                callback(request.responseText);
            }
        }
    };
    request.open("DELETE", CASKPath + url, true);
    request.send();
}

export function getHttpRequestCASK(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 0) {

        } else {
            if (this.readyState == 4 && this.status == 200) {

                callback(request.responseText);
            }
        }
    };
    request.open("GET", CASKPath + url, true);
    request.send();
}


   export function getHttpRequest(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 0) {
                //window.location.replace("/login");
            } else {
                if (this.readyState == 4 && this.status == 200) {
                    callback(request.responseText,this.status);
                }
            }
        };
        request.open("GET", urlPath + url, true);
        request.send();
    }

    export function getHttpRequestWithStatus(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 0) {
                //window.location.replace("/login");
            } else {
                if (this.readyState == 4) {
                    callback(request.responseText,this.status);
                }
            }
        };
        request.open("GET", urlPath + url, true);
        request.send();
    }

    export function getParameterByName(name, url) {
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

