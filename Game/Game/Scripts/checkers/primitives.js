var Checkers;
(function (Checkers) {
    var CellValue;
    (function (CellValue) {
        CellValue[CellValue["Empty"] = 0] = "Empty";
        CellValue[CellValue["Occupied"] = 1] = "Occupied";
        CellValue[CellValue["Black"] = 2] = "Black";
        CellValue[CellValue["King"] = 45312] = "King";
    })(CellValue = Checkers.CellValue || (Checkers.CellValue = {}));
    var Direction;
    (function (Direction) {
        Direction[Direction["Up"] = 1] = "Up";
        Direction[Direction["Right"] = 2] = "Right";
    })(Direction = Checkers.Direction || (Checkers.Direction = {}));
    Checkers.ALL_MOVE_DIRECTIONS = [Direction.Up | Direction.Right, Direction.Up, 0, Direction.Right];
    Checkers.WHITE_SIMPLE = CellValue.Occupied;
    Checkers.WHITE_KING = CellValue.Occupied | CellValue.King;
    Checkers.BLACK_SIMPLE = CellValue.Occupied | CellValue.Black;
    Checkers.BLACK_KING = CellValue.Occupied | CellValue.Black | CellValue.King;
    var CellIndex = /** @class */ (function () {
        function CellIndex(row, col) {
            this.row = row;
            this.col = col;
        }
        CellIndex.prototype.next = function (dir) {
            var nextRow = ((dir & Direction.Up) == Direction.Up) ? this.row + 1 : this.row - 1;
            if (nextRow < 0 || nextRow > 7)
                return null;
            var nextCol;
            if ((dir & Direction.Right) == Direction.Right) //right
                nextCol = ((this.row & 1) == 0) ? this.col : this.col + 1;
            else //left
                nextCol = ((this.row & 1) == 0) ? this.col - 1 : this.col;
            if (nextCol < 0 || nextCol > 3)
                return null;
            return new CellIndex(nextRow, nextCol);
        };
        return CellIndex;
    }());
    Checkers.CellIndex = CellIndex;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=primitives.js.map