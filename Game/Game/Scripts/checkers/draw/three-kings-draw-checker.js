var Checkers;
(function (Checkers) {
    var ThreeKingsDrawChecker = /** @class */ (function () {
        function ThreeKingsDrawChecker() {
            this.maxCount = 30;
            this.counter = null;
        }
        ThreeKingsDrawChecker.prototype.reset = function () {
            this.counter = null;
        };
        ThreeKingsDrawChecker.prototype.getDescription = function () {
            return "The player having three kings (or more) against a single enemy king coudn't capture enemy king within 15 moves.";
        };
        ThreeKingsDrawChecker.prototype.check = function (pos, postionCounts) {
            if (this.counter != null) {
                ++this.counter;
                if (this.counter >= this.maxCount)
                    return true;
                return false;
            }
            else {
                var enemySimpleCount = 0;
                var enemyKingCount = 0;
                var mySimpleCount = 0;
                var myKingCount = 0;
                for (var row = 0; row < 8; ++row) {
                    for (var col = 0; col < 4; ++col) {
                        var cellIndex = new Checkers.CellIndex(row, col);
                        if (pos.isEmpty(cellIndex))
                            continue;
                        var cellValue = pos.getCellValue(cellIndex);
                        if (pos.isMyPiece(cellIndex)) {
                            if (cellValue & Checkers.CellValue.King)
                                ++myKingCount;
                            else
                                ++mySimpleCount;
                        }
                        else {
                            if (cellValue & Checkers.CellValue.King)
                                ++enemyKingCount;
                            else
                                ++enemySimpleCount;
                        }
                    }
                }
                if ((enemySimpleCount == 0 && enemyKingCount == 1 && myKingCount >= 3) || (mySimpleCount == 0 && myKingCount == 1 && enemyKingCount >= 3))
                    this.counter = 0;
                return false;
            }
        };
        return ThreeKingsDrawChecker;
    }());
    Checkers.ThreeKingsDrawChecker = ThreeKingsDrawChecker;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=three-kings-draw-checker.js.map