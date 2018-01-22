(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.chirimoya = factory());
}(this, (function () { 'use strict';

var extend = function (obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
};

var Request = /** @class */ (function () {
    function Request() {
        this.Access = true;
        this.Fragments = [];
    }
    return Request;
}());

var History = /** @class */ (function () {
    function History() {
        this.historyData = [];
    }
    History.prototype.add = function (newHash, oldHash) {
        this.historyData.push({
            location: document.location,
            hash: newHash,
            previousHash: oldHash
        });
    };
    History.prototype.back = function () {
        var prev = this.historyData[this.historyData.length - 2];
        if (prev && prev.location.host === document.location.host) {
            this.historyData.splice(this.historyData.length - 2);
            window.history.back();
            return false;
        }
        return true;
    };
    return History;
}());

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var BasicRouter = /** @class */ (function () {
    function BasicRouter(routesParam, settings) {
        this.History = new History();
        this.Settings = settings;
        this.RoutesParam = routesParam;
        if (typeof this.RoutesParam === 'string' && !Array.isArray(this.RoutesParam))
            this.RoutesParam = [this.RoutesParam];
    }
    BasicRouter.prototype.set = function (route) {
        this.currentPath = route;
        var request = this.createRequest(route);
        return this.processRequest(request);
    };
    BasicRouter.prototype.processRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request.ModulePath = this.modulePath(request);
                        return [4 /*yield*/, this.loadModule(request)];
                    case 1:
                        _a.sent();
                        this.renderView(request);
                        return [2 /*return*/];
                }
            });
        });
    };
    BasicRouter.prototype.createRequest = function (route) {
        var request = new Request();
        request.RequestUrl = route;
        var parts = request.RequestUrl.split('/', 10);
        for (var index = 0; index < parts.length; index++) {
            var element = parts[index];
            request.Fragments.push({
                Name: index.toString(),
                Value: element
            });
        }
        return request;
    };
    BasicRouter.prototype.modulePath = function (request) {
        // var controller = request.controller;
        // var pageName = '';
        // if (!controller) return pageName;
        // if (typeof request.action === 'undefined' || request.action === null || request.action === '') {
        //     request.action = controller;
        // }
        //NEW VERSION
        //var parts = [];
        // if (request.folder)
        //     parts.push(request.folder);
        // if(request.module)
        //     parts.push(request.module);
        // if(request.controller)
        //     parts.push(request.controller);
        // if(request.action)
        //     parts.push(request.action);
        // for (let index = 0; index < request.Fragments.length; index++) {
        //     const element = request.Fragments[index];
        // }
        if (request.Fragments.length === 1)
            request.Fragments.push(request.Fragments[0]);
        else if (request.Fragments.length === 0)
            throw new Error('Coudnt find URL fragments');
        var moduleId = this.Settings.pageFolderBase
            + '/'
            + request.Fragments.map(function (x) { return x.Value; }).join('/');
        return moduleId.toLowerCase();
    };
    BasicRouter.prototype.loadModule = function (request) {
        return new Promise(function (resolve, reject) {
            if (!request.ModulePath)
                return reject(new Error('Module path is null. URL:' + request.RequestUrl));
            var url = request.ModulePath;
            require([url], function (View) {
                if (!View)
                    return reject(new Error('problem loading module. URL:' + request.RequestUrl));
                if (View.__esModule === true)
                    View = View.default;
                if (!View) {
                    console.warn('problem loading module', request);
                    return reject(new Error('problem loading module. URL:' + request.RequestUrl));
                }
                request.View = View;
                return resolve(request);
            });
        });
    };
    BasicRouter.prototype.renderView = function (request) {
        if (!request.Access) {
            console.warn('not access to module', request);
            return null;
        }
        return new request.View({ el: this.Settings.appTarget, data: { request: request } });
    };
    
    return BasicRouter;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CrossroadsRouter = /** @class */ (function (_super) {
    __extends(CrossroadsRouter, _super);
    function CrossroadsRouter(routesParam, settings) {
        var _this = _super.call(this, routesParam, settings) || this;
        //super._settings = settings;
        _this._crossroads = window.crossroads || _this.Settings.routerParams.crossroads;
        _this._hasher = window.hasher || _this.Settings.routerParams.hasher;
        if (typeof routesParam === 'undefined' || routesParam === null)
            routesParam = ['{controller}'];
        if (!_this._crossroads) {
            throw new Error("Crossroads needs to be loaded before chirimoya");
        }
        if (!_this._hasher) {
            throw new Error("Crossroads needs to be loaded before chirimoya");
        }
        routesParam.forEach(function (val) {
            _this._crossroads.addRoute(val);
        }, _this);
        _this._crossroads.routed.add(_this.handleRequest.bind(_this));
        //setup hasher
        var parseHash = function (newHash, oldHash) {
            // if (!chirimoya.isLoggedIn() && newHash.indexOf(settings.loginPage) < 0)
            //     hasher.setHash(settings.loginPage);
            // else
            if ((newHash === '' || newHash === null || typeof newHash === 'undefined') && _this.History.historyData.length === 0)
                _this.set(settings.homePage);
            //history.add(newHash, oldHash);
            _this._crossroads.parse(newHash);
        };
        _this._hasher.prependHash = '!';
        _this._hasher.initialized.add(parseHash); //parse initial hash
        _this._hasher.changed.add(parseHash); //parse hash changes
        _this._hasher.init();
        return _this;
    }
    CrossroadsRouter.prototype.set = function (route) {
        this._hasher.setHash(route);
        return Promise.resolve();
    };
    CrossroadsRouter.prototype.handleRequest = function (requestUrl, params, isFirst) {
        var request = new Request();
        request.RequestUrl = requestUrl;
        var getFolder = function (a, b) {
            var j = 0;
            while (j < b.length) {
                if (a[j] != b[j])
                    break;
                j++;
            }
            if (j === 0)
                return null;
            var result = a.substring(0, j);
            if (result.endsWith('/'))
                result = result.substr(0, result.length - 1);
            return result;
        };
        var folder = getFolder(params.params.input, params.route._pattern);
        if (folder !== null)
            request.Folder = folder;
        //request.Fragments = {};
        params.route._paramsIds.forEach(function (paramId, index) {
            request.Fragments.push({
                Name: paramId,
                Value: params.params[index]
            });
        }, this);
        this.processRequest(request);
        //this.renderView(View, request, true)
        //load(request);
    };
    
    return CrossroadsRouter;
}(BasicRouter));

var Routers;
(function (Routers) {
    Routers[Routers["Basic"] = 0] = "Basic";
    Routers[Routers["Crossroads"] = 1] = "Crossroads";
    Routers[Routers["Navigo"] = 2] = "Navigo";
})(Routers || (Routers = {}));
function CreateRouter(routesParam, settings) {
    switch (settings.router) {
        case Routers.Crossroads:
            return new CrossroadsRouter(routesParam, settings);
        default: return new BasicRouter(routesParam, settings);
    }
}

var defaults = {
    homePage: 'home',
    loginPage: 'login',
    pageFolderBase: 'pages',
    appTarget: '#app',
    router: Routers.Basic,
    __DEBUG__: true
};

// import hasher from 'hasher';
// import crossroads from 'crossroads';
// import history from './core/history';
// import processRequestClass from './core/processRequest';
// var settings = null;
// var routes = {};
// var isInit = false;
var chirimoya = /** @class */ (function () {
    function chirimoya(routesParam, options) {
        this.init = false;
        this.isUserAuthenticated = false;
        if (this.init)
            return;
        this.init = true;
        this.settings = extend(defaults, options);
        if (this.settings.__DEBUG__)
            console.warn('Chirimoya is in DEBUG mode, set options.__DEBUG__ = false on production.');
        this.currentRouter = CreateRouter(routesParam, this.settings);
        //     window.chirimoya = chirimoya;
        //     if (typeof this.isLoggedIn !== 'function')
        //         this.isLoggedIn = function () { return true; };
    }
    chirimoya.prototype.set = function (route) {
        var _this = this;
        return this.currentRouter.set(route)
            .then(function (rv) {
            _this.currentView = rv;
        });
        //     hasher.setHash(route);
    };
    // history: history,
    chirimoya.prototype.back = function () {
        //return chirimoya.history.back();
    };
    return chirimoya;
}());

return chirimoya;

})));
