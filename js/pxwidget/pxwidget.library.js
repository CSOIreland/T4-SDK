//#region Add Namespace
t4Sdk = t4Sdk || {};
t4Sdk.pxWidget = {};
//#endregion Add Namespace

t4Sdk.pxWidget.create = function (snippet, matrix, isLive) {

    var config = JSON.parse(snippet.substring(snippet.indexOf('{'), snippet.lastIndexOf('}') + 1));
    var element = snippet.split(",")[1].trim().toString().replace(/'/g, "");
    var isogram = snippet.split(/"/)[1];



    //load specific widget library
    jQuery.ajax({
        "url": isogram,
        "dataType": "script",
        "async": false,
        "error": function (jqXHR, textStatus, errorThrown) {
            console.log("api-ajax-exception");
        },
        "success": function () {
            debugger
            if (isLive) {
                config.metadata.api.query.data.method = "PxStat.Data.Cube_API.ReadMetadata";
                config.metadata.api.query.url = "https://ws.cso.ie/public/api.jsonrpc";
                config.metadata.api.query.data.params.matrix = matrix;

                $.each(config.data.datasets, function (index, value) {
                    value.api.query.data.method = "PxStat.Data.Cube_API.ReadDataset";
                    value.api.query.data.params.matrix = matrix;
                });
            };



            pxWidget.draw.init(
                'chart',
                element,
                config
            )
        }
    });
};

t4Sdk.pxWidget.getMetadata = function (matrix, isLive) {
    $.ajax({
        url: "ajax.aspx",
        type: "get", //send it through get method
        data: {
            ajaxid: 4,
            UserID: UserID,
            EmailAddress: EmailAddress
        },
        success: function (response) {
            //Do Something
        },
        error: function (xhr) {
            //Do Something to handle error
        }
    });
};
