// import hasher from 'hasher';
// import crossroads from 'crossroads';
import extend from './util/extend';
import { default as defaults, Options } from './defaults';
import { CreateRouter } from './routers/index'
import IRouter from './routers/irouter';
// import history from './core/history';
// import processRequestClass from './core/processRequest';

// var settings = null;
// var routes = {};
// var isInit = false;
class chirimoya {
    init: boolean = false;
    settings: Options;
    isUserAuthenticated: boolean = false
    currentRouter: IRouter;
    currentView: any;
    public static test: boolean;
    
    constructor(routesParam: string[], options: Options) {
        if (this.init) return;
        this.init = true;
        this.settings = extend(defaults, options);
        if (this.settings.__DEBUG__)
            console.warn('Chirimoya is in DEBUG mode, set options.__DEBUG__ = false on production.')
   
        this.currentRouter = CreateRouter(routesParam, this.settings);

        //     window.chirimoya = chirimoya;

        //     if (typeof this.isLoggedIn !== 'function')
        //         this.isLoggedIn = function () { return true; };



    }
    set(route: string) {
        return this.currentRouter.set(route)
            .then((rv: any)=>{
                this.currentView = rv;
            })
        //     hasher.setHash(route);
    }
    // history: history,
    back() {
        //return chirimoya.history.back();
    }

    // isLoggedIn: null

};

export default chirimoya;