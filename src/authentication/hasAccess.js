import getPageComponent from '../core/getPageComponent';
import chirimoya from '../chirimoya';

var processAccess = function(page, access){
    if(access === false) return false;
    var result =  page.access === 'all' || window.chirimoya.isLoggedIn() ;
    return result;
};

var hasAccess = function (View) {
    return new Promise(function (resolve, reject) {
        try {
            var page = getPageComponent(View);
            if (chirimoya.onBeforeHasAccess && typeof chirimoya.onBeforeHasAccess === 'function') {
                var result = chirimoya.onBeforeHasAccess();
                if(result.then && typeof result.then ==='function'){
                    return result.then(function(cancelAccess){
                        return resolve(processAccess(page, cancelAccess));
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

