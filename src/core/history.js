
var history = {
    historyData: [],
    add: function (newHash, oldHash) {

        history.historyData.push({
            location: document.location,
            hash: newHash,
            previousHash: oldHash
        });
    },
    back: function () {

        var prev = history.historyData[history.historyData.length - 2];
        if (prev && prev.location.host === document.location.host) {
            history.historyData.splice(history.historyData.length - 2);
            window.history.back();
            return false;
        }

        return true;
    }
};

export default history;