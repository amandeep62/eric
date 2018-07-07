// Document Ready

function mainPageMounted(){

}
$(document).ready(function() {

    var div = $(".nav-right").height();
    var win = $(window).height();
    rightPanel = $("#rightDivPanel").add($(".right-side-heading").closest('.nav-right'));
    if (div > win) {
        $(".nav-right").height
        $('.nav-right').css({
            'height': (($(window).height()) - 50) + 'px',
            'overflow-y': 'scroll'
        });
    }
    //http_call_GetVersions();
    $('#toggleVersions').click(function() {
        releaseButtonOnClick();
    });

    var clickCount = 0, childWidth = 0;
    $('#version-menu').on('click','#rightScrollArrow',function(){
        if(childWidth < ($('#releaseNavBar').outerWidth() - $('#version-menu').outerWidth())) {
            clickCount = clickCount < $('#releaseNavBar').children().length ? ++clickCount : 1;
            childWidth += $('#releaseNavBar a:nth-child('+clickCount+')').outerWidth();
            $('#releaseNavBar').css("transform", "translateX(-" + childWidth + "px)");
        }
    }).on('click','#leftScrollArrow',function(){
        if(clickCount) {
            childWidth = childWidth - $('#releaseNavBar a:nth-child(' + clickCount + ')').outerWidth();
            $('#releaseNavBar').css("transform", "translateX(-" + childWidth + "px)");
            clickCount = clickCount > 0 ? --clickCount : 0;
        }
    });
    /*$('[data-toggle=offcanvas]').click(function() {
     $('.row-offcanvas').toggleClass('active');
     });*/

    // .modal-backdrop classes

    $(".modal-transparent").on('show.bs.modal', function () {
        setTimeout( function() {
            $(".modal-backdrop").addClass("modal-backdrop-transparent");
        }, 0);
    });
    $(".modal-transparent").on('hidden.bs.modal', function () {
        $(".modal-backdrop").addClass("modal-backdrop-transparent");
    });

    $(".modal-fullscreen").on('show.bs.modal', function () {
        setTimeout( function() {
            $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
        }, 0);
    });
    $(".modal-fullscreen").on('hidden.bs.modal', function () {
        $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
    });
    $('.filterCustomer').find('[type="checkbox"]').prop( "checked", true );

    $(window).resize(function(){
        adjustScrolling();
    }).resize();

});

// Global Variables

var GRAPH,rightPanel;
// var VERSIONS = [];
// var FILTERBUTTONS = [];
// var SELECTEDDIFF = [];
// var SELECTEDVERSIONBUTTONS = [];
// var SELECTEDVERSIONCUSTOMERS = [];
// var SELECTEDVERSIONID = -1;
// var SELECTEDVERSIONNAME = "";
// var SELECTEDVERSIONDATE = "";
// var DEFAULTCUSTOMERSTATUS = ["Targeted - 10%", "Qualified - 25%", "Engaged - 50%", "Committed - 70%", "Closed - 100%"];
// var CUSTOMERSSTATUS = DEFAULTCUSTOMERSTATUS.slice();
// var CUSTOMERSREGION = ["NA","EMEA","APAC","China"];
// var SELECTEDCUSTOMERBUTTONS = [];
// var SELECTEDCUSTOMERTEXTBOXES = [];
// var SELECTEDCUSTOMERID = -1;
// var HIGHLIGHTEDVERSIONINDEX = 0;
var CPFILTER = {region:["NA","EMEA","APAC","China"],month:[],state:['1','2','3','4','5','6','7']}

//TODO Please comment it and describe why we use columnName1 columnName2 etc. and what they do represent.
//TODO the choice of names need to be changed.
var MODEENUM = {
    RELEASE: {page:1,columnName1:"CP", columnName1Unit:"#",columnName2:"Revenue", columnName2Unit:"USD",head:{heading:'Content Providers', subHeading:'CPs vs Revenue/Release'}},
    FUNCTIONALITY: {page:2,columnName1:"Feature", columnName1Unit:"",columnName2:"Utilization", columnName2Unit:"%", head:{heading:'Top Features', subHeading:'Feature vs CP'}},
    DEVELOPMENT: {page:3,columnName1:null, columnName1Unit:null,columnName2:null, columnName2Unit:null,head:{heading:'Comments', subHeading:null}},
    KPI: {page:4,columnName1:"KPI", columnName1Unit:null,columnName2:null, columnName2Unit:null,head:{heading:'Comments', subHeading:null}},
    CPONBOARD:{page:5,columnName1:"CP", columnName1Unit:null,columnName2:"Traffic Data", columnName2Unit:"GB",head:{heading:'CP Onboarding', subHeading:null}},
    SPONBOARD:{page:6,columnName1:null, columnName1Unit:null,columnName2:null, columnName2Unit:null,head:{heading:'SP Onboarding', subHeading:null}},
    TRAFFIC:{page:7,columnName1:"TRAFFIC", columnName1Unit:null,columnName2:null, columnName2Unit:null,head:{heading:null, subHeading:null}},
    SEARCH_RESULTS: {page:8,columnName1:"SEARCH_RESULTS", columnName1Unit:null,columnName2:null, columnName2Unit:null,head:{heading:null, subHeading:null}}

};
var ISUNSUPPORTEDSELECTED = false;

//TODO cleanup
var MODE = MODEENUM.RELEASE.page;

var XTRANSLATE = 20;
var YTRANSLATE = 8;
var SCALE = 0.85;

var CURRENTGRAPH = 1;
var UNSUPPORTEDVERSIONID=100000;
var SELECTVERSIONSEDITING=[];

// Update UI


// Graph Callbacks

function filterGraphButtonSelectedCallback(d, activate) {
    visibilityForHeaderElements(true, false, false, "filter");
    processGraphButtonCallback(FILTERBUTTONS, d.buttonID, activate);
    http_call_GetSupportedCustomers(FILTERBUTTONS);
}

function editCustomerGraphButtonCallback(d, activate) {
    processGraphButtonCallback(SELECTEDCUSTOMERBUTTONS, d.buttonID, activate);
}

function editVersionGraphButtonCallback(d, activate) {
    processGraphButtonCallback(SELECTEDVERSIONBUTTONS, d.buttonID, activate);
}

function processGraphButtonCallback(array, buttonID, activate) {
    if (activate) {
        var index = array.indexOf(buttonID);
        if (index == -1) {
            array.push(buttonID);
        }
    } else {
        var index = array.indexOf(buttonID);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}



function loadUnsupportedFunctionality() {
      var URL = "/get_functionality?isUnsupported=true" + "&customerStatus=" +
        encodeURIComponent(CUSTOMERSSTATUS);
      getHttpRequest(URL, getFunctionalityCallBack);
}

function loadFunctionalityBySelectedVersion(selected_version) {
    var URL = "/get_functionality?version_id=" + selected_version + "&isUnsupported=false" + "&customerStatus=" +
        encodeURIComponent(CUSTOMERSSTATUS);
    getHttpRequest(URL, getFunctionalityCallBack);
}



function adjustScrolling(){
    $('.scrollableArea').css('top',($('#rightSideHeading').outerHeight()+$('#rightSideContent').outerHeight()+25)+'px');
}



function unsupportedButtonOnclick() {
    hightlightUnsupported();
    ISUNSUPPORTEDSELECTED = true;
    if(MODE==MODEENUM.RELEASE) {
        http_call_GetUnsupportedCustomersAndFeatures();
    } else if(MODE==MODEENUM.FUNCTIONALITY) {
        loadUnsupportedFunctionality();
    }


}

function hightlightUnsupported() {

    $('.selectedNav').removeClass('selectedNav');
    var parents = document.getElementById("releaseNavBar");
    $(parents).children().last().addClass('selectedNav');

    for (var i = 0; i < parents.childNodes.length; i++) {
        if ("unsupportedA" == parents.childNodes[i].id) {
            document.getElementById("version_highlight_" + i).style.visibility = 'visible';
            HIGHLIGHTEDVERSIONINDEX = i;

        } else {
            if (document.getElementById("version_highlight_" + i) != null) {
                document.getElementById("version_highlight_" + i).style.visibility = 'hidden';
                document.getElementById("date_" + i).innerHTML = '&nbsp;'
            }
        }
    }
}

var selectedCustomerButton = document.getElementById("customers-list");

function didSelectCustomerButton() {
    if (MODE==MODEENUM.RELEASE) {
        var customer = SELECTEDVERSIONCUSTOMERS[this.id];
        showCustomerDetail(customer);
        $('.customer-tr').removeClass('inSelection');
        $(this).addClass('inSelection');
    }
}


$('#signOut').click(function(){
    getHttpRequest("/signout", function() {
        window.location.replace("/login");
    });
});

// Customer Management

function editCurrentCustomer() {
    visibilityForHeaderElements(true, false, true, "customer");
    GRAPH = new Graph('chart', BUTTONSSTRUCTURE, ARROWSSTRUCTURE, editCustomerGraphButtonCallback,
        SELECTEDCUSTOMERBUTTONS, XTRANSLATE, YTRANSLATE, SCALE, SELECTEDCUSTOMERTEXTBOXES, true);

    GRAPH.translateY(CURRENTGRAPH == 1 ? 0 : -595);
}

function showCustomerDetail(customer) {
    updateCustomerDetailHeader(customer);
    http_call_GetCustomerFeatures(customer["customer_id"]);
}

function updateCustomerDetailHeader(customer) {
    visibilityForHeaderElements(true, true, false, "customer");
}


// Version Management

function editCurrentVersion() {
    visibilityForHeaderElements(true, false, true, "version");
    GRAPH = new Graph('chart', BUTTONSSTRUCTURE, ARROWSSTRUCTURE, editVersionGraphButtonCallback,
        SELECTEDVERSIONBUTTONS, XTRANSLATE, YTRANSLATE, SCALE, [], false);

    GRAPH.translateY(CURRENTGRAPH == 1 ? 0 : -595);
}

function updateVersionDetailHeader() {
    //visibilityForHeaderElements(false, true, false, "version");
}

function updateGraph(selectedFeatures, selectedTextboxes) {
    GRAPH = new Graph('chart', BUTTONSSTRUCTURE, ARROWSSTRUCTURE, filterGraphButtonSelectedCallback,
        selectedFeatures, XTRANSLATE, YTRANSLATE, SCALE, selectedTextboxes, false);
    for(i=0; i<=SELECTEDDIFF.length; i++){
        $("#d3-button-rect" + SELECTEDDIFF[i]).addClass('diff');
    }
    GRAPH.translateY(CURRENTGRAPH == 1 ? 0 : -595);
}


function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
}







// HTTP New Version

function http_call_CreateNewVersion(versionName, versionNumber, versionDate) {
    getHttpRequest("/create_version?version_name=" + encodeURIComponent(versionName) + "&version_number=" +
        encodeURIComponent(versionNumber) + "&version_date=" +
        encodeURIComponent(versionDate), http_callback_DidCreateNewVersion);
}

function http_callback_DidCreateNewVersion(newVersionResponse) {
    var newVersionNameInput = document.getElementById('new-version-name');
    newVersionNameInput.value = "";
    var newVersionNumberInput = document.getElementById('new-version-number');
    newVersionNumberInput.value = "";
    var newVersionDateInput = document.getElementById('new-version-date');
    newVersionDateInput.value = "";

    var version = JSON.parse(newVersionResponse);

    var modal = document.getElementById('new-version-modal');
    modal.style.display = "none";

    SELECTEDVERSIONBUTTONS = [];
    SELECTEDVERSIONCUSTOMERS = [];
    SELECTEDVERSIONID = version["version_id"];
    ISUNSUPPORTEDSELECTED = false;
    FILTERBUTTONS = SELECTEDVERSIONBUTTONS.slice();
    SELECTEDVERSIONNAME = version["name"];
    SELECTEDVERSIONDATE = version["date"];

    updateVersionDetailHeader();

    VERSIONS.push(version);
    updateVersionButtonsDropdownList(VERSIONS.indexOf(version));
    editCurrentVersion();
}

// HTTP Rename Version

function http_call_RenameCurrentVersion(versionName, versionDate) {
    getHttpRequest("/rename_version?version_name=" + encodeURIComponent(versionName) + "&version_id=" +
        encodeURIComponent(SELECTEDVERSIONID) + "&version_date=" +
        encodeURIComponent(versionDate), http_callback_DidRenameCurrentVersion);
}

function http_callback_DidRenameCurrentVersion(renamedVersionResponse) {
    var renameVersionNameInput = document.getElementById('rename-version-name');
    renameVersionNameInput.value = "";
    var renameVersionDateInput = document.getElementById('rename-version-date');
    renameVersionDateInput.value = "";
    var version = JSON.parse(renamedVersionResponse);

    var modal = document.getElementById('rename-version-modal');
    modal.style.display = "none";

    SELECTEDVERSIONNAME = version["name"];
    SELECTEDVERSIONDATE = version["date"];
    updateVersionDetailHeader();

    var index = -1;
    var count = 0;
    VERSIONS.forEach(function(element) {
        if (element["version_id"] == version["version_id"]) {
            index = count;
        }
        count++;
    });

    if (index !== -1) {
        VERSIONS[index] = version;
    }
    document.getElementById("version_" + version["version_id"]).text = SELECTEDVERSIONNAME;
}

// HTTP Remove Version

function http_call_RemoveSelectedVersion() {
    getHttpRequest("/remove_version?version_id=" + encodeURIComponent(SELECTEDVERSIONID),
        http_callback_DidRemoveSelectedVersion);
}

function http_callback_DidRemoveSelectedVersion(response) {
    var responseJSON = JSON.parse(response);
    if (responseJSON["success"] == true) {
        http_call_GetVersions();
    }
}

// HTTP Version supporting buttons

function http_call_GetVersionSupportingButtons(buttons_ids) {
    getHttpRequest("/version_supporting_buttons?selected_buttons_ids=" + encodeURIComponent(SELECTEDCUSTOMERBUTTONS),
        http_callback_DidGetVersionSupportingButtons);
}

function http_callback_DidGetVersionSupportingButtons(versionResponse) {
    if (versionResponse == "Unsupported Customer") {
        ISUNSUPPORTEDSELECTED = true;
        hightlightUnsupported();
    } else {
        var versionResponseJSON = JSON.parse(versionResponse);
        var firstVersion = versionResponseJSON["firstVersion"];
        var version = "";
        VERSIONS.forEach(function(element) {
            if (element.version_id  == firstVersion.version_id ) {
                version = element;
            }
        });
        hightlightVersion(version)
    }
}


// HTTP Features by Version

function http_call_GetVersionFeatures(version_id) {
    getHttpRequest("/version_features" + "?id=" + encodeURIComponent(version_id),
                   http_callback_DidGetVersionFeatures);
}
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function http_callback_DidGetVersionFeatures(versionFeaturesResponse) {
    var selectedButtons = JSON.parse(versionFeaturesResponse);
    SELECTEDDIFF = selectedButtons["selectedButtons"].diff(SELECTEDVERSIONBUTTONS);
    SELECTEDVERSIONBUTTONS = selectedButtons["selectedButtons"];
    FILTERBUTTONS = SELECTEDVERSIONBUTTONS.slice();
    updateGraph(SELECTEDVERSIONBUTTONS, []);

    http_call_GetSupportedCustomers(SELECTEDVERSIONBUTTONS);
}


// HTTP Customers

function http_call_GetSupportedCustomers(buttons_ids) {

    getHttpRequest("/customers?selected_buttons_ids=" + encodeURIComponent(buttons_ids) +
        "&customerStatus=" + encodeURIComponent(CUSTOMERSSTATUS), http_callback_DidGetSupportedCustomers);
}

function http_callback_DidGetSupportedCustomers(supportedCustomersResponse) {
    var supportedCustomers = JSON.parse(supportedCustomersResponse);
    updateCustomersList(supportedCustomers["supportedCustomers"]);



}

// HTTP Customers by Name

function http_call_GetSearchCustomers(customer_name) {
    getHttpRequest("/search_customer?customer_name=" + encodeURIComponent(customer_name),
                   http_callback_DidGetSearchCustomers);
}

function http_callback_DidGetSearchCustomers(supportedCustomersResponse) {
    var supportedCustomers = JSON.parse(supportedCustomersResponse);
    updateCustomersList(supportedCustomers["supportedCustomers"]);
}

// HTTP Unsupported Customers and Features

function http_call_GetUnsupportedCustomersAndFeatures() {
    getHttpRequest("/unsupported_customers_and_features?customerStatus=" + encodeURIComponent(CUSTOMERSSTATUS), http_callback_DidGetUnsupportedCustomersAndFeatures);
}

function http_callback_DidGetUnsupportedCustomersAndFeatures(unsupportedCustomersAndFeaturesResponse) {
    var unsupportedCustomersAndFatures = JSON.parse(unsupportedCustomersAndFeaturesResponse);
    updateCustomersList(unsupportedCustomersAndFatures["unsupportedCustomers"]);
    SELECTEDVERSIONBUTTONS = unsupportedCustomersAndFatures["unsupportedButtons"];
    FILTERBUTTONS = SELECTEDVERSIONBUTTONS.slice();
    updateGraph(SELECTEDVERSIONBUTTONS, []);
}

// HTTP Customers' Features

function http_call_GetCustomerFeatures(customer_id) {
    SELECTEDCUSTOMERBUTTONS = [];
    SELECTEDCUSTOMERID = customer_id;
    getHttpRequest("/customer_features?customer_id=" + encodeURIComponent(customer_id),
        http_callback_DidGetCustomerFeatures);
}

function http_callback_DidGetCustomerFeatures(customerFeaturesResponse) {
    var customerFeatures = JSON.parse(customerFeaturesResponse);
    SELECTEDCUSTOMERBUTTONS = customerFeatures["buttons_ids"];
    SELECTEDCUSTOMERTEXTBOXES = customerFeatures["textboxes"];
    FILTERBUTTONS = SELECTEDCUSTOMERBUTTONS.slice();
    updateGraph(SELECTEDCUSTOMERBUTTONS, SELECTEDCUSTOMERTEXTBOXES);
    http_call_GetVersionSupportingButtons(SELECTEDCUSTOMERBUTTONS);
}


// HTTP Edit Customer Features by Buttons

function http_call_EditCustomerFeaturesForButtons(buttons_ids, textboxes) {
    getHttpRequest("/edit_customer_features?selected_buttons_ids=" + encodeURIComponent(buttons_ids)
                   + "&customer_id=" +
        SELECTEDCUSTOMERID + "&input_values=" +
        JSON.stringify(textboxes), http_callback_DidEditCustomerFeaturesForButtons);
}

function http_callback_DidEditCustomerFeaturesForButtons(response) {
    var responseJSON = JSON.parse(response);
    if (responseJSON["success"] == true) {
        visibilityForHeaderElements(true, true, false, "customer");
      //HERE!!!
        SELECTEDCUSTOMERTEXTBOXES = responseJSON["textboxes"];
        SELECTEDCUSTOMERBUTTONS = responseJSON["buttons_ids"] == "" ? [] : responseJSON["buttons_ids"].split(',');
        FILTERBUTTONS = SELECTEDCUSTOMERBUTTONS.slice();
        updateGraph(SELECTEDCUSTOMERBUTTONS, SELECTEDCUSTOMERTEXTBOXES);
    }
}


// HTTP Edit Version Features by Buttons

function http_call_EditVersionFeaturesForButtons(buttons_ids) {
    getHttpRequest("/edit_version_features?selected_buttons_ids=" + encodeURIComponent(buttons_ids)
                   + "&version_id=" + SELECTEDVERSIONID, http_callback_DidEditVersionFeaturesForButtons);
}

function http_callback_DidEditVersionFeaturesForButtons(response) {
    var responseJSON = JSON.parse(response);
    if (responseJSON["success"] == true) {
        visibilityForHeaderElements(false, true, false, "version");
        SELECTEDVERSIONBUTTONS = responseJSON["buttons_ids"] == "" ? [] : responseJSON["buttons_ids"].split(',');
        FILTERBUTTONS = SELECTEDVERSIONBUTTONS.slice();
        updateGraph(SELECTEDVERSIONBUTTONS, []);
        http_call_GetSupportedCustomers(SELECTEDVERSIONBUTTONS);
    }
}

// New Version Modal



// Confirmation Modal

function showConfirmationModal(text, yesCallback) {
    document.getElementById('confirmation-text').innerText = text;

    var confirmationModal = document.getElementById('confirmation-modal');
    var confirmationButton = document.getElementById("confirmation-button");
    var cancelButton = document.getElementById("cancel-button");
    confirmationButton.onclick = function() {
        yesCallback();
        confirmationModal.style.display = "none";
    }
    cancelButton.onclick = function() {
        confirmationModal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == confirmationModal) {
            confirmationModal.style.display = "none";
        }
    }
    confirmationModal.style.display = "block";
}

function abbreviateNumber(number) {
    decPlaces = 2;
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "K", "M", "B", "T" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += " " + abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}

/// Switching the chart Button Events

function switchCharts() {
    var children = $($(this).parent()).children(),
        Yaxis = this === children[0] ? 0 : -595;
        CURRENTGRAPH = this === children[0] ? 1 : 2;
    if($(this).hasClass('btn-secondary')) {
        children.toggleClass('btn-primary btn-secondary');
    }
    GRAPH.translateAll(0,Yaxis,1)
}

$('#chartSwitch').on('click','.btn',switchCharts);

// Setting Filteres on Customer List

$('.filterCustomer').on('click','[type="checkbox"]',function () {
    this.checked ? CUSTOMERSSTATUS.push(this.defaultValue) : CUSTOMERSSTATUS.splice(CUSTOMERSSTATUS.indexOf(this.defaultValue),1);
    updateContentProviders()
});

function updateContentProviders() {

    if(MODE==MODEENUM.RELEASE) {
        if (ISUNSUPPORTEDSELECTED) {
            http_call_GetUnsupportedCustomersAndFeatures();
        } else {
            http_call_GetVersionFeatures(SELECTEDVERSIONID);
        }
    }
    else if(MODE==MODEENUM.FUNCTIONALITY) {
        if (ISUNSUPPORTEDSELECTED) {
            loadUnsupportedFunctionality();
        } else {
            loadFunctionalityBySelectedVersion(SELECTEDVERSIONID);
        }
    }

}


function selectAllStatus(e) {

        $('.filterCustomer').find('[type="checkbox"]').prop( "checked", $(e).prop( "checked"));

        if($(e).prop( "checked")){

            DEFAULTCUSTOMERSTATUS.map( function (data) {
                CUSTOMERSSTATUS.push(data);
            })
        }
        else{
            CUSTOMERSSTATUS.splice(0,CUSTOMERSSTATUS.length);
        }

        updateContentProviders();
}

var matrics = null;