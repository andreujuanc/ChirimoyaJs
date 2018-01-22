import { Options } from '../defaults'
import IRouter from './irouter'
import Request from '../core/request'
import History from '../core/history'

export default class BasicRouter implements IRouter {
    public currentPath: string;
    public Settings: Options;
    public RoutesParam: string[]
    public History: History;

    constructor(routesParam: string[], settings: Options) {
        this.History = new History();
        this.Settings = settings;
        this.RoutesParam = routesParam;

        if (typeof this.RoutesParam === 'string' && !Array.isArray(this.RoutesParam))
            this.RoutesParam = [this.RoutesParam];
    }

    set(route: string) {
        this.currentPath = route;
        let request = this.createRequest(route);
        return this.processRequest(request);
    }
    protected async processRequest(request: Request) {
        request.ModulePath = this.modulePath(request);
        await this.loadModule(request)
        this.renderView(request)
    }

    private createRequest(route: string) {
        let request = new Request();
        request.RequestUrl = route;
        let parts = request.RequestUrl.split('/', 10);
        for (let index = 0; index < parts.length; index++) {
            const element = parts[index];
            request.Fragments.push({
                Name: index.toString(),
                Value: element
            })
        }
        return request;
    }

    protected modulePath(request: Request) {


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
            request.Fragments.push(request.Fragments[0])
        else if (request.Fragments.length === 0)
             throw new Error('Coudnt find URL fragments')

        const moduleId = this.Settings.pageFolderBase 
            + '/'
            + request.Fragments.map((x)=>x.Value).join('/');

        return moduleId.toLowerCase();
    }

    protected loadModule(request: Request): Promise<Request> {

        return new Promise((resolve: any, reject: any) => {
            if (!request.ModulePath)
                return reject(new Error('Module path is null. URL:' + request.RequestUrl));
            const url = request.ModulePath;
            require([url], (View: any) => {
                if(!View) 
                    return reject(new Error('problem loading module. URL:' + request.RequestUrl));
                if (View.__esModule === true) //GOTTA LOVE WEBPACK....
                    View = View.default;

                if (!View) {
                    console.warn('problem loading module', request);
                    return reject(new Error('problem loading module. URL:' + request.RequestUrl));
                }
                request.View = View;
                return resolve(request);
            });
        });
    }

    protected renderView(request: Request) {
        if (!request.Access) {
            console.warn('not access to module', request);
            return null;
        }
        return new request.View({ el: this.Settings.appTarget, data: { request: request } });
    };
}