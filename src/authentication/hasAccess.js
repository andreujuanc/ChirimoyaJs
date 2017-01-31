import getPageComponent from '../core/getPageComponent';
import chirimoya from '../chirimoya';

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

export default hasAccess;

