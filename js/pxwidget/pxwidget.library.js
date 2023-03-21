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
/**
 * 
 * @param {*} type 
 * @param {*} elementId 
 * @param {*} isLive 
 * @param {*} snippet 
 * @param {*} toggleType 
 * @param {*} toggleDimension 
 * @param {*} toggleVariables 
 * @param {*} defaultVariable 
 * @returns 
 */
t4Sdk.pxWidget.create = function (type, elementId, isLive, snippet, toggleType, toggleDimension, toggleVariables, defaultVariable) {
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

    //check config to see if it's from a live snippet code
    //if matrix at root level is null, it must be live
    if (config.matrix === null) {
        isLive = true;
    }

    var matrixRelease = null;

    if (!isLive) {
        switch (type) {
            case "chart":
                matrixRelease = config.metadata.api.query.data.params.release;
                break;
            case "table":
                matrixRelease = config.data.api.query.data.params.extension.release;
                break;
            case "map":
                matrixRelease = config.data.datasets[0].api.query.data.params.extension.release;
                break;
            default:
                break;
        }
    }
    else {
        switch (type) {
            case "chart":
                matrixRelease = config.metadata.api.query.data.params.matrix;
                break;
            case "table":
                matrixRelease = config.data.api.query.data.params.extension.matrix;
                break;
            case "map":
                matrixRelease = config.data.datasets[0].api.query.data.params.extension.matrix;
                break;
            default:
                break;
        }
    }

    $("#" + elementId).empty();
    //set up html elements needed

    $("#" + elementId).append(
        $("<div>", {
            "class": "widget-toggle-panel",
            "html": $("<div>", {
                "class": "widget-toggle-input-group"
            }).get(0).outerHTML
        }).get(0).outerHTML
    );

    switch (toggleType) {
        case "dropdown":
            $("#" + elementId + " .widget-toggle-input-group").append(
                $("<div>", {
                    "class": "widget-toggle-input-group-prepend",
                    "html": $("<label>", {
                        "name": "toggle-select-label",
                        "class": "widget-toggle-input-group-text",
                        "for": "#" + elementId + "-toggle-select"
                    }).get(0).outerHTML
                }).get(0).outerHTML
            );
            $("#" + elementId + " .widget-toggle-input-group").append(
                $("<select>", {
                    "name": "toggle-select",
                    "class": "widget-toggle-select widget-toggle-custom-select",
                    "dimension": toggleDimension.trim(),
                    "id": elementId + "-toggle-select"
                }).get(0).outerHTML
            );
        case "buttons":
            $("#" + elementId + " .widget-toggle-input-group").append(
                $("<div>", {
                    "class": "toggle-buttons",
                    "name": "toggle-button-wrapper",
                    "id": elementId + "-button-wrapper",
                    "style": "display: flex; justify-content: space-around; flex-wrap: wrap;"
                })
            );
            break;
        default:
            break;
    };

    $("#" + elementId).append(
        $("<div>", {
            "name": "table-title-wrapper",
            "class": "widget-toggle-table-title",
            "html": $("<span>", {
                "text": "",
                "name": "table-title"
            }).get(0).outerHTML,
            "style": "display:none; text-align: center;"
        }).get(0).outerHTML
    );

    $("#" + elementId).append(
        $("<div>", {
            "id": elementId + "-widget-container",
            "class": "pxwidget"
        }).get(0).outerHTML
    );

    var toggleIsTime = false;

    t4Sdk.pxWidget.utility.getPxStatMetadata(matrixRelease, isLive, function (response) {
        if (response.Dimension(toggleDimension).role == "time") {
            toggleIsTime = true;
        }
    });

    //get variables to toggle on
    var toggleDimensionDetails = t4Sdk.pxWidget.utility.getToggleDimensionVariables(matrixRelease, isLive, toggleDimension.trim(), toggleVariables, defaultVariable)

    //failed to read metadata, abort from here
    if (!toggleDimensionDetails.variables.length) {
        $("#" + elementId).empty().text("Error retreiving data")
        console.log("Error getting metadata ")
        return;
    }
    if (toggleIsTime) {
        toggleDimensionDetails.variables.reverse();
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
                    switch (type) {
                        case "chart":
                            t4Sdk.pxWidget.chart.drawChart(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text(), toggleIsTime);
                            break;

                        case "table":
                            t4Sdk.pxWidget.chart.drawTable(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text(), toggleIsTime);
                            break;
                        case "map":
                            t4Sdk.pxWidget.chart.drawMap(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text(), toggleIsTime);
                            break;

                        default:
                            break;
                    }
                });
                break;
            case "buttons":
                $("#" + elementId + "-button-wrapper").find("[name=toggle-button]").click(function () {
                    $("#" + elementId + "-button-wrapper").find("[name=toggle-button]").removeClass("active");
                    $(this).addClass("active");

                    switch (type) {
                        case "chart":
                            t4Sdk.pxWidget.chart.drawChart(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).text(), toggleIsTime);
                            break;
                        case "table":
                            t4Sdk.pxWidget.chart.drawTable(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).text(), toggleIsTime);
                            break;
                        case "map":
                            t4Sdk.pxWidget.chart.drawMap(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).text(), toggleIsTime);
                            break;
                        default:
                            break;
                    }
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

t4Sdk.pxWidget.chart.drawChart = function (elementId, isLive, config, toggleDimension, toggleVariable, varriableLabel, toggleIsTime) {
    var localConfig = $.extend(true, {}, config);

    var matrix = localConfig.matrix || localConfig.metadata.api.query.data.params.matrix;
    //update query depending on status
    if (isLive) {
        localConfig.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
        localConfig.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
        localConfig.metadata.api.query.data.params.matrix = matrix;
        delete localConfig.metadata.api.query.data.params.release

        $.each(localConfig.data.datasets, function (index, value) {
            value.api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;
            value.api.query.data.params.extension.matrix = matrix;
            delete value.api.query.data.params.extension.release
        });
    };

    //update config with toggle variable
    localConfig.options.title.display = true;
    localConfig.options.title.text = [varriableLabel];

    $.each(localConfig.data.datasets, function (index, value) {
        value.api.query.data.params.dimension[toggleDimension].category.index = [toggleVariable];
        if (toggleIsTime) {
            //can't have fluid time on time toggle
            value.fluidTime = [];
        }

    });

    $("#" + elementId + "-widget-container").empty();

    if (toggleIsTime) {
        //can't have fluid time on time toggle
        localConfig.metadata.fluidTime = [];
    }

    pxWidget.draw.init(
        'chart',
        elementId + "-widget-container",
        localConfig
    )
};

t4Sdk.pxWidget.chart.drawTable = function (elementId, isLive, config, toggleDimension, toggleVariable, varriableLabel, toggleIsTime) {
    $("#" + elementId).find("[name=table-title]").text(varriableLabel);
    $("#" + elementId).find("[name=table-title-wrapper]").show();
    var localConfig = $.extend(true, {}, config);
    var matrix = localConfig.matrix || localConfig.data.api.query.data.params.extension.matrix;

    if (isLive) {
        localConfig.data.api.query.data.url = T4SDK_PXWIDGET_URL_API_PUBLIC;

        localConfig.data.api.query.data.params.extension.matrix = matrix;
        localConfig.data.api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;

        localConfig.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
        localConfig.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
        localConfig.metadata.api.query.data.params.matrix = matrix;
        delete localConfig.metadata.api.query.data.params.release;
    }
    //update query for selected variable
    localConfig.data.api.query.data.params.dimension[toggleDimension] = {};
    localConfig.data.api.query.data.params.dimension[toggleDimension].category = {};
    localConfig.data.api.query.data.params.dimension[toggleDimension].category.index = [toggleVariable];

    //update query to make sure all dimensions are now included in id array
    localConfig.data.api.query.data.params.id = [];

    $.each(localConfig.data.api.query.data.params.dimension, function (key, value) {
        localConfig.data.api.query.data.params.id.push(key);
    });


    //remove toggle dimension from hidden columns if there
    /* var toggleDimensionHiddenPosition = localConfig.hideColumns.indexOf(toggleDimension);
    if (toggleDimensionHiddenPosition != -1) {
        localConfig.hideColumns.splice(toggleDimensionHiddenPosition, 1)
    } */

    if (toggleIsTime) {
        //can't have fluid time on time toggle
        localConfig.fluidTime = [];
    }

    $("#" + elementId + "-widget-container").empty();

    pxWidget.draw.init(
        'table',
        elementId + "-widget-container",
        localConfig
    )
};

t4Sdk.pxWidget.chart.drawMap = function (elementId, isLive, config, toggleDimension, toggleVariable, varriableLabel, toggleIsTime) {

    //get the height of the container div for a smooth rendering
    var height = $("#" + elementId + "-widget-container").height();
    debugger
    var localConfig = $.extend(true, {}, config);
    var matrix = localConfig.matrix || localConfig.data.datasets[0].api.query.data.params.extension.matrix;
    localConfig.tooltipTitle = varriableLabel;

    if (isLive) {
        localConfig.data.datasets[0].api.query.data.url = T4SDK_PXWIDGET_URL_API_PUBLIC;

        localConfig.data.datasets[0].api.query.data.params.extension.matrix = matrix;
        localConfig.data.datasets[0].api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;

        localConfig.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
        localConfig.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
        localConfig.metadata.api.query.data.params.matrix = matrix;
        delete localConfig.metadata.api.query.data.params.release;
    }
    //update query for selected variable
    localConfig.data.datasets[0].api.query.data.params.dimension[toggleDimension] = {};
    localConfig.data.datasets[0].api.query.data.params.dimension[toggleDimension].category = {};
    localConfig.data.datasets[0].api.query.data.params.dimension[toggleDimension].category.index = [toggleVariable];

    //update query to make sure all dimensions are now included in id array
    localConfig.data.datasets[0].api.query.data.params.id = [];

    $.each(localConfig.data.datasets[0].api.query.data.params.dimension, function (key, value) {
        localConfig.data.datasets[0].api.query.data.params.id.push(key);
    });

    if (toggleIsTime) {
        //can't have fluid time on time toggle
        localConfig.data.datasets[0].fluidTime = [];
    }

    $("#" + elementId + "-widget-container").empty();

    pxWidget.draw.init(
        'map',
        elementId + "-widget-container",
        localConfig
    )
};

//#endregion create a chart with toggle variables

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

//#region utility
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
    var paramsMatrix = {
        "jsonrpc": "2.0",
        "method": T4SDK_PXWIDGET_READ_METADATA,
        "params": {
            "matrix": matrixRelease,
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
            "release": matrixRelease,
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
            callback(JSONstat(response.result))
        },
        "error": function (xhr) {
            console.log("Error getting metadata ")
        }
    });

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
    var latestTimeVariable = {
        "dimension": null,
        "code": null,
        "label": null
    };

    t4Sdk.pxWidget.utility.getPxStatMetadata(matrixRelease, isLive, function (response) {
        var jsonStat = response;

        var timeDimensionCode = null;
        $.each(jsonStat.Dimension(), function (index, value) {
            if (value.role == "time") {
                timeDimensionCode = jsonStat.id[index];
                return;
            }
        });

        var time = jsonStat.Dimension(timeDimensionCode).id;

        latestTimeVariable.dimension = timeDimensionCode;
        latestTimeVariable.code = time.slice(-1)[0];
        latestTimeVariable.label = jsonStat.Dimension(timeDimensionCode).Category(time.slice(-1)[0]).label;

    });
    return latestTimeVariable;
};

t4Sdk.pxWidget.utility.getToggleDimensionVariables = function (matrixRelease, isLive, toggleDimension, toggleVariables) {
    toggleVariables = toggleVariables || null;

    var toggleVariablesDetails = {
        "label": "",
        "variables": []
    };

    t4Sdk.pxWidget.utility.getPxStatMetadata(matrixRelease, isLive, function (response) {
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
