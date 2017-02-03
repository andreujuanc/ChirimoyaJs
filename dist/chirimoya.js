(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('hasher'), require('crossroads')) :
    typeof define === 'function' && define.amd ? define(['hasher', 'crossroads'], factory) :
    (global.chirimoya = factory(global.hasher,global.crossroads));
}(this, (function (hasher,crossroads) { 'use strict';

hasher = 'default' in hasher ? hasher['default'] : hasher;
crossroads = 'default' in crossroads ? crossroads['default'] : crossroads;

var extend = function (obj1, obj2) {
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

var historyData = [];
var history = {
    add: function (newHash, oldHash) {

        historyData.push({
            location: document.location,
            hash: newHash,
            previousHash: oldHash
        });
    },
    back: function () {

        var prev = historyData[historyData.length - 2];
        if (prev && prev.location.host === document.location.host) {
            historyData.splice(historyData.length - 2);
            window.history.back();
            return false;
        }

        return true;
    }
};

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
            request.moduleId = moduleId.toLowerCase();
        else
            request.moduleId = null;

        return request.moduleId;
    };
    return definition;
};

var getPageComponent = function (view) {
    if (!view.isPage) {
        for (var c in view.components) {
            var r = view.components[c];
            if (r.isPage) {
                return r;
            }
        }
    }
    return view;
};

var _processAccess = function(page, access, isLoggedIn){
    if(page.access === 'all') return true;
    if(access === false) return false;
    if(isLoggedIn === false) return false;     
    return access;
};

var processAccess = function(page, access){
    var loggedInResult = window.chirimoya.isLoggedIn();
    if(loggedInResult.then && typeof loggedInResult.then ==='function'){
        return loggedInResult.then(function(isLoggedIn){
            return _processAccess(page, access, isLoggedIn);
        });
    } 
    else{
        return _processAccess(page, access, loggedInResult);
    }   
};

var hasAccess = function (View, moduleId) {
    return new Promise(function (resolve, reject) {
        try {
            var page = getPageComponent(View);
            // if(page.access === 'all'){
            //     return resolve(true);
            // }
            if (chirimoya.onBeforeHasAccess && typeof chirimoya.onBeforeHasAccess === 'function') {
                var result = chirimoya.onBeforeHasAccess(View, moduleId);
                if(result.then && typeof result.then ==='function'){
                    return result.then(function(accessResult){
                        return resolve(processAccess(page, accessResult));
                    });
                } 
                else{
                    return resolve(processAccess(page, result));
                }                   
            }
            
            return resolve(processAccess(page, false));
            
        }
        catch (ex) {
            return reject(ex);
        }
    });
};

var loadClass = function (options) {
    var settings = options ? options : {};
    var currentView = null;
    var getModule = getModuleClass(settings);


    var timesLoaded = 0;
    var definition = function (request) {
        var moduleId = getModule(request);
        //console.log('loading up module', moduleId);
        require([moduleId], function (View) {
            timesLoaded++;
            if (!View) {
                if (timesLoaded < 3) hasher.setHash(settings.homePage);
                else {
                    timesLoaded = 0;
                    console.warn('problem loading module', request);
                }
                return;
            }
            var renderView = function (access) {
                if (!access) {
                    if (timesLoaded < 3)
                        hasher.setHash(settings.loginPage);
                    else {
                        timesLoaded = 0;
                        console.warn('not access to module', request);
                    }
                    return;
                }
                timesLoaded = 0;
                currentView = new View({ el: settings.appTarget, data: { request: request } });
            };

            var afterAccessDo = function () {
                return new Promise(function (resolve, reject) {
                    hasAccess(View, moduleId)
                        .then(function (access) {
                            resolve(access);
                        }, function (access) {
                            resolve(false);
                        })
                        .catch(function (access) {
                            resolve(false);
                        });
                });

            };

            var processModule = function (callback) {
                if (currentView && currentView.teardown && typeof currentView.teardown === 'function') {
                    //window.currentView = currentView;
                    var element = null;
                    if (currentView.target.firstElementChild instanceof HTMLElement)
                        element = currentView.target.firstElementChild;
                    else (currentView.el.firstElementChild instanceof HTMLElement);
                        element = currentView.el.firstElementChild;
                    var promises = [];
                    if (element !== null) {
                        promises.push(currentView.transition('zoom', element));
                    }
                    promises.push(currentView.teardown().then(function () { currentView = null; }));
                    promises.push(afterAccessDo());
                    Promise.all(promises)
                        .then(function (values) {
                            callback(values[promises.length - 1]);
                        });

                } else {
                    afterAccessDo().then(callback);
                }
            };

            processModule(renderView);

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

    return definition;

};

var processRequestClass = function (options) {
    var settings = options ? options : {};
    var load = loadClass(settings);

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

var settings = null;
var isInit = false;
var chirimoya = {

    init: function (routesParam, options) {
        if(isInit) return;
        isInit = true;
        if (typeof routesParam === 'undefined' || routesParam === null) routesParam = ['{controller}'];
        if (!Array.isArray(routesParam)) routesParam = [routesParam];
        
        window.chirimoya = chirimoya;

        settings = extend(defaultOpt, options);

        if (typeof this.isLoggedIn !== 'function')
            this.isLoggedIn = function () { return true; };

        routesParam.forEach(function (val) {
            crossroads.addRoute(val);
        }, this);
        
        crossroads.routed.add(processRequestClass(settings));

        //setup hasher
        function parseHash(newHash, oldHash) {
            // if (!chirimoya.isLoggedIn() && newHash.indexOf(settings.loginPage) < 0)
            //     hasher.setHash(settings.loginPage);
            // else
            history.add(newHash, oldHash);
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
    history: history,
    back: function(){
        return chirimoya.history.back();
    },
    isLoggedIn: null

};

return chirimoya;

})));
