var historyData = [];
var history = {
    add: function (newHash, oldHash) {

        historyData.push({
            location: document.location,
            hash: newHash,
            previousHash: oldHash
        });
    },
    back: function () {

        var prev = historyData[historyData.length - 2];
        if (prev && prev.location.host === document.location.host) {
            historyData.splice(historyData.length - 2);
            window.history.back();
            return false;
        }

        return true;
    }
};

export default history;