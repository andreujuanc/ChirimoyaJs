import { Routers } from './routers/index';

export interface Options {
    homePage: string,
    loginPage: string,
    pageFolderBase: string,
    appTarget: string,
    router: Routers,
    routerParams?: any,
    __DEBUG__: boolean
}

let defaults: Options = {
    homePage: 'home',
    loginPage: 'login',
    pageFolderBase: 'pages',
    appTarget: '#app',
    router: Routers.Basic,
    __DEBUG__ : true
};

export default defaults;