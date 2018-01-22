export class HistoryItem {
    location: Location
    hash: string
    previousHash: string
}

export default class History {
    public historyData: HistoryItem[] = [];
    
    add(newHash: string, oldHash: string) {
        this.historyData.push({
            location: document.location,
            hash: newHash,
            previousHash: oldHash
        });
    }

    back() {
        var prev = this.historyData[this.historyData.length - 2];
        if (prev && prev.location.host === document.location.host) {
            this.historyData.splice(this.historyData.length - 2);
            window.history.back();
            return false;
        }
        return true;
    }
};