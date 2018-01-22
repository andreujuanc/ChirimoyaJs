define(function (require) {

    return function () {
        app.innerHTML = `
                    <h1>Second page!!!</h1> 
                    <a href="#home" onclick="chiri.set('home');">Go to home</a><br/>
                    <a href="#" onclick="chiri.back(event);">Go back</a>
                    `;
    };
}
);