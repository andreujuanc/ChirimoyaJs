import hasher from 'hasher';
import crossroads from 'crossroads';
import extend from './util/extend';
import defaults from './defaults';

import history from './core/history';
import processRequestClass from './core/processRequest';


var settings = null;
var routes = {};
var isInit = false;
var chirimoya = {

    init: function (routesParam, options) {
        if(isInit) return;
        isInit = true;
        if (typeof routesParam === 'undefined' || routesParam === null) routesParam = ['{controller}'];
        if (!Array.isArray(routesParam)) routesParam = [routesParam];
        
        window.chirimoya = chirimoya;

        settings = extend(defaults, options);

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

export default chirimoya;