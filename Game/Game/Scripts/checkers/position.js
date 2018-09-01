var Checkers;
(function (Checkers) {
    var Position = /** @class */ (function () {
        function Position() {
        }
        Position.prototype.initialize = function () {
            this.blackPlayer = false;
            this.desk = new Array(8);
            for (var row = 0; row < 8; row++) {
                this.desk[row] = new Array(4);
            }
            for (var row = 0; row < 8; ++row) {
                for (var col = 0; col < 4; ++col) {
                    var cellIndex = new Checkers.CellIndex(row, col);
                    if (row < 3)
                        this.setPiece(cellIndex, Checkers.CellValue.WhiteSimple);
                    else if (row < 5)
                        this.setPiece(cellIndex, Checkers.CellValue.Empty);
                    else
                        this.setPiece(cellIndex, Checkers.CellValue.BlackSimple);
                }
            }
        };
        Position.prototype.getPiece = function (cellIndex) {
            return this.desk[cellIndex.row][cellIndex.col];
        };
        Position.prototype.setPiece = function (cellIndex, piece) {
            this.desk[cellIndex.row][cellIndex.col] = piece;
        };
        return Position;
    }());
    Checkers.Position = Position;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=position.js.map