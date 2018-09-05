var Checkers;
(function (Checkers) {
    var Node = /** @class */ (function () {
        //constructor 
        function Node(position) {
            this.position = position;
        }
        Node.prototype.calculateNextPostions = function (allNodes) {
            this.moves = this.position.findAllMoves();
            this.nextPostions = this.moves.map(function (move) {
                var nextPos = move.end;
                var nextNode = allNodes.addNode(nextPos);
                return nextNode;
            });
        };
        Node.prototype.setRate = function (rate) {
            this.rate = rate;
            this.rated = true;
        };
        return Node;
    }());
    var PassedNodes = /** @class */ (function () {
        function PassedNodes() {
            this.nodes = new Object();
        }
        PassedNodes.prototype.hash = function (position) {
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
        PassedNodes.prototype.getNode = function (position) {
            var hash = this.hash(position);
            return this.nodes[hash];
        };
        PassedNodes.prototype.addNode = function (position) {
            var hash = this.hash(position);
            if (!this.nodes[hash])
                this.nodes[hash] = new Node(position);
            return this.nodes[hash];
        };
        return PassedNodes;
    }());
    var Ai = /** @class */ (function () {
        function Ai() {
        }
        Ai.prototype.buildGraph = function (position, height, allNodes, leaves, nodesToEstimate) {
            var node = allNodes.addNode(position);
            if (height == 0) {
                if (leaves.getNode(node.position) == null) {
                    leaves.addNode(node.position);
                    nodesToEstimate.push(node);
                }
            }
            else {
                node.calculateNextPostions(allNodes);
                for (var _i = 0, _a = node.nextPostions; _i < _a.length; _i++) {
                    var nextPos = _a[_i];
                    this.buildGraph(nextPos.position, height - 1, allNodes, leaves, nodesToEstimate);
                }
            }
        };
        Ai.prototype.getPosArray = function (position) {
            var result = new Array(129);
            result[128] = position.blackPlayer ? 1 : 0;
            var whiteIndex = 0;
            var whiteKIndex = 32;
            var blackIndex = 64;
            var blackKIndex = 96;
            for (var row = 0; row < 8; ++row) {
                for (var col = 0; col < 4; ++col) {
                    result[whiteIndex] = 0;
                    result[whiteKIndex] = 0;
                    result[blackIndex] = 0;
                    result[blackKIndex] = 0;
                    var value = position.desk[row][col];
                    switch (value) {
                        case Checkers.WHITE_SIMPLE:
                            result[whiteIndex] = 1;
                            break;
                        case Checkers.BLACK_SIMPLE:
                            result[blackIndex] = 1;
                            break;
                        case Checkers.WHITE_KING:
                            result[whiteKIndex] = 1;
                            break;
                        case Checkers.BLACK_KING:
                            result[blackKIndex] = 1;
                            break;
                    }
                    ++whiteIndex;
                    ++whiteKIndex;
                    ++blackIndex;
                    ++blackKIndex;
                }
            }
            return result;
        };
        Ai.prototype.estimateNodes = function (nodesToEstimate) {
            var _this = this;
            var positions = nodesToEstimate.map(function (n) { return _this.getPosArray(n.position); });
            var rates = estimate(positions);
            for (var index = 0; index < rates.length; ++index) {
                nodesToEstimate[index].setRate(rates[index]);
            }
        };
        Ai.prototype.rateGraph = function (node, height) {
            if (node.rated)
                return node.rate;
            var rate;
            if (height == 0) {
                throw new Error("leaf node wasn't estimated");
            }
            else {
                rate = (node.position.blackPlayer ? 1 : 0);
                for (var _i = 0, _a = node.nextPostions; _i < _a.length; _i++) {
                    var nextPos = _a[_i];
                    var nextRate = this.rateGraph(nextPos, height - 1);
                    if ((node.position.blackPlayer && rate > nextRate) || (!node.position.blackPlayer && rate < nextRate))
                        rate = nextRate;
                }
            }
            node.setRate(rate);
            return rate;
        };
        Ai.prototype.findBestMove = function (position, height, random) {
            var nodesToEstimate = new Array();
            var hash = new PassedNodes();
            var leavesHash = new PassedNodes();
            this.buildGraph(position, height, hash, leavesHash, nodesToEstimate);
            this.estimateNodes(nodesToEstimate);
            var node = hash.getNode(position);
            this.rateGraph(node, height);
            var moveCnt = node.moves.length;
            var bestIndex = -1;
            for (var index = 0; index < moveCnt; ++index) {
                if (bestIndex < 0 || (node.position.blackPlayer && node.nextPostions[index].rate < node.nextPostions[bestIndex].rate) || (!node.position.blackPlayer && node.nextPostions[index].rate > node.nextPostions[bestIndex].rate))
                    bestIndex = index;
            }
            return node.moves[bestIndex];
        };
        return Ai;
    }());
    Checkers.Ai = Ai;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=ai.js.map