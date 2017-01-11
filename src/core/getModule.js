
var getModuleClass = function(options){
    var settings = options ? options : {}; 

    var definition = function (request) {
       var controller = request.controller;
        var pageName = '';
        if (!controller) return pageName;

        if (typeof request.action === 'undefined' || request.action === null || request.action === '') {
            request.action = controller;
        }

        var parts = [];
        if(request.module)
            parts.push(request.module);
        if(request.controller)
            parts.push(request.controller);
        if(request.action)
            parts.push(request.action);

        var moduleId = settings.pageFolderBase + '/' + parts.join('/');
        if (moduleId !== null)
            return moduleId.toLowerCase();
        return null;
    };
    return definition;
};

export default getModuleClass;