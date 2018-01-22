import { Options } from '../defaults'
import Request from '../core/request'
import BasicRouter from './basic'

export default class CrossroadsRouter extends BasicRouter {
    //private _settings: Options;
    private _hasher: any;
    private _crossroads: any;

    constructor(routesParam: string[], settings: Options) {
        super(routesParam, settings);
        //super._settings = settings;
        
        this._crossroads = (<any>window).crossroads || this.Settings.routerParams.crossroads;
        this._hasher = (<any>window).hasher || this.Settings.routerParams.hasher;

        if (typeof routesParam === 'undefined' || routesParam === null)
            routesParam = ['{controller}'];

        if (!this._crossroads) {
            throw new Error("Crossroads needs to be loaded before chirimoya")
        }
        if (!this._hasher) {
            throw new Error("Crossroads needs to be loaded before chirimoya")
        }

        routesParam.forEach((val) => {
            this._crossroads.addRoute(val);
        }, this);

        this._crossroads.routed.add(this.handleRequest.bind(this));

        //setup hasher
        const parseHash = (newHash: string, oldHash: string) => {
            // if (!chirimoya.isLoggedIn() && newHash.indexOf(settings.loginPage) < 0)
            //     hasher.setHash(settings.loginPage);
            // else
            if ((newHash === '' || newHash === null || typeof newHash === 'undefined') && this.History.historyData.length === 0)
                this.set(settings.homePage);
            //history.add(newHash, oldHash);
            this._crossroads.parse(newHash);
        }

        this._hasher.prependHash = '!';
        this._hasher.initialized.add(parseHash); //parse initial hash
        this._hasher.changed.add(parseHash); //parse hash changes
        this._hasher.init();
    }

    set(route: string) {
        this._hasher.setHash(route);
        return Promise.resolve();
    }

    private handleRequest(requestUrl: string, params: any, isFirst: boolean) {
        let request = new Request();
        request.RequestUrl = requestUrl;

        var getFolder = function (a: string, b: string) {
            let j = 0;
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
            request.Folder = folder;
        //request.Fragments = {};
        params.route._paramsIds.forEach((paramId: any, index: number) => {
            request.Fragments.push({
                Name: paramId,
                Value: params.params[index]
            }) ;
        }, this);

        this.processRequest(request);
        //this.renderView(View, request, true)
        //load(request);
    };
}

