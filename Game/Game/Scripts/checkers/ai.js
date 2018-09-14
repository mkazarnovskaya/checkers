var Checkers;
(function (Checkers) {
    var Node = /** @class */ (function () {
        //constructor 
        function Node(position) {
            this.position = position;
            this.rate = null;
        }
        Node.prototype.setRate = function (rate) {
            this.rate = rate;
        };
        Node.prototype.getMoves = function () {
            if (!this.movesCache)
                this.movesCache = this.position.findAllMoves();
            return this.movesCache;
        };
        return Node;
    }());
    var NodesHash = /** @class */ (function () {
        function NodesHash() {
            this.nodes = new Object();
        }
        NodesHash.prototype.hash = function (position) {
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
        NodesHash.prototype.getNodeByPosition = function (position) {
            var hash = this.hash(position);
            return this.nodes[hash];
        };
        NodesHash.prototype.addNode = function (node) {
            var hash = this.hash(node.position);
            if (this.nodes[hash])
                throw new Error("Node was already added.");
            this.nodes[hash] = node;
        };
        NodesHash.prototype.getAllNodes = function () {
            var _this = this;
            return Object.keys(this.nodes).map(function (nodeHash) { return _this.nodes[nodeHash]; });
        };
        NodesHash.prototype.getMoveRate = function (move) {
            return this.getNodeByPosition(move.end).rate;
        };
        return NodesHash;
    }());
    var Ai = /** @class */ (function () {
        function Ai() {
        }
        Ai.prototype.buildGraph = function (position, height, allNodes, nodesToEstimate) {
            var node = allNodes.getNodeByPosition(position);
            if (node == null) {
                node = new Node(position);
                allNodes.addNode(node);
            }
            if (height > 0) {
                var moves = node.getMoves();
                if (moves.length > 0) {
                    for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
                        var move = moves_1[_i];
                        this.buildGraph(move.end, height - 1, allNodes, nodesToEstimate);
                    }
                }
                else {
                    node.setRate(node.position.blackPlayer ? 1 : 0);
                }
            }
            else {
                if (nodesToEstimate.getNodeByPosition(node.position) == null) {
                    nodesToEstimate.addNode(node);
                }
            }
            return node;
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
        Ai.prototype.rateGraph = function (node, height, allNodes) {
            if (node.rate)
                return node.rate;
            var rate;
            if (height == 0) {
                throw new Error("leaf node wasn't estimated");
            }
            else {
                rate = (node.position.blackPlayer ? 1 : 0);
                for (var _i = 0, _a = node.getMoves(); _i < _a.length; _i++) {
                    var move = _a[_i];
                    var nextNode = allNodes.getNodeByPosition(move.end);
                    var nextRate = this.rateGraph(nextNode, height - 1, allNodes);
                    if ((node.position.blackPlayer && rate > nextRate) || (!node.position.blackPlayer && rate < nextRate))
                        rate = nextRate;
                }
            }
            node.setRate(rate);
            return rate;
        };
        Ai.prototype.findBestMove = function (position, height, randomFactor) {
            var passedNodes = new NodesHash();
            var nodesToEstimate = new NodesHash();
            var node = this.buildGraph(position, height, passedNodes, nodesToEstimate);
            this.estimateNodes(nodesToEstimate.getAllNodes());
            this.rateGraph(node, height, passedNodes);
            var bestRate;
            for (var _i = 0, _a = node.getMoves(); _i < _a.length; _i++) {
                var move = _a[_i];
                if (bestRate == null)
                    bestRate = passedNodes.getMoveRate(move);
                else {
                    var moveRate = passedNodes.getMoveRate(move);
                    if ((position.blackPlayer && moveRate < bestRate) || (!position.blackPlayer && moveRate > bestRate))
                        bestRate = moveRate;
                }
            }
            //filter moves with rate different from best rate not more than random factor
            var filteredMoves = node.getMoves().filter(function (move) {
                var moveRate = passedNodes.getMoveRate(move);
                return (Math.abs(moveRate - bestRate) <= randomFactor);
            });
            //return random element from filtered array
            var selectedMove = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
            //debug info
            var rates = estimate([this.getPosArray(position), this.getPosArray(selectedMove.end)]);
            console.log(node.rate + "(" + rates[0] + ") - " + passedNodes.getMoveRate(selectedMove) + "(" + rates[1] + ")");
            return selectedMove;
        };
        return Ai;
    }());
    Checkers.Ai = Ai;
})(Checkers || (Checkers = {}));
//# sourceMappingURL=ai.js.map