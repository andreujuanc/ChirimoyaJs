import loadClass from './loadModule';

var processRequestClass = function (options) {
    var settings = options ? options : {};
    var load = loadClass(settings)

    var definition = function (requestUrl, params, isFirst) {
        var request = {
            requestUrl: requestUrl
        };

        params.route._paramsIds.forEach(function (paramId, index) {
            request[paramId] = params.params[index];
        }, this);

        load(request);
    };
    
    return definition;
};

export default processRequestClass;