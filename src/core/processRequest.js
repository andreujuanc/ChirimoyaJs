import loadClass from './loadModule';

var processRequestClass = function (options) {
    var settings = options ? options : {};
    var load = loadClass(settings)

    var definition = function (requestUrl, params, isFirst) {
        var request = {
            requestUrl: requestUrl
        };
        
        var getFolder = function (a, b) {
            var i = 0, j = 0;
            while (j < b.length) {
                if (a[j] != b[j])
                    break
                j++;
            }
            if (j === 0) return null;
            var result = a.substring(0, j);
            if (result.endsWith('/'))
                result = result.substr(0, result.length - 1);
            return result;
        }

        var folder = getFolder(params.params.input, params.route._pattern);
        if (folder !== null)
            request.folder = folder;

        params.route._paramsIds.forEach(function (paramId, index) {
            request[paramId] = params.params[index];
        }, this);

        load(request);
    };
    
    return definition;
};

export default processRequestClass;