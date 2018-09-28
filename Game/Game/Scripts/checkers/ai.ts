namespace Checkers {
	declare function estimate(pos: number[][]): number[]

	class Node {
		position: Position
		movesCache: Move[]
		rate: number

		//constructor 
		constructor(position: Position) {
            this.position = position
            this.rate = null;
		}

		setRate(rate: number) {
			this.rate = rate;
        }

        getMoves(): Move[] {
            if (!this.movesCache)
                this.movesCache = this.position.findAllMoves();
            return this.movesCache;
        }
	}

	class NodesHash {
		nodes: Object;

		constructor() {
			this.nodes = new Object();
		}

		hash(position: Position): string {
			let key0 = position.blackPlayer ? "1" : "2";
			let key1 = 0;
			let key2 = 0;
			let key3 = 0;

			let index = 0;
			for (let row = 0; row < 8; ++row) {
				for (let col = 0; col < 4; ++col) {
					let cellValue = position.desk[row][col];
					if (cellValue == 0)
						cellValue = 0b110;
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
		}


		getNodeByPosition(position: Position): Node {
			let hash = this.hash(position);
			return this.nodes[hash];
		}

		addNode(node:Node): void {
			let hash = this.hash(node.position);
            if (this.nodes[hash])
                throw new Error("Node was already added.")
			this.nodes[hash] = node;
        }

        getAllNodes(): Node[] {
            return Object.keys(this.nodes).map(nodeHash => this.nodes[nodeHash]);
        }

		getMoveRate(move: Move): number {
            return this.getNodeByPosition(move.end).rate;
        }
	}

	export class Ai {
        buildGraph(position: Position, height: number, allNodes: NodesHash, nodesToEstimate: NodesHash):Node {
            var node = allNodes.getNodeByPosition(position);
            if (node == null) {
                node = new Node(position);
                allNodes.addNode(node);
            }

            if (height > 0) {
                var moves = node.getMoves();
                if (moves.length > 0) {
                    for (let move of moves)
                        this.buildGraph(move.end, height - 1, allNodes, nodesToEstimate);
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
		}

		getPosArray(position: Position): number[] {
			let result = new Array<number>(129)
			result[128] = position.blackPlayer ? 1 : 0

			let whiteIndex = 0
			let whiteKIndex = 32
			let blackIndex = 64
			let blackKIndex = 96

			for (let row = 0; row < 8; ++row) {
				for (let col = 0; col < 4; ++col) {
					result[whiteIndex] = 0
					result[whiteKIndex] = 0
					result[blackIndex] = 0
					result[blackKIndex] = 0


					let value = position.desk[row][col]
					switch (value) {
						case WHITE_SIMPLE:
							result[whiteIndex] = 1
							break;
						case BLACK_SIMPLE:
							result[blackIndex] = 1
							break;
						case WHITE_KING:
							result[whiteKIndex] = 1
							break;
						case BLACK_KING:
							result[blackKIndex] = 1
							break;
					}
					++whiteIndex
					++whiteKIndex
					++blackIndex
					++blackKIndex
				}
			}
			return result
		}

		estimateNodes(nodesToEstimate: Node[]): void {
			if (nodesToEstimate.length == 0)
				return;
			let positions = nodesToEstimate.map(n => this.getPosArray(n.position));
			let rates = estimate(positions);
			for (let index = 0; index < rates.length; ++index) {
				nodesToEstimate[index].setRate(rates[index][0]);
			}
		}

        rateGraph(node: Node, height: number, allNodes: NodesHash): number {
			if (height == 0 || node.getMoves().length == 0) {
                if (node.rate != null)
                    return node.rate;
				throw new Error("leaf node wasn't estimated");
			}

			let rate = (node.position.blackPlayer ? 1 : 0);
            for (let move of node.getMoves()) {
                let nextNode = allNodes.getNodeByPosition(move.end);
				var nextRate = this.rateGraph(nextNode, height - 1, allNodes);
				if ((node.position.blackPlayer && rate > nextRate) || (!node.position.blackPlayer && rate < nextRate))
					rate = nextRate;
			}

			node.setRate(rate)
			return rate;
		}

		findBestMove(position: Position, height: number, randomFactor: number): Move {
			let passedNodes = new NodesHash();
            let nodesToEstimate = new NodesHash();
			let node = this.buildGraph(position, height, passedNodes, nodesToEstimate);
			this.estimateNodes(nodesToEstimate.getAllNodes());
			this.rateGraph(node, height,passedNodes);

            let bestRate: number;
            for (let move of node.getMoves()) {
                if (bestRate == null)
                    bestRate = passedNodes.getMoveRate(move);
                else {
                    let moveRate = passedNodes.getMoveRate(move);
                    if ((position.blackPlayer && moveRate < bestRate) || (!position.blackPlayer && moveRate > bestRate))
                        bestRate = moveRate;
                }
			}

			if (bestRate == null)
				return null;

            //filter moves with rate different from best rate not more than random factor
            let filteredMoves = node.getMoves().filter(function (move) {
                let moveRate = passedNodes.getMoveRate(move);
                return (Math.abs(moveRate - bestRate) <= randomFactor);
            });

            //return random element from filtered array
            let selectedMove = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];

            //debug info
            let rates = estimate([this.getPosArray(position), this.getPosArray(selectedMove.end)]);
            console.log(node.rate + "(" + rates[0] + ") - " + passedNodes.getMoveRate(selectedMove) + "(" + rates[1] + ")");
            console.log("(" + selectedMove.steps[0].from.col + "," + +selectedMove.steps[0].from.row + ") - (" + + selectedMove.steps[selectedMove.steps.length - 1].to.col + "," + +selectedMove.steps[selectedMove.steps.length - 1].to.row + ")");

            return selectedMove;
		}
	}
}