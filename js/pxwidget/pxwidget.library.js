//#region Add Namespace
t4Sdk = t4Sdk || {};
t4Sdk.pxWidget = {};
t4Sdk.pxWidget.chart = {};
//#endregion Add Namespace

t4Sdk.pxWidget.chart.create = function (elementId, isLive, snippet, matrix, toggleType, toggleDimension, toggleVariables, defaultVariable) {
    toggleVariables = toggleVariables || null;
    defaultVariable = defaultVariable || null;
    $("#" + elementId).empty();
    //set up html elements needed
    switch (toggleType) {
        case "dropdown":
            $("#" + elementId).append(
                $("<label>", {
                    "name": "toggle-select-label",
                    "for": "#" + elementId + "-toggle-select"
                }).get(0).outerHTML
            );
            $("#" + elementId).append(
                $("<select>", {
                    "name": "toggle-select",
                    "dimension": toggleDimension,
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
            //buttons under chart
            $("#" + elementId).append(
                $("<div>", {
                    "id": elementId + "-chart-container",
                    "class": "pxwidget"
                }).get(0).outerHTML
            );

            $("#" + elementId).append(
                $("<div>", {
                    "class": "toggle-buttons",
                    "name": "toggle-button-wrapper",
                    "id": elementId + "-button-wrapper",
                    "style": "display: flex; justify-content: space-around"
                })
            );
            break;

        default:
            break;
    }

    var config = JSON.parse(snippet.substring(snippet.indexOf('{'), snippet.lastIndexOf('}') + 1));
    // var element = snippet.split(",")[1].trim().toString().replace(/'/g, "");
    var isogram = snippet.split(/"/)[1];

    var toggleDimensionVariables = [];
    if (toggleDimension) {
        //get metadata for toggle
        if (!isLive) {
            //get release id from query
            var releaseId = config.metadata.api.query.data.params.release
            toggleDimensionVariables = t4Sdk.pxWidget.chart.getToggleDimensionVariables(elementId, false, releaseId, toggleDimension, toggleVariables, defaultVariable)
        }
        else {
            toggleDimensionVariables = t4Sdk.pxWidget.chart.getToggleDimensionVariables(elementId, true, matrix, toggleDimension, toggleVariables, defaultVariable)
        }
    }

    $.each(toggleDimensionVariables, function (index, value) {

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
                    "dimension": toggleDimension
                });
                $("#" + elementId + "-button-wrapper").append(button);
                break;

            default:
                break;
        }

    });


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




    //load specific widget library
    jQuery.ajax({
        "url": isogram,
        "dataType": "script",
        "async": false,
        "error": function (jqXHR, textStatus, errorThrown) {
            console.log("api-ajax-exception");
        },
        "success": function () {

            if (isLive) {
                config.metadata.api.query.data.method = "PxStat.Data.Cube_API.ReadMetadata";
                config.metadata.api.query.url = "https://dev-ws.cso.ie/public/api.jsonrpc";
                config.metadata.api.query.data.params.matrix = matrix;
                delete config.metadata.api.query.data.params.release

                $.each(config.data.datasets, function (index, value) {
                    value.api.query.data.method = "PxStat.Data.Cube_API.ReadDataset";
                    value.api.query.data.params.extension.matrix = matrix;
                    delete value.api.query.data.params.extension.release
                });
            };

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
    });
};

t4Sdk.pxWidget.chart.getToggleDimensionVariables = function (elementId, isLive, matrixRelease, toggleDimension, toggleVariables) {
    toggleVariables = toggleVariables || null;

    var dimension = [];

    var paramsMatrix = {
        "jsonrpc": "2.0",
        "method": "PxStat.Data.Cube_API.ReadMetadata",
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
        "method": "PxStat.Data.Cube_API.ReadPreMetadata",
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
        "url": isLive ? "https://dev-ws.cso.ie/public/api.jsonrpc" : "https://dev-ws.cso.ie/private/api.jsonrpc",
        "xhrFields": {
            "withCredentials": true
        },
        "async": false,
        "dataType": "json",
        "method": "POST",
        "jsonp": false,
        "data": isLive ? JSON.stringify(paramsMatrix) : JSON.stringify(paramsRelease),
        "success": function (response) {
            var jsonStat = JSONstat(response.result);

            var toggleVariablesArr = [];
            if (toggleVariables) {
                //put variables into array
                toggleVariablesArr = toggleVariables.split(',');
            }

            if (toggleVariablesArr.length) {
                $.each(jsonStat.Dimension(toggleDimension).id, function (index, code) {
                    if ($.inArray(code, toggleVariablesArr) >= 0) {
                        dimension.push({
                            "code": code,
                            "label": jsonStat.Dimension(toggleDimension).Category(code).label
                        });
                    }

                });
            }
            else {
                $.each(jsonStat.Dimension(toggleDimension).id, function (index, code) {
                    dimension.push({
                        "code": code,
                        "label": jsonStat.Dimension(toggleDimension).Category(code).label
                    });

                });
            }

            //populate toggle variable label
            $("#" + elementId).find("[name=toggle-select-label]").text(jsonStat.Dimension(toggleDimension).label + ": ");

        },
        "error": function (xhr) {

            //Do Something to handle error
        }
    });
    return dimension;
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
