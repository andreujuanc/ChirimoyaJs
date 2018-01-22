define(function (require) {

    return function () {
        app.innerHTML = `
                <h1 >Home!</h1> <a href="#second" onclick="chiri.set('second')">Go to Second Page</a>
            `;
    };
}
);