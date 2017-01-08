
var getModuleClass = function(options){
    var settings = options ? options : {}; 

    var definition = function (request) {
        var controller = request.controller;
        var pageName = '';
        if (!controller) return pageName;

        var view = request.action;
        if (typeof view === 'undefined' || view === null || view === '') {
            view = controller;
        }

        var moduleId = settings.pageFolderBase + '/' + controller + '/' + view;
        if (moduleId !== null)
            return moduleId.toLowerCase();
        return null;
    };
    return definition;
};

export default getModuleClass;