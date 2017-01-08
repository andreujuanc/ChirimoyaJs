var getPageComponent = function (view) {
    if (!view.isPage) {
        for (var c in view.components) {
            var r = view.components[c];
            if (r.isPage) {
                return r;
            }
        }
    }
    return view;
};

export default getPageComponent;
