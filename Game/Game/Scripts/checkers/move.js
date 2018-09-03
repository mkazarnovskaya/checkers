var Checkers;
(function (Checkers) {
    var MoveStep = /** @class */ (function () {
        function MoveStep(from, to, capturedCell) {
            if (capturedCell === void 0) { capturedCell = null; }
            this.from = from;
            this.to = to;
            this.capturedCell = capturedCell;
        }
        MoveStep.prototype.captureFrom = function () {
            if (!this.capturedCell)
                return null;
            var result = 0;
            if (this.from.row > this.to.row)
                result |= 1;
            var colFrom = this.from.col;
            if ((this.from.row & 1) == 1)
                colFrom++;
            var colTo = this.to.col;
            if ((this.to.row & 1) == 1)
                colTo++;
            if (colFrom < colTo)
                result |= 2;
            return result;
        };
        MoveStep.prototype.toMove = function (startPosition) {
            var endPostion = startPosition.copy();
            this.apply(endPostion);
            return new Move([this], endPostion);
        };
        MoveStep.prototype.apply = function (pos) {
            var piece = pos.getCellValue(this.from);
            pos.setCellValue(this.from, Checkers.CellValue.Empty);
            if (this.capturedCell)
                pos.setCellValue(this.capturedCell, Checkers.CellValue.Empty);
            if (!(piece & Checkers.CellValue.King)) {
                if ((this.to.row == 0 && piece & Checkers.CellValue.Black) || (this.to.row == 7 && !(piece & Checkers.CellValue.Black)))
                    piece = (piece | Checkers.CellValue.King);
            }
            pos.setCellValue(this.to, piece);
        };
        return MoveStep;
    }());
    Checkers.MoveStep = MoveStep;
    var Move = /** @class */ (function () {
        function Move(steps, end) {
            this.steps = steps;
            this.end = end;
        }
        Move.prototype.lastStep = function () {
            return this.steps[this.steps.length - 1];
        };
        Move.prototype.copy = function () {
            var steps = this.steps.slice();
            var end = this.end.copy();
            return new Move(steps, end);
        };
        Move.prototype.addStep = function (step) {
            this.steps.push(step);
            step.apply(this.end);
        };
        Move.prototype.isCapturing = function () {
            return (this.lastStep().capturedCell != null);
        };
        Move.prototype.getLastTargetCell = function () {
            return this.steps[this.steps.length - 1].to;
        };
        return Move;
    }());
    Checkers.Move = Move;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=move.js.map