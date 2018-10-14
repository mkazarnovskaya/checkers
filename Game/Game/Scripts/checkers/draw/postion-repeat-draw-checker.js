var Checkers;
(function (Checkers) {
    var PositionRepeatDrawChecker = /** @class */ (function () {
        function PositionRepeatDrawChecker() {
        }
        PositionRepeatDrawChecker.prototype.reset = function () {
        };
        PositionRepeatDrawChecker.prototype.getDescription = function () {
            return "The same position repeats itself for the third time.";
        };
        PositionRepeatDrawChecker.prototype.check = function (pos, postionCounts) {
            return (postionCounts.getValue(pos) >= 3);
        };
        return PositionRepeatDrawChecker;
    }());
    Checkers.PositionRepeatDrawChecker = PositionRepeatDrawChecker;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=postion-repeat-draw-checker.js.map