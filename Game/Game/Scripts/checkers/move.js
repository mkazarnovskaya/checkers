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
                result |= Checkers.Direction.Up;
            var colFrom = this.from.col;
            if ((this.from.row & 1) == 1)
                colFrom++;
            var colTo = this.to.col;
            if ((this.to.row & 1) == 1)
                colTo++;
            if (colFrom > colTo)
                result |= Checkers.Direction.Right;
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
        MoveStep.prototype.equals = function (other) {
            if (other == null)
                return false;
            if (!this.from.equals(other.from) || !this.to.equals(other.to))
                return false;
            if (this.capturedCell == null)
                return (other.capturedCell == null);
            return (this.capturedCell.equals(other.capturedCell));
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
        Move.prototype.startsWith = function (steps) {
            if (steps == null)
                return true;
            var len = steps.length;
            if (len > this.steps.length)
                return false;
            for (var stepIndex = 0; stepIndex < len; ++stepIndex) {
                if (!this.steps[stepIndex].equals(steps[stepIndex]))
                    return false;
            }
            return true;
        };
        Move.prototype.getLastTargetCell = function () {
            return this.steps[this.steps.length - 1].to;
        };
        return Move;
    }());
    Checkers.Move = Move;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=move.js.map