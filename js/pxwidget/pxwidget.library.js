//#region Add Namespace
t4Sdk = t4Sdk || {};
t4Sdk.pxWidget = {};
t4Sdk.pxWidget.chart = {};
t4Sdk.pxWidget.table = {};
t4Sdk.pxWidget.map = {};
t4Sdk.pxWidget.latestValue = {};
t4Sdk.pxWidget.utility = {};
t4Sdk.dataConnector = {};
//#endregion Add Namespace

//#region create a chart with toggle variables
/**
 * Entry method to initialise the widget
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
t4Sdk.pxWidget.create = function (type, elementId, isLive, snippet, toggleType, toggleDimension, toggleVariables, defaultVariable, select2Options) {
    select2Options = select2Options || {};
    toggleVariables = toggleVariables || null;
    defaultVariable = defaultVariable || null;

    var config = null;
    var isogramUrl = null;

    if (typeof snippet === 'object') {
        config = snippet;
    }
    else {
        //get isogram url
        var isogramScript = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gm.exec(snippet)[0];

        isogramUrl = isogramScript.substring(
            isogramScript.indexOf('"') + 1,
            isogramScript.lastIndexOf('"')
        );

        //get config object from snippet
        config = JSON.parse(snippet.substring(snippet.indexOf('{'), snippet.lastIndexOf('}') + 1));
    }

    //check that config doesn't contain a response, must be query
    var queryIsInvalid = false;
    switch (type) {
        case "chart":
            if (!$.isEmptyObject(config.metadata.api.response)) {
                queryIsInvalid = true;
            }
            break;
        case "table":
            if (!$.isEmptyObject(config.data.api.response)) {
                queryIsInvalid = true;
            }
            break;
        case "map":
            if (!$.isEmptyObject(config.data.datasets[0].api.response)) {
                queryIsInvalid = true;
            }
            break;
        default:
            break;
    }

    if (queryIsInvalid) {
        //invalid query, load isogram now to access error function
        t4Sdk.pxWidget.utility.drawError(isogramUrl, elementId, "Toggle widget must contain a query, not a response.");

        //abort drawing of toggle widget
        return;
    }

    //check if type is table and that toggle dimension is not the same as pivot dimension
    if (type == "table") {
        if (config.pivot == toggleDimension) {
            t4Sdk.pxWidget.utility.drawError(isogramUrl, elementId, "Pivot dimesnion and toggle dimensoin cannot be the same");

            //abort drawing of toggle widget
            return;
        }
    }

    //check config to see if it's from a live snippet code
    //if matrix at root level is null, it must be live
    if (config.matrix === null) {
        isLive = true;
    }

    var matrixRelease = null;
    var language = null;

    if (!isLive) {
        switch (type) {
            case "chart":
                matrixRelease = config.metadata.api.query.data.params.release;
                language = config.metadata.api.query.data.params.language;
                break;
            case "table":
                matrixRelease = config.data.api.query.data.params.extension.release;
                language = config.data.api.query.data.params.extension.language.code;
                break;
            case "map":
                matrixRelease = config.data.datasets[0].api.query.data.params.extension.release;
                language = config.data.datasets[0].api.query.data.params.extension.language.code;
                break;
            default:
                break;
        }
    }
    else {
        switch (type) {
            case "chart":
                matrixRelease = config.metadata.api.query.data.params.matrix || config.matrix;
                language = config.metadata.api.query.data.params.language;
                break;
            case "table":
                matrixRelease = config.data.api.query.data.params.extension.matrix || config.matrix;
                language = config.data.api.query.data.params.extension.language.code;
                break;
            case "map":
                matrixRelease = config.data.datasets[0].api.query.data.params.extension.matrix || config.matrix;
                language = config.data.datasets[0].api.query.data.params.extension.language.code;
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
            $("#" + elementId + " .widget-toggle-input-group [name=toggle-select]").select2(select2Options);
        case "buttons":
            $("#" + elementId + " .widget-toggle-input-group").append(
                $("<div>", {
                    "class": "toggle-buttons",
                    "name": "toggle-button-wrapper",
                    "id": elementId + "-button-wrapper",
                    "style": "display: flex; justify-content: space-around; flex-wrap: wrap; width: 100%"
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
            "id": "pxwidget" + elementId,
            "class": "pxwidget"
        }).get(0).outerHTML
    );


    //get metadata to build toggles
    t4Sdk.pxWidget.utility.getJsonStatMetadata(matrixRelease, isLive, language).done(function (response) {
        var toggleIsTime = false;
        var data = JSONstat(response.result);
        if (data.length) {
            var toggleVariablesDetails = {
                "label": "",
                "variables": []
            };
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
                $.each(data.Dimension(toggleDimension).id, function (index, code) {
                    if ($.inArray(code, toggleVariablesArrTrimmed) >= 0) {
                        toggleVariablesDetails.variables.push({
                            "code": code,
                            "label": data.Dimension(toggleDimension).Category(code).label
                        });
                    }

                });
            }
            else {
                $.each(data.Dimension(toggleDimension).id, function (index, code) {
                    toggleVariablesDetails.variables.push({
                        "code": code,
                        "label": data.Dimension(toggleDimension).Category(code).label
                    });

                });
            }
            //get variables to toggle on
            toggleVariablesDetails.label = data.Dimension(toggleDimension).label;

            //failed to read metadata, abort from here
            if (!toggleVariablesDetails.variables.length) {
                $("#" + elementId).empty().text("Error retreiving data")
                console.log("Error getting metadata ")
                return;
            }
            if (toggleIsTime) {
                toggleVariablesDetails.variables.reverse();
            }
            //draw toggle variables
            $.each(toggleVariablesDetails.variables, function (index, value) {

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
                    $("#" + elementId).find("[name=toggle-select-label]").text(toggleVariablesDetails.label + ": ");
                case "buttons":
                    //no label required
                    break;
                default:
                    break;
            }
            if (isogramUrl) {
                $.when(t4Sdk.pxWidget.utility.loadIsogram(isogramUrl)).then(addListener);
            }
            else {
                addListener()
            }

            function addListener() {
                //listener events to draw chart
                switch (toggleType) {
                    case "dropdown":
                        $("#" + elementId + "-toggle-select").change(function () {
                            switch (type) {
                                case "chart":
                                    t4Sdk.pxWidget.chart.draw(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text(), toggleIsTime);
                                    break;

                                case "table":
                                    t4Sdk.pxWidget.table.draw(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text(), toggleIsTime);
                                    break;
                                case "map":
                                    t4Sdk.pxWidget.map.draw(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).find("option:selected").text(), toggleIsTime);
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
                                    t4Sdk.pxWidget.chart.draw(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).text(), toggleIsTime);
                                    break;
                                case "table":
                                    t4Sdk.pxWidget.table.draw(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).text(), toggleIsTime);
                                    break;
                                case "map":
                                    t4Sdk.pxWidget.map.draw(elementId, isLive, config, $(this).attr("dimension"), $(this).val(), $(this).text(), toggleIsTime);
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
            }


        } else {
            console.log("Error getting metadata")
        }

        if (data.Dimension(toggleDimension).role == "time") {
            toggleIsTime = true;
        };
    }).fail(function (error) {
        console.log(error.statusText + ": t4Sdk.pxWidget.create, error getting metadata")
    });
};

/** 
 * Call the pxWidget function that draws the chart
 * @param {*} elementId 
 * @param {*} isLive 
 * @param {*} config 
 * @param {*} toggleDimension 
 * @param {*} toggleVariable 
 * @param {*} varriableLabel 
 * @param {*} toggleIsTime 
 */
t4Sdk.pxWidget.chart.draw = function (elementId, isLive, config, toggleDimension, toggleVariable, varriableLabel, toggleIsTime) {
    var localConfig = $.extend(true, {}, config);

    var matrix = localConfig.matrix || localConfig.metadata.api.query.data.params.matrix;
    //update query depending on status
    if (isLive) {
        if (!$.isEmptyObject(localConfig.metadata.api.query)) {
            localConfig.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
            localConfig.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
            localConfig.metadata.api.query.data.params.matrix = matrix;
            delete localConfig.metadata.api.query.data.params.release
        }


        $.each(localConfig.data.datasets, function (index, value) {
            value.api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;
            value.api.query.data.params.extension.matrix = matrix;
            value.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
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

    if (toggleIsTime) {
        //can't have fluid time on time toggle
        localConfig.metadata.fluidTime = [];
    }

    pxWidget.draw.init(
        'chart',
        "pxwidget" + elementId,
        localConfig
    )
};

/**
 * Call the pxWidget function that draws the table 
 * @param {*} elementId 
 * @param {*} isLive 
 * @param {*} config 
 * @param {*} toggleDimension 
 * @param {*} toggleVariable 
 * @param {*} varriableLabel 
 * @param {*} toggleIsTime 
 */
t4Sdk.pxWidget.table.draw = function (elementId, isLive, config, toggleDimension, toggleVariable, varriableLabel, toggleIsTime) {
    $("#" + elementId).find("[name=table-title]").text(varriableLabel);
    $("#" + elementId).find("[name=table-title-wrapper]").show();
    var localConfig = $.extend(true, {}, config);
    var matrix = localConfig.matrix || localConfig.data.api.query.data.params.extension.matrix;

    if (isLive) {
        localConfig.data.api.query.data.url = T4SDK_PXWIDGET_URL_API_PUBLIC;

        localConfig.data.api.query.data.params.extension.matrix = matrix;
        localConfig.data.api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;
        localConfig.data.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;

        if (!$.isEmptyObject(localConfig.metadata.api.query)) {
            localConfig.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
            localConfig.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
            localConfig.metadata.api.query.data.params.matrix = matrix;
            delete localConfig.metadata.api.query.data.params.release;
        }


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

    if (toggleIsTime) {
        //can't have fluid time on time toggle
        localConfig.fluidTime = [];
    }

    pxWidget.draw.init(
        'table',
        "pxwidget" + elementId,
        localConfig
    )
};

/**
 * Call the pxWidget function that draws the map 
 * @param {*} elementId 
 * @param {*} isLive 
 * @param {*} config 
 * @param {*} toggleDimension 
 * @param {*} toggleVariable 
 * @param {*} varriableLabel 
 * @param {*} toggleIsTime 
 */
t4Sdk.pxWidget.map.draw = function (elementId, isLive, config, toggleDimension, toggleVariable, varriableLabel, toggleIsTime) {
    var localConfig = $.extend(true, {}, config);
    var matrix = localConfig.matrix || localConfig.data.datasets[0].api.query.data.params.extension.matrix;
    localConfig.tooltipTitle = varriableLabel;

    if (isLive) {
        localConfig.data.datasets[0].api.query.data.url = T4SDK_PXWIDGET_URL_API_PUBLIC;

        localConfig.data.datasets[0].api.query.data.params.extension.matrix = matrix;
        localConfig.data.datasets[0].api.query.data.method = T4SDK_PXWIDGET_READ_DATASET;
        localConfig.data.datasets[0].api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;

        if (!$.isEmptyObject(localConfig.metadata.api.query)) {
            localConfig.metadata.api.query.data.method = T4SDK_PXWIDGET_READ_METADATA;
            localConfig.metadata.api.query.url = T4SDK_PXWIDGET_URL_API_PUBLIC;
            localConfig.metadata.api.query.data.params.matrix = matrix;
            delete localConfig.metadata.api.query.data.params.release;
        }
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

    pxWidget.draw.init(
        'map',
        "pxwidget" + elementId,
        localConfig
    )
};

t4Sdk.pxWidget.getSingleFluidTimeLabel = function (snippet, element, type) {
    //get isogram url
    var isogramScript = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gm.exec(snippet)[0];

    isogramUrl = isogramScript.substring(
        isogramScript.indexOf('"') + 1,
        isogramScript.lastIndexOf('"')
    );

    //get config object from snippet
    var config = JSON.parse(snippet.substring(snippet.indexOf('{'), snippet.lastIndexOf('}') + 1));
    var fluidTime = [];
    switch (type) {
        case "table":
            fluidTime = config.fluidTime;
            break;
        case "map":
            fluidTime = config.data.datasets[0].fluidTime;
            break;
        default:
            break;
    }
    debugger
    if (fluidTime.length == 1) {

        var matrix = null;

        switch (type) {
            case "table":
                matrix = config.data.api.query.data.params.extension.matrix;
                break;
            case "map":
                matrix = config.data.datasets[0].api.query.data.params.extension.matrix;
                break;
            default:
                break;
        }

        debugger
        //get time from metadata
        t4Sdk.pxWidget.utility.getJsonStatMetadata(matrix, true, config.data.api.query.data.params.extension.language.code).done(function (response) {
            var data = JSONstat(response.result);
            if (data.length) {
                var timeDimensionCode = null;
                $.each(data.Dimension(), function (index, value) {
                    if (value.role == "time") {
                        timeDimensionCode = data.id[index];
                        return;
                    }
                });

                var timeLabel = data.Dimension(timeDimensionCode).Category().reverse()[fluidTime[0]].label
                $(element).text(", " + timeLabel);
                debugger
            }
            else {
                console.log("Error getting metadata")
            }
        }).fail(function (error) {
            console.log(error.statusText + ": t4Sdk.pxWidget.latestValue.draw, error getting metadata")
        });
    }

};

//#endregion create a chart with toggle variables

//#region retreive the latest value for a query from PxStat 
/**
 * Draws a value from PxStat
 * @param {*} query 
 * @param {*} valueElement 
 * @param {*} unitElement 
 * @param {*} timeLabelElement 
 */
t4Sdk.pxWidget.latestValue.draw = function (query, valueElement, unitElement, timeLabelElement) {
    unitElement = unitElement || null;
    timeLabelElement = timeLabelElement || null;

    //get latest time variable first from metadata
    t4Sdk.pxWidget.utility.getJsonStatMetadata(query.params.extension.matrix, true).done(function (response) {
        var data = JSONstat(response.result);
        if (data.length) {
            var latestTimeVariable = {
                "dimension": null,
                "code": null,
                "label": null
            };
            var timeDimensionCode = null;
            $.each(data.Dimension(), function (index, value) {
                if (value.role == "time") {
                    timeDimensionCode = data.id[index];
                    return;
                }
            });

            var time = data.Dimension(timeDimensionCode).id;

            latestTimeVariable.dimension = timeDimensionCode;
            latestTimeVariable.code = time.slice(-1)[0];
            latestTimeVariable.label = data.Dimension(timeDimensionCode).Category(time.slice(-1)[0]).label;


            //check that the query is for one value
            query.params.dimension[latestTimeVariable.dimension].category.index = [latestTimeVariable.code];

            t4Sdk.pxWidget.utility.getJsonStatData(query).done(function (responseValue) {

                var valueDetails = {
                    "value": null,
                    "unit": null
                };
                var data = JSONstat(responseValue.result);
                if (data.length) {
                    if (data.value.length == 1) {
                        var statisticCode = data.Dimension({ role: "metric" })[0].id[0];
                        var statisticDetails = data.Dimension({ role: "metric" })[0].Category(statisticCode).unit;
                        var statisticDecimal = statisticDetails.decimals;

                        valueDetails.value = t4Sdk.pxWidget.utility.formatNumber(data.Data(0).value, statisticDecimal)
                        valueDetails.unit = statisticDetails.label;
                    }
                    else {
                        console.log("Invalid query. Query should only return one value.");
                    }

                    $(valueElement).text(valueDetails.value);

                    if (unitElement) {
                        $(unitElement).text(valueDetails.unit);
                    };

                    if (timeLabelElement) {
                        $(timeLabelElement).text(latestTimeVariable.label);
                    };
                }
                else {
                    console.log("Error getting data")
                }
            }).fail(function (error) {
                console.log(error.statusText + ": t4Sdk.pxWidget.latestValue.draw, error getting data")
            });
        }
        else {
            console.log("Error getting metadata")
        }
    }).fail(function (error) {
        console.log(error.statusText + ": t4Sdk.pxWidget.latestValue.draw, error getting metadata")
    });

};

//#endregion

//#region data connector
/**
 * Process single value from data connector
 * @param {*} response 
 * @returns 
 */
t4Sdk.dataConnector.parseSingleValue = function (response) {
    var returnValue = {
        "time": null,
        "unit": null,
        "value": null,
        "updated": null
    };
    jsonStat = JSONstat(response);
    if (!jsonStat.length) {
        console.log("Invalid JSON-stat response");
        return returnValue;
    }
    //must only contain single value
    if (jsonStat.value.length != 1) {
        console.log("Invalid data connector single value query");
        return returnValue;
    }
    var statisticCode = jsonStat.Dimension({ role: "metric" })[0].id[0];
    returnValue.unit = jsonStat.Dimension({ role: "metric" })[0].Category(statisticCode).unit.label;
    var timeCode = jsonStat.Dimension({ role: "time" })[0].id[0];
    returnValue.time = jsonStat.Dimension(jsonStat.role.time[0]).Category(timeCode).label;
    var statisticDecimal = jsonStat.Dimension({ role: "metric" })[0].Category(statisticCode).unit.decimals;
    returnValue.value = t4Sdk.pxWidget.utility.formatNumber(jsonStat.value[0], statisticDecimal);
    returnValue.updated = jsonStat.updated
    return returnValue;
};

//#endregion
//#region utility
/**
 * Format a number
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

/**
 * Get metadata from a table in PxStat
 * @param {*} matrixRelease 
 * @param {*} isLive 
 * @param {*} callback 
 */
t4Sdk.pxWidget.utility.getJsonStatMetadata = function (matrixRelease, isLive, language) {
    var paramsMatrix = {
        "jsonrpc": "2.0",
        "method": T4SDK_PXWIDGET_READ_METADATA,
        "params": {
            "matrix": matrixRelease,
            "language": language || "en",
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
            "language": language || "en",
            "format": {
                "type": "JSON-stat",
                "version": "2.0"
            }
        },
        "version": "2.0",
        "id": Math.floor(Math.random() * 999999999) + 1
    };

    return $.ajax({
        // "url": isLive ? T4SDK_PXWIDGET_URL_API_PUBLIC : T4SDK_PXWIDGET_URL_API_PRIVATE,
        "url": isLive ? T4SDK_PXWIDGET_URL_API_PUBLIC : T4SDK_PXWIDGET_URL_API_PRIVATE,
        "xhrFields": {
            "withCredentials": true
        },
        "dataType": "json",
        "method": "POST",
        "jsonp": false,
        "data": isLive ? JSON.stringify(paramsMatrix) : JSON.stringify(paramsRelease)
    });
};

/**
 * Get data from PxStat
 * @param {*} query 
 * @returns 
 */
t4Sdk.pxWidget.utility.getJsonStatData = function (query) {
    return $.ajax({
        "url": T4SDK_PXWIDGET_URL_API_PUBLIC,
        "xhrFields": {
            "withCredentials": true
        },
        "dataType": "json",
        "method": "POST",
        "jsonp": false,
        "data": JSON.stringify(query)
    });
};

/**
 * Het the latest time variable code from a table in PxStat
 * @param {*} matrixRelease 
 * @param {*} isLive 
 * @returns 
 */

/**
 * Load isogram
 * @param {} url 
 * @returns 
 */
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
/**
 * Check that snippet code used in a non toggle content type doesn't contain a private end point
 * @param {*} type 
 * @param {*} snippet 
 * @returns 
 */
t4Sdk.pxWidget.utility.isSnippetPrivate = function (type, snippet) {
    //get config object from snippet
    var config = JSON.parse(snippet.substring(snippet.indexOf('{'), snippet.lastIndexOf('}') + 1));
    var result = false;
    //if snippet contains a release code instead of a matrix in it's query, it must be from a private query
    switch (type) {
        case "chart":
            if (!$.isEmptyObject(config.metadata.api.query) && config.metadata.api.query.data.params.release) {
                result = true
            }
            break;
        case "table":
            if (!$.isEmptyObject(config.data.api.query) && config.data.api.query.data.params.extension.release) {
                result = true
            }
            break;
        case "map":
            if (!$.isEmptyObject(config.data.datasets[0].api.query) && config.data.datasets[0].api.query.data.params.extension.release) {
                result = true
            }
            break;
        default:
            break;
    }
    return result
};

/**
 * Draw custom widget error with custom error logged in console 
 * @param {*} isogramUrl 
 * @param {*} elementId 
 * @param {*} consoleMessage 
 */
t4Sdk.pxWidget.utility.drawError = function (isogramUrl, elementId, consoleMessage) {
    if (isogramUrl) {
        $.when(t4Sdk.pxWidget.utility.loadIsogram(isogramUrl)).then(function () {
            pxWidget.draw.error(elementId, 'Invalid widget');
            console.log(consoleMessage);
        });
    }
    else {
        pxWidget.draw.error(elementId, 'Invalid widget');
        console.log(consoleMessage);
    }

};
//#endregion utilities