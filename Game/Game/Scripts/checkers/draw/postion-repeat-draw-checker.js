var Checkers;
(function (Checkers) {
    var PositionRepeatDrawChecker = /** @class */ (function () {
        function PositionRepeatDrawChecker() {
        }
        PositionRepeatDrawChecker.prototype.reset = function () {
        };
        PositionRepeatDrawChecker.prototype.getDescription = function () {
            return "The same position was repeated three times.";
        };
        PositionRepeatDrawChecker.prototype.check = function (lastMove, postionCounts) {
            var pos = lastMove.end;
            return (postionCounts.getValue(pos) >= 3);
        };
        return PositionRepeatDrawChecker;
    }());
    Checkers.PositionRepeatDrawChecker = PositionRepeatDrawChecker;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=postion-repeat-draw-checker.js.map