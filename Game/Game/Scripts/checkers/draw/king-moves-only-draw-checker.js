var Checkers;
(function (Checkers) {
    var KingMovesOnlyDrawChecker = /** @class */ (function () {
        function KingMovesOnlyDrawChecker() {
            this.maxCount = 30;
            this.totalKingCount = 0;
            this.counter = null;
        }
        KingMovesOnlyDrawChecker.prototype.reset = function () {
            this.totalKingCount = 0;
            this.counter = null;
        };
        KingMovesOnlyDrawChecker.prototype.getDescription = function () {
            return "Only kings were moved during 15 moves without any captures.";
        };
        KingMovesOnlyDrawChecker.prototype.check = function (lastMove, postionCounts) {
            var pos = lastMove.end;
            var newTotalKingCount = this.getTotalKingCount(pos);
            if (newTotalKingCount != this.totalKingCount) {
                this.totalKingCount = newTotalKingCount;
            }
            else {
                var targetCellValue = pos.getCellValue(lastMove.getLastTargetCell());
                if ((targetCellValue & Checkers.CellValue.King) == 0) {
                    this.counter = null;
                    return false;
                }
            }
            if (this.counter == null)
                this.counter = 0;
            else
                ++this.counter;
            return (this.counter >= 30);
        };
        KingMovesOnlyDrawChecker.prototype.getTotalKingCount = function (pos) {
            var kingCount = 0;
            for (var row = 0; row < 8; ++row) {
                for (var col = 0; col < 4; ++col) {
                    var cellIndex = new Checkers.CellIndex(row, col);
                    var cellValue = pos.getCellValue(cellIndex);
                    if (cellValue & Checkers.CellValue.King)
                        ++kingCount;
                }
            }
            return kingCount;
        };
        return KingMovesOnlyDrawChecker;
    }());
    Checkers.KingMovesOnlyDrawChecker = KingMovesOnlyDrawChecker;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=king-moves-only-draw-checker.js.map