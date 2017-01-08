define(function (require) {

    return function () {
        app.innerHTML = '</h1>Second page!!!</h1> <a href="#home">Go to home</a><br/><a href="#" onclick="window.chirimoya.back(event);">Go back</a>';
    };
}
);