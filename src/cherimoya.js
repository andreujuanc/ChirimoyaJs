define(['crossroads', 'hasher'], function(crossroads, hasher) {
    console.log('loading routes');
    window.isLoggedIn = false;
    
    var defaultOpt= {
        homePage: 'home',
        loginPage: 'login',
        pageFolderBase: 'pages',
        appTarget: '#app'
    };
    
    var settings = null;
    var currentView = null;
    var routes = {};

    var extend = function(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    var getModule = function(controller) {
        var pageName = '';
        if (!controller) return pageName;
        var pageConfig = { moduleId: controller };// pagesConfig.find(controller);
        if (typeof pageConfig !== 'undefined' && pageConfig !== null) {
            pageName = pageConfig.moduleId;
        }
        else {
            pageName = controller;
        }

        var moduleId = settings.pageFolderBase + '/' + pageName + '/' + pageName;
        if (moduleId !== null)
            return moduleId.toLowerCase();
        return null;
    };

    var processRequest = function(requestUrl, params, isFirst){ 
        var request = {
            requestUrl: requestUrl
         };
        
        params.route._paramsIds.forEach(function(paramId, index) {
            request[paramId] = params.params[index];
        }, this);

        load(request);
    };

    var timesLoaded = 0;
    var load = function(request) {
        var moduleId = getModule(request.controller);
        console.log('loading up module', moduleId);
        require([moduleId], function(View) {
            if (!View) {
                console.log('problem loading module')
                hasher.setHash(loginPage.homePage)
                return;
            }
            timesLoaded++;
            console.log('loaded module', moduleId);
            var renderView = function() {
                console.log('view loaded', moduleId);
                timesLoaded = 0;
                currentView = new View({ el: settings.appTarget, data: { request: request } });
            };
            if (currentView) {
                console.log('tearing down', currentView);
                currentView.teardown().then(renderView);
            } else {
                renderView();
            }
        }, function(err) {
            if (timesLoaded < 3) {
                console.log('page not found', err);
                hasher.setHash(settings.homePage);
            }
            else
                console.log('times tried to load', timesLoaded);
            //TODO: Log Error
        });

    };

    //think about using finch http://rickallen.me/finchjs/#docs/parameters
    routes.init = function(routesParam, options){

        var settings = extend(defaultOpt, options);

        routesParam.forEach(function(route) {
            crossroads.addRoute(route);    
        }, this);
        
        crossroads.routed.add(processRequest);

        //setup hasher
        function parseHash(newHash, oldHash) {
            if (!window.isLoggedIn && newHash.indexOf(settings.loginPage) < 0)
                hasher.setHash(settings.loginPage);
            else 
                crossroads.parse(newHash);
        }
        hasher.prependHash = '!';
        hasher.initialized.add(parseHash); //parse initial hash
        hasher.changed.add(parseHash); //parse hash changes
        hasher.init();
    };

    routes.set = function(route){
        hasher.setHash(route);
    };
    
    return routes;
});