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
                if (timesLoaded < 3) hasher.setHash(settings.homePage);
                else {
                    timesLoaded = 0;
                    console.warn('problem loading module', request);
                }
                return;
            }
            var renderView = function (access) {
                if (!access) {
                    if (timesLoaded < 3)
                        hasher.setHash(settings.loginPage);
                    else {
                        timesLoaded = 0;
                        console.warn('not access to module', request);
                    }
                    return;
                }
                timesLoaded = 0;
                currentView = new View({ el: settings.appTarget, data: { request: request } });
            };

            var afterAccessDo = function () {
                return new Promise(function (resolve, reject) {
                    hasAccess(View, moduleId)
                        .then(function (access) {
                            resolve(access);
                        }, function (access) {
                            resolve(false);
                        })
                        .catch(function (access) {
                            resolve(false);
                        });
                });

            };

            var processModule = function (callback) {
                if (currentView && currentView.teardown && typeof currentView.teardown === 'function') {
                    //window.currentView = currentView;
                    var element = null;

                    if (currentView.target && currentView.target.firstElementChild instanceof HTMLElement)
                        element = currentView.target.firstElementChild;
                    else if(currentView.el.firstElementChild instanceof HTMLElement);
                        element = currentView.el.firstElementChild;

                    var promises = [];
                    // if (element !== null) {
                    //     promises.push(currentView.transition('zoom', element));
                    // }
                    promises.push(currentView.teardown().then(function () { currentView = null; }));
                    promises.push(afterAccessDo());
                    Promise.all(promises)
                        .then(function (values) {
                            callback(values[promises.length - 1]);
                        });

                } else {
                    afterAccessDo().then(callback);
                }
            };

            processModule(renderView);

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