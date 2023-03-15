//#region Add Namespace
t4Sdk = t4Sdk || {};
t4Sdk.pxWidget = {};
t4Sdk.pxWidget.chart = {};
t4Sdk.pxWidget.table = {};
t4Sdk.pxWidget.latestValue = {};
t4Sdk.pxWidget.utility = {};
//#endregion Add Namespace

const T4SDK_PXWIDGET_READ_METADATA = "PxStat.Data.Cube_API.ReadMetadata";
const T4SDK_PXWIDGET_READ_PRE_METADATA = "PxStat.Data.Cube_API.ReadPreMetadata";
const T4SDK_PXWIDGET_READ_DATASET = "PxStat.Data.Cube_API.ReadDataset";
const T4SDK_PXWIDGET_URL_API_PRIVATE = "https://dev-ws.cso.ie/private/api.jsonrpc";
const T4SDK_PXWIDGET_URL_API_PUBLIC = "https://dev-ws.cso.ie/public/api.jsonrpc";



//#region create a chart with toggle variables

t4Sdk.pxWidget.chart.create = function (elementId, isLive, snippet, toggleType, toggleDimension, toggleVariables, defaultVariable) {
    toggleVariables = toggleVariables || null;
    defaultVariable = defaultVariable || null;

    //get isogram url
    var isogramScript = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gm.exec(snippet)[0];

    var isogramUrl = isogramScript.substring(
        isogramScript.indexOf('"') + 1,
        isogramScript.lastIndexOf('"')
    );

    //get config object from snippet
    var config = JSON.parse(snippet.substring(snippet.indexOf('{'), snippet.lastIndexOf('}') + 1));
    var matrix = config.matrix || config.metadata.api.query.data.params.matrix;

    //check config to see if it's from a live snippet code
    if (config.metadata.api.query.data.method == T4SDK_PXWIDGET_READ_METADATA) {
        isLive = true;
    }

    //update query depending on status
    if (isLive) {
        config.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
        config.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
        config.metadata.api.query.data.params.matrix = matrix;
        delete config.metadata.api.query.data.params.release

        $.each(config.data.datasets, function (index, value) {
            value.api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;
            value.api.query.data.params.extension.matrix = matrix;
            delete value.api.query.data.params.extension.release
        });
    };

    $("#" + elementId).empty();
    //set up html elements needed

    $("#" + elementId).append(
        $("<div>", {
            "class": "widget-toggle-panel"
        }).get(0).outerHTML
    );

    switch (toggleType) {
        case "dropdown":
            $("#" + elementId + " .widget-toggle-panel").append(
                $("<label>", {
                    "name": "toggle-select-label",
                    "for": "#" + elementId + "-toggle-select"
                }).get(0).outerHTML
            );
            $("#" + elementId + " .widget-toggle-panel").append(
                $("<select>", {
                    "name": "toggle-select",
                    "dimension": toggleDimension.trim(),
                    "id": elementId + "-toggle-select"
                }).get(0).outerHTML
            );

            $("#" + elementId).append(
                $("<div>", {
                    "id": elementId + "-chart-container",
                    "class": "pxwidget"
                }).get(0).outerHTML
            );
            break;
        case "buttons":
            $("#" + elementId + " .widget-toggle-panel").append(
                $("<div>", {
                    "class": "toggle-buttons",
                    "name": "toggle-button-wrapper",
                    "id": elementId + "-button-wrapper",
                    "style": "display: flex; justify-content: space-around; flex-wrap: wrap;"
                })
            );

            $("#" + elementId).append(
                $("<div>", {
                    "id": elementId + "-chart-container",
                    "class": "pxwidget"
                }).get(0).outerHTML
            );
            break;
        default:
            break;
    }

    //get variables to toggle on
    var toggleDimensionDetails = {};
    //get metadata for toggle
    if (!isLive) {
        //get release id from query
        var releaseId = config.metadata.api.query.data.params.release;
        toggleDimensionDetails = t4Sdk.pxWidget.utility.getToggleDimensionVariables(releaseId, false, toggleDimension.trim(), toggleVariables, defaultVariable)
    }
    else {
        toggleDimensionDetails = t4Sdk.pxWidget.utility.getToggleDimensionVariables(matrix.trim(), true, toggleDimension.trim(), toggleVariables, defaultVariable)
    }

    //failed to read metadata, abort from here
    if (!toggleDimensionDetails.variables.length) {
        $("#" + elementId).empty().text("Error retreiving data")
        console.log("Error getting metadata ")
        return;
    }

    //draw toggle variables
    $.each(toggleDimensionDetails.variables, function (index, value) {

        switch (toggleType) {
            case "dropdown":
                var option = $("<option>", {
                    "value": value.code,
                    "text": value.label
                });

                if (value.code == defaultVariable) {
                    option.attr('selected', 'selected')
                }
                $("#" + elementId + "-toggle-select").append(option);
                break;
            case "buttons":
                var button = $("<button>", {
                    "value": value.code,
                    "name": "toggle-button",
                    "text": value.label,
                    "dimension": toggleDimension,
                    "style": "margin: 0.25rem"
                });
                $("#" + elementId + "-button-wrapper").append(button);
                break;

            default:
                break;
        }

    });

    //set toggle dimension label
    switch (toggleType) {
        case "dropdown":
            $("#" + elementId).find("[name=toggle-select-label]").text(toggleDimensionDetails.label + ": ");
        case "buttons":
            //no label required
            break;
        default:
            break;
    }

    $.when(t4Sdk.pxWidget.utility.loadIsogram(isogramUrl)).then(function () {


        //listener events to draw chart
        switch (toggleType) {
            case "dropdown":
                $("#" + elementId + "-toggle-select").change(function () {
                    t4Sdk.pxWidget.chart.drawChart(elementId, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text());
                });
                break;
            case "buttons":
                $("#" + elementId + "-button-wrapper").find("[name=toggle-button]").click(function () {
                    $("#" + elementId + "-button-wrapper").find("[name=toggle-button]").removeClass("active");
                    $(this).addClass("active")
                    t4Sdk.pxWidget.chart.drawChart(elementId, config, $(this).attr("dimension"), $(this).val(), $(this).text());
                });
                break;

            default:
                break;
        }

        //load default chart
        switch (toggleType) {
            case "dropdown":
                $("#" + elementId + "-toggle-select").trigger("change");
                break;
            case "buttons":
                if (defaultVariable) {
                    $("#" + elementId + "-button-wrapper").find("[value='" + defaultVariable + "']").trigger("click");
                }
                else {
                    $("#" + elementId + "-button-wrapper").find("button").first().trigger("click")
                }
                break;

            default:
                break;
        }



    });
};

t4Sdk.pxWidget.chart.drawChart = function (elementId, config, toggleDimension, toggleVariable, varriableLabel) {
    var localConfig = $.extend(true, {}, config);
    //update config with toggle variable
    localConfig.options.title.display = true;
    localConfig.options.title.text = [varriableLabel];

    $.each(localConfig.data.datasets, function (index, value) {
        value.api.query.data.params.dimension[toggleDimension].category.index = [toggleVariable];
    });

    $("#" + elementId + "-chart-container").empty();

    pxWidget.draw.init(
        'chart',
        elementId + "-chart-container",
        localConfig
    )
};

//#endregion create a chart with toggle variables

//#region create a table with toggle variables
t4Sdk.pxWidget.table.create = function (elementId, isLive, snippet, toggleType, toggleDimension, toggleVariables, defaultVariable) {
};
//#endregion create a table with toggle variables


//#region retreive the latest value for a query from PxStat 
t4Sdk.pxWidget.latestValue.drawValue = function (query, valueElement, unitElement, timeLabelElement) {
    unitElement = unitElement || null;
    timeLabelElement = timeLabelElement || null;

    var latestTimePoint = t4Sdk.pxWidget.utility.getLatestTimeVariable(query.params.extension.matrix, true);
    var valueDetails = t4Sdk.pxWidget.latestValue.getValue(query, latestTimePoint);

    $(valueElement).text(valueDetails.value);

    if (unitElement) {
        $(unitElement).text(valueDetails.unit);
    };

    if (timeLabelElement) {
        $(timeLabelElement).text(latestTimePoint.label);
    };
};

t4Sdk.pxWidget.latestValue.getValue = function (query, latestTimePoint) {
    //check that the query is for one value
    query.params.dimension[latestTimePoint.dimension].category.index = [latestTimePoint.code];
    var valueDetails = {
        "value": null,
        "unit": null
    };

    var jsonStat = t4Sdk.pxWidget.utility.getPxStatData(query);
    //check that we only have one value back from the query
    if (jsonStat.value.length > 1) {
        console.log("Invalid query. Query should only return one value.")
    }
    else {
        var statisticCode = jsonStat.Dimension({ role: "metric" })[0].id[0];
        var statisticDetails = jsonStat.Dimension({ role: "metric" })[0].Category(statisticCode).unit;
        var statisticDecimal = statisticDetails.decimals;

        valueDetails.value = t4Sdk.pxWidget.utility.formatNumber(jsonStat.Data(0).value, statisticDecimal)
        valueDetails.unit = statisticDetails.label;
    }

    return valueDetails;
};
//#endregion

//#region utilities
/**
 * Format 
 * @param {*} number 
 * @param {*} precision 
 * @param {*} decimalSeparator 
 * @param {*} thousandSeparator 
 * @returns 
 */
t4Sdk.pxWidget.utility.formatNumber = function (number, precision, decimalSeparator, thousandSeparator) { //create global function  
    precision = precision !== undefined ? precision : undefined;
    decimalSeparator = decimalSeparator || ".";
    thousandSeparator = thousandSeparator || ",";

    if ("number" !== typeof number && "string" !== typeof number)
        return number;

    floatNumber = parseFloat(number);
    if (isNaN(floatNumber))
        //output any non number as html
        return "string" === typeof number ? number.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : number;

    if (precision !== undefined) {
        floatNumber = floatNumber.toFixed(precision);
    }
    else {
        floatNumber = floatNumber.toString();
    }

    var parts = floatNumber.split(".");
    var wholeNumber = parts[0].toString();
    var decimalNumber = parts[1] !== undefined ? parts[1].toString() : undefined;
    return (thousandSeparator ? wholeNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator) : wholeNumber) + (decimalNumber !== undefined ? decimalSeparator + decimalNumber : "");
};

t4Sdk.pxWidget.utility.getPxStatMetadata = function (matrixRelease, isLive, callback) {
    // var metadata = null;

    var paramsMatrix = {
        "jsonrpc": "2.0",
        "method": T4SDK_PXWIDGET_READ_METADATA,
        "params": {
            "matrix": matrixRelease.trim(),
            "language": "en",
            "format": {
                "type": "JSON-stat",
                "version": "2.0"
            }
        },
        "version": "2.0",
        "id": Math.floor(Math.random() * 999999999) + 1
    };

    var paramsRelease = {
        "jsonrpc": "2.0",
        "method": T4SDK_PXWIDGET_READ_PRE_METADATA,
        "params": {
            "release": matrixRelease.trim(),
            "language": "en",
            "format": {
                "type": "JSON-stat",
                "version": "2.0"
            }
        },
        "version": "2.0",
        "id": Math.floor(Math.random() * 999999999) + 1
    };

    $.ajax({
        "url": isLive ? T4SDK_PXWIDGET_URL_API_PUBLIC : T4SDK_PXWIDGET_URL_API_PRIVATE,
        "xhrFields": {
            "withCredentials": true
        },
        "async": false,
        "dataType": "json",
        "method": "POST",
        "jsonp": false,
        "data": isLive ? JSON.stringify(paramsMatrix) : JSON.stringify(paramsRelease),
        "success": function (response) {
            // metadata = JSONstat(response.result);
            callback(JSONstat(response.result))
        },
        "error": function (xhr) {
            console.log("Error getting metadata ")
        }
    });

    // return metadata;

};

t4Sdk.pxWidget.utility.getPxStatData = function (query) {
    var data = null;

    $.ajax({
        "url": "https://ws.cso.ie/public/api.jsonrpc",
        "xhrFields": {
            "withCredentials": true
        },
        "async": false,
        "dataType": "json",
        "method": "POST",
        "jsonp": false,
        "data": JSON.stringify(query),
        "success": function (response) {
            data = JSONstat(response.result);
        },
        "error": function (xhr) {
            console.log("Error getting data ")
        }
    });
    return data;
};

t4Sdk.pxWidget.utility.getLatestTimeVariable = function (matrixRelease, isLive) {
    var jsonStat = t4Sdk.pxWidget.utility.getPxStatMetadata(matrixRelease, isLive);

    var timeDimensionCode = null;
    $.each(jsonStat.Dimension(), function (index, value) {
        if (value.role == "time") {
            timeDimensionCode = jsonStat.id[index];
            return;
        }
    });

    var time = jsonStat.Dimension(timeDimensionCode).id;

    return {
        "dimension": timeDimensionCode,
        "code": time.slice(-1)[0],
        "label": jsonStat.Dimension(timeDimensionCode).Category(time.slice(-1)[0]).label
    };
};

t4Sdk.pxWidget.utility.getToggleDimensionVariables = function (matrixRelease, isLive, toggleDimension, toggleVariables) {
    toggleVariables = toggleVariables || null;

    var toggleVariablesDetails = {
        "label": "",
        "variables": []
    };

    t4Sdk.pxWidget.utility.getPxStatMetadata(matrixRelease, isLive, function (response) {
        debugger
        var jsonStat = response;
        var toggleVariablesArr = [];
        if (toggleVariables) {
            //put variables into array
            toggleVariablesArr = toggleVariables.split(',');
        }

        //trim all variables
        var toggleVariablesArrTrimmed = toggleVariablesArr.map(element => {
            return element.trim();
        });

        if (toggleVariablesArrTrimmed.length) {
            $.each(jsonStat.Dimension(toggleDimension).id, function (index, code) {
                if ($.inArray(code, toggleVariablesArrTrimmed) >= 0) {
                    toggleVariablesDetails.variables.push({
                        "code": code,
                        "label": jsonStat.Dimension(toggleDimension).Category(code).label
                    });
                }

            });
        }
        else {
            $.each(jsonStat.Dimension(toggleDimension).id, function (index, code) {
                toggleVariablesDetails.variables.push({
                    "code": code,
                    "label": jsonStat.Dimension(toggleDimension).Category(code).label
                });

            });
        }
        //populate toggle variable label
        toggleVariablesDetails.label = jsonStat.Dimension(toggleDimension).label;
    });





    return toggleVariablesDetails;

};

t4Sdk.pxWidget.utility.getToggleDimensionVariablesCallback

t4Sdk.pxWidget.utility.loadIsogram = function (url) {
    return $.ajax({
        "url": url,
        "dataType": "script",
        "async": false,
        "error": function (jqXHR, textStatus, errorThrown) {
            console.log("api-ajax-exception");
        }
    });
};
//#endregion utilities
