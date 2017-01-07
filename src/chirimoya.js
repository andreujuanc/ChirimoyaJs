import hasher from 'hasher';
import crossroads from 'crossroads';
import extend from './extend';
import defaults from './defaults';
import historyBack from './core/historyBack';

import getModule from './getModule';

var settings = null;
var currentView = null;
var routes = {};


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
    return page.access === 'all' || chirimoya.isLoggedIn();
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
}


var timesLoaded = 0;
var load = function (request) {
    var moduleId = getModule(request);
    //console.log('loading up module', moduleId);
    require([moduleId], function (View) {

        if (!View) {
            console.warn('problem loading module', request)
            hasher.setHash(settings.homePage);
            return;
        }

        if (!hasAccess(View)) {
            console.warn('not auth to module', request)
            hasher.setHash(settings.loginPage);
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

var chirimoya = {

    init: function (routesParam, options) {
        if (typeof routesParam === 'undefined' || routesParam === null) routesParam = ['{controller}'];
        if (!Array.isArray(routesParam)) routesParam = [routesParam];

        settings = extend(defaults, options);

        if (typeof this.isLoggedIn !== 'function')
            this.isLoggedIn = function () { return true; };

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
    back: historyBack,
    isLoggedIn: null

};

export default chirimoya;