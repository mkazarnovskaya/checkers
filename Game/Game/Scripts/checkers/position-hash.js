var Checkers;
(function (Checkers) {
    var PositionHash = /** @class */ (function () {
        function PositionHash() {
            this.hashObject = new Object();
        }
        PositionHash.prototype.hash = function (position) {
            var key0 = position.blackPlayer ? "1" : "2";
            var key1 = 0;
            var key2 = 0;
            var key3 = 0;
            var index = 0;
            for (var row = 0; row < 8; ++row) {
                for (var col = 0; col < 4; ++col) {
                    var cellValue = position.desk[row][col];
                    if (cellValue == 0)
                        cellValue = 6;
                    if (index < 10) {
                        key1 = ((key1 << 3) | cellValue);
                    }
                    else if (index == 10) {
                        key1 = ((key1 << 2) | (cellValue >> 1));
                        key2 = (cellValue & 1);
                    }
                    else if (index < 21) {
                        key2 = ((key2 << 3) | cellValue);
                    }
                    else if (index == 21) {
                        key2 = ((key2 << 1) | (cellValue & 1));
                        key3 = (cellValue >> 1);
                    }
                    else {
                        key3 = ((key3 << 3) | cellValue);
                    }
                    ++index;
                }
            }
            return (key0 + "x" + new String(key1) + "x" + new String(key2) + "x" + new String(key3));
        };
        PositionHash.prototype.getValueByPosition = function (position) {
            var hash = this.hash(position);
            return this.hashObject[hash];
        };
        PositionHash.prototype.addValue = function (position, value) {
            var hash = this.hash(position);
            if (this.hashObject[hash])
                throw new Error("Value was already added for this posion.");
            this.hashObject[hash] = value;
        };
        PositionHash.prototype.getAllValues = function () {
            var _this = this;
            return Object.keys(this.hashObject).map(function (nodeHash) { return _this.hashObject[nodeHash]; });
        };
        return PositionHash;
    }());
    Checkers.PositionHash = PositionHash;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=position-hash.js.map