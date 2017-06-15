
var getModuleClass = function(options){
    var settings = options ? options : {}; 

    var definition = function (request) {
       var controller = request.controller;
        var pageName = '';
        if (!controller) return pageName;

        if (typeof request.action === 'undefined' || request.action === null || request.action === '') {
            request.action = controller;
        }
        //NEW VERSION
        var parts = [];
        if (request.folder)
            parts.push(request.folder);
        if(request.module)
            parts.push(request.module);
        if(request.controller)
            parts.push(request.controller);
        if(request.action)
            parts.push(request.action);

        var moduleId = settings.pageFolderBase + '/' + request.requestUrl;//+ parts.join('/');
        if (moduleId !== null)
            request.moduleId = moduleId.toLowerCase();
        else
            request.moduleId = null;

        return request.moduleId;
    };
    return definition;
};

export default getModuleClass;