namespace Checkers {
	declare function estimate(pos: number[][]): number[]

	class Node {
		position: Position
		nextPostions: Node[]
		moves: Move[]
		rate: number
		rated: boolean

		//constructor 
		constructor(position: Position) {
			this.position = position
		}

        calculateNextPostions(allNodes: PassedNodes): number {
			this.moves = this.position.findAllMoves()
			this.nextPostions = this.moves.map(function (move) {
				let nextPos = move.end;
				let nextNode = allNodes.addNode(nextPos);
				return nextNode;
            });
            return this.nextPostions.length;
		}

		setRate(rate: number) {
			this.rate = rate;
			this.rated = true;
		}
	}

	class PassedNodes {
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


		getNode(position: Position): Node {
			let hash = this.hash(position);
			return this.nodes[hash];
		}

		addNode(position: Position): Node {
			let hash = this.hash(position);
			if (!this.nodes[hash])
				this.nodes[hash] = new Node(position);
			return this.nodes[hash];
		}
	}

	export class Ai {
		buildGraph(position: Position, height: number, allNodes: PassedNodes, leaves: PassedNodes, nodesToEstimate: Node[]):void {
			var node = allNodes.addNode(position);
            if (height == 0 || (node.calculateNextPostions(allNodes) == 0)) {
				if (leaves.getNode(node.position) == null) {
					leaves.addNode(node.position);
					nodesToEstimate.push(node);
				}
			}
			else {
				for (let nextPos of node.nextPostions) {
					this.buildGraph(nextPos.position, height - 1, allNodes, leaves, nodesToEstimate);
				}
			}
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
			let positions = nodesToEstimate.map(n => this.getPosArray(n.position));
			let rates = estimate(positions);
			for (let index = 0; index < rates.length; ++index) {
				nodesToEstimate[index].setRate(rates[index]);
			}
		}

		rateGraph(node: Node, height: number): number {
			if (node.rated)
				return node.rate;

			let rate: number
			if (height == 0) {
				throw new Error("leaf node wasn't estimated");
			}
			else {
				rate = (node.position.blackPlayer ? 1 : 0);
				for (let nextPos of node.nextPostions) {
					var nextRate = this.rateGraph(nextPos, height - 1);
					if ((node.position.blackPlayer && rate > nextRate) || (!node.position.blackPlayer && rate < nextRate))
						rate = nextRate;
				}
			}
			node.setRate(rate)
			return rate;
		}

		findBestMove(position: Position, height: number, random: number): Move {
			let nodesToEstimate = new Array<Node>();
			let hash = new PassedNodes();
			let leavesHash = new PassedNodes();
			this.buildGraph(position, height, hash, leavesHash, nodesToEstimate);
			this.estimateNodes(nodesToEstimate);
			let node = hash.getNode(position);
			this.rateGraph(node, height);

			let moveCnt = node.moves.length
			let bestIndex = -1
			for (let index = 0; index < moveCnt; ++index) {
				if (bestIndex < 0 || (node.position.blackPlayer && node.nextPostions[index].rate < node.nextPostions[bestIndex].rate) || (!node.position.blackPlayer && node.nextPostions[index].rate > node.nextPostions[bestIndex].rate))
					bestIndex = index
			}
			return node.moves[bestIndex];
		}
	}
}