(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('hasher'), require('crossroads')) :
    typeof define === 'function' && define.amd ? define(['hasher', 'crossroads'], factory) :
    (global.chirimoya = factory(global.hasher,global.crossroads));
}(this, function (hasher,crossroads) { 'use strict';

    hasher = 'default' in hasher ? hasher['default'] : hasher;
    crossroads = 'default' in crossroads ? crossroads['default'] : crossroads;

    function extend (obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    };

    var defaultOpt= {
            homePage: 'home',
            loginPage: 'login',
            pageFolderBase: 'pages',
            appTarget: '#app'
        };

    var settings = null;
    var currentView = null;
    var getModule = function (controller) {
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

    var processRequest = function (requestUrl, params, isFirst) {
        var request = {
            requestUrl: requestUrl
        };

        params.route._paramsIds.forEach(function (paramId, index) {
            request[paramId] = params.params[index];
        }, this);

        load(request);
    };

    var hasAccess = function (View) {
        var page = getPageComponent(View);
        return page.access === 'all' || this.isLoggedIn();
    };

    var getPageComponent = function (view) {
        if (!view.isPage) {
            for (var c in view.components) {
                return getPageComponent(view.components[c]);
            }
        }
        return view;
    }


    var timesLoaded = 0;
    var load = function (request) {
        var moduleId = getModule(request.controller);
        //console.log('loading up module', moduleId);
        require([moduleId], function (View) {
            
            if (!View) {
                console.warn('problem loading module', request)
                hasher.setHash(settings.homePage);
                return;
            }

            if(!hasAccess(View)){
                console.warn('not auth to module', request)
                hasher.setHash(settings.homePage);
                return;
            }

            timesLoaded++;
            //console.log('loaded module', moduleId);
            var renderView = function () {
                //console.log('view loaded', moduleId);
                timesLoaded = 0;
                currentView = new View({ el: settings.appTarget, data: { request: request } });
            };
            if (currentView) {
                //console.log('tearing down', currentView);
                currentView.teardown().then(renderView);
            } else {
                renderView();
            }
        }, function (err) {
            if (timesLoaded < 3) {
                console.warn('page not found', err);
                hasher.setHash(settings.homePage);
            }
            else
                console.log('times tried to load', timesLoaded);
            //TODO: Log Error
        });

    };

    var chirimoya =  {

        init: function (routesParam, options) {
            if (typeof routesParam === 'undefined' || routesParam === null) routesParam = ['{controller}'];
            if (!Array.isArray(routesParam)) routesParam = [routesParam];

            settings = extend(defaultOpt, options);

            if(typeof this.isLoggedIn !=='function')
                this.isLoggedIn = function(){ return true; };

            routesParam.forEach(function (val) {
                crossroads.addRoute(val);
            }, this);

            crossroads.routed.add(processRequest);

            //setup hasher
            function parseHash(newHash, oldHash) {
                // if (!chirimoya.isLoggedIn() && newHash.indexOf(settings.loginPage) < 0)
                //     hasher.setHash(settings.loginPage);
                // else
                crossroads.parse(newHash);
            }
            hasher.prependHash = '!';
            hasher.initialized.add(parseHash); //parse initial hash
            hasher.changed.add(parseHash); //parse hash changes
            hasher.init();

        },
        set: function (route) {
            hasher.setHash(route);
        },
        isLoggedIn: null

    };

    return chirimoya;

}));