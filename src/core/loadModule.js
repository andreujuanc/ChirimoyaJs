import hasher from 'hasher';
import getModuleClass from './getModule';
import hasAccess from '../authentication/hasAccess';




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
                if(timesLoaded < 3 ) hasher.setHash(settings.homePage);
                else console.warn('problem loading module', request);
                return;
            }

            var processModule = function (access) {
                
                if (!access) {
                    if(timesLoaded < 3 )  hasher.setHash(settings.loginPage);
                    else console.warn('not access to module', request);
                    return;
                }

                
                //console.log('loaded module', moduleId);
                var renderView = function () {
                    //console.log('view loaded', moduleId);
                    timesLoaded = 0;
                    currentView = new View({ el: settings.appTarget, data: { request: request } });
                };
                if (currentView) {
                    //console.log('tearing down', currentView);
                    if (currentView.teardown && typeof currentView.teardown === 'function')
                        currentView.teardown().then(renderView);
                    else
                        renderView();
                } else {
                    renderView();
                }
            }

            hasAccess(View, moduleId)
                .then(function(access){
                    processModule(access);
                }, function (access) {
                    processModule(false);
                })
                .catch(function (access) {
                    processModule(false);
                });

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

export default loadClass;