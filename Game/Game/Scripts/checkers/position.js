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
                        this.setCellValue(cellIndex, Checkers.WHITE_SIMPLE);
                    else if (row < 5)
                        this.setCellValue(cellIndex, Checkers.CellValue.Empty);
                    else
                        this.setCellValue(cellIndex, Checkers.BLACK_SIMPLE);
                }
            }
        };
        Position.prototype.getCellValue = function (cellIndex) {
            return this.desk[cellIndex.row][cellIndex.col];
        };
        Position.prototype.setCellValue = function (cellIndex, piece) {
            this.desk[cellIndex.row][cellIndex.col] = piece;
        };
        Position.prototype.copy = function () {
            var result = new Position();
            result.blackPlayer = this.blackPlayer;
            result.desk = this.desk.map(function (line) {
                return line.slice();
            });
            return result;
        };
        Position.prototype.isMyPiece = function (cellIndex) {
            var cellValue = this.getCellValue(cellIndex);
            if (cellValue == Checkers.CellValue.Empty)
                return false;
            var pieceIsBlack = ((cellValue & Checkers.CellValue.Black) == Checkers.CellValue.Black);
            return (pieceIsBlack == this.blackPlayer);
        };
        Position.prototype.isEmpty = function (cellIndex) {
            var cellValue = this.getCellValue(cellIndex);
            return (cellValue == Checkers.CellValue.Empty);
        };
        Position.prototype.findFirstNotEmptyCell = function (start, dir) {
            var cell = start.next(dir);
            while (cell && this.isEmpty(cell))
                cell = cell.next(dir);
            return cell;
        };
        Position.prototype.findMoveStepsByDirectionSimple = function (from, dir, shouldBeat) {
            var steps = new Array();
            var nextCellIndex = from.next(dir);
            if (!nextCellIndex)
                return steps;
            if (this.isEmpty(nextCellIndex)) {
                var down = ((dir & Checkers.Direction.Up) == 0);
                var backward = ((down && !this.blackPlayer) || (!down && this.blackPlayer));
                if (backward) {
                    return steps;
                }
                else if (!shouldBeat) {
                    var step = new Checkers.MoveStep(from, nextCellIndex);
                    steps.push(step);
                }
            }
            else if (!this.isMyPiece(nextCellIndex)) {
                var nextAfterNext = nextCellIndex.next(dir);
                if (nextAfterNext && this.isEmpty(nextAfterNext)) {
                    var step = new Checkers.MoveStep(from, nextAfterNext, nextCellIndex);
                    steps.push(step);
                }
            }
            return steps;
        };
        Position.prototype.findMoveStepsByDirectionKing = function (from, dir, shouldBeat) {
            var steps = new Array();
            var cellToCaptureIndex = this.findFirstNotEmptyCell(from, dir);
            if (cellToCaptureIndex && !this.isMyPiece(cellToCaptureIndex)) {
                for (var to = cellToCaptureIndex.next(dir); to && this.isEmpty(to); to = to.next(dir)) {
                    var step = new Checkers.MoveStep(from, to, cellToCaptureIndex);
                    steps.push(step);
                }
            }
            else if (!shouldBeat) {
                var nextCellIndex = from.next(dir);
                if (!nextCellIndex)
                    return steps;
                for (var to = nextCellIndex; to && this.isEmpty(to); to = to.next(dir)) {
                    var step = new Checkers.MoveStep(from, to);
                    steps.push(step);
                }
            }
            return steps;
        };
        Position.prototype.findMoveSteps = function (from, shouldCapture, beatFromDir) {
            if (shouldCapture === void 0) { shouldCapture = false; }
            var steps = new Array();
            if (beatFromDir != null)
                shouldCapture = true;
            var fromValue = this.getCellValue(from);
            for (var _i = 0, ALL_MOVE_DIRECTIONS_1 = Checkers.ALL_MOVE_DIRECTIONS; _i < ALL_MOVE_DIRECTIONS_1.length; _i++) {
                var dir = ALL_MOVE_DIRECTIONS_1[_i];
                if (dir == beatFromDir)
                    continue;
                var dirSteps = void 0;
                if (fromValue & Checkers.CellValue.King)
                    dirSteps = this.findMoveStepsByDirectionKing(from, dir, shouldCapture);
                else
                    dirSteps = this.findMoveStepsByDirectionSimple(from, dir, shouldCapture);
                if (dirSteps.length > 0 && dirSteps[0].capturedCell && !shouldCapture) {
                    shouldCapture = true;
                    steps = steps.filter(function (step) { return (step.capturedCell); });
                }
                for (var _a = 0, dirSteps_1 = dirSteps; _a < dirSteps_1.length; _a++) {
                    var step = dirSteps_1[_a];
                    steps.push(step);
                }
            }
            return steps;
        };
        Position.prototype.completeMoves = function (notCompletedMoves) {
            var completedMoves = new Array();
            while (notCompletedMoves.length > 0) {
                var move = notCompletedMoves.pop();
                var lastStep = move.lastStep();
                if (!lastStep.capturedCell) {
                    move.end.blackPlayer = !move.end.blackPlayer;
                    completedMoves.push(move);
                    continue;
                }
                var nextSteps = move.end.findMoveSteps(lastStep.to, true, lastStep.captureFrom());
                if (nextSteps.length == 0) {
                    move.end.blackPlayer = !move.end.blackPlayer;
                    completedMoves.push(move);
                    continue;
                }
                var lastIndex = nextSteps.length - 1;
                for (var nextStepIndex = 0; nextStepIndex < nextSteps.length; ++nextStepIndex) {
                    var extendedMove = void 0;
                    if (nextStepIndex < lastIndex)
                        extendedMove = move.copy();
                    else
                        extendedMove = move;
                    extendedMove.addStep(nextSteps[nextStepIndex]);
                    notCompletedMoves.push(extendedMove);
                }
            }
            return completedMoves;
        };
        Position.prototype.findMovesFromCell = function (cellIndex, shouldCapture) {
            var _this = this;
            if (shouldCapture === void 0) { shouldCapture = false; }
            var firstSteps = this.findMoveSteps(cellIndex, shouldCapture);
            var notCompletedMoves = firstSteps.map(function (step) { return step.toMove(_this); });
            var moves = this.completeMoves(notCompletedMoves);
            return moves;
        };
        Position.prototype.findAllMoves = function () {
            var moves = new Array();
            var shouldCapture = false;
            for (var row = 0; row < 8; ++row) {
                for (var col = 0; col < 4; ++col) {
                    var cellIndex = new Checkers.CellIndex(row, col);
                    if (this.isMyPiece(cellIndex)) {
                        var movesFromCell = this.findMovesFromCell(cellIndex, shouldCapture);
                        for (var _i = 0, movesFromCell_1 = movesFromCell; _i < movesFromCell_1.length; _i++) {
                            var move = movesFromCell_1[_i];
                            if (move.isCapturing() && !shouldCapture) {
                                shouldCapture = true;
                                moves = moves.filter(function (move) { return (move.isCapturing()); });
                            }
                            if (!shouldCapture || move.isCapturing())
                                moves.push(move);
                        }
                    }
                }
            }
            return moves;
        };
        return Position;
    }());
    Checkers.Position = Position;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=position.js.map