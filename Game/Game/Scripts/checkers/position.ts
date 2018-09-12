namespace Checkers {
	export class Position {
		desk: CellValue[][];
		blackPlayer: boolean;

		initialize() {
			this.blackPlayer = false;
			this.desk = new Array<CellValue[]>(8);
			for (let row: number = 0; row < 8; row++) {
				this.desk[row] = new Array<CellValue>(4);
			}

			for (let row = 0; row < 8; ++row) {
				for (let col = 0; col < 4; ++col) {
					let cellIndex = new CellIndex(row, col);
					if (row < 3)
						this.setCellValue(cellIndex, WHITE_SIMPLE);
					else if (row < 5)
						this.setCellValue(cellIndex, CellValue.Empty);
					else
						this.setCellValue(cellIndex, BLACK_SIMPLE);
				}
			}
		}

		getCellValue(cellIndex) {
			return this.desk[cellIndex.row][cellIndex.col];
		}

		setCellValue(cellIndex: CellIndex, piece: CellValue) {
			this.desk[cellIndex.row][cellIndex.col] = piece;
		}

		copy(): Position {
			let result = new Position();
			result.blackPlayer = this.blackPlayer
			result.desk = this.desk.map(function (line) {
				return line.slice();
			});
			return result;
		}

		isMyPiece(cellIndex: CellIndex): boolean {
			let cellValue = this.getCellValue(cellIndex);
			if (cellValue == CellValue.Empty)
				return false;
			let pieceIsBlack = ((cellValue & CellValue.Black) == CellValue.Black);
			return (pieceIsBlack == this.blackPlayer);
		}

		isEmpty(cellIndex: CellIndex) {
			let cellValue = this.getCellValue(cellIndex);
			return (cellValue == CellValue.Empty);
		}

		findFirstNotEmptyCell(start: CellIndex, dir: Direction): CellIndex {
			let cell = start.next(dir);
			while (cell && this.isEmpty(cell))
				cell = cell.next(dir);
			return cell;
		}

		findMoveStepsByDirectionSimple(from: CellIndex, dir: Direction, shouldBeat: boolean): MoveStep[] {
			let steps = new Array<MoveStep>();
			let nextCellIndex = from.next(dir);
			if (!nextCellIndex)
				return steps;
			if (this.isEmpty(nextCellIndex)) {
				let down = ((dir & Direction.Up) == 0);
				let backward = ((down && !this.blackPlayer) || (!down && this.blackPlayer));
				if (backward) {
						return steps;
				}
				else if (!shouldBeat) {
					let step = new MoveStep(from, nextCellIndex);
					steps.push(step);
				}
			}
			else if (!this.isMyPiece(nextCellIndex)) {
				let nextAfterNext = nextCellIndex.next(dir);
				if (nextAfterNext && this.isEmpty(nextAfterNext)) {
					let step = new MoveStep(from, nextAfterNext, nextCellIndex);
					steps.push(step);
				}
			}
			return steps;
		}

		findMoveStepsByDirectionKing(from: CellIndex, dir: Direction, shouldBeat: boolean): MoveStep[] {
			let steps = new Array<MoveStep>();

			let cellToCaptureIndex = this.findFirstNotEmptyCell(from, dir);
			if (cellToCaptureIndex && !this.isMyPiece(cellToCaptureIndex)) {
				for (let to = cellToCaptureIndex.next(dir); to && this.isEmpty(to); to = to.next(dir)) {
					let step = new MoveStep(from, to, cellToCaptureIndex);
					steps.push(step);
				}
			}
            if (!shouldBeat && steps.length == 0) {
				let nextCellIndex = from.next(dir);
				if (!nextCellIndex)
					return steps;
				for (let to = nextCellIndex; to && this.isEmpty(to); to = to.next(dir)) {
					let step = new MoveStep(from, to);
					steps.push(step);
				}
			}
			return steps;
		}

		findMoveSteps(from: CellIndex, shouldCapture = false, beatFromDir?: Direction): MoveStep[] {
			let steps = new Array<MoveStep>()
			if (beatFromDir != null)
				shouldCapture = true;
			let fromValue = this.getCellValue(from);

			for (let dir of ALL_MOVE_DIRECTIONS) {
				if (dir == beatFromDir)
					continue;

				let dirSteps: MoveStep[];
				if (fromValue & CellValue.King)
					dirSteps = this.findMoveStepsByDirectionKing(from, dir, shouldCapture);
				else
					dirSteps = this.findMoveStepsByDirectionSimple(from, dir, shouldCapture);

				if (dirSteps.length > 0 && dirSteps[0].capturedCell && !shouldCapture) {
					shouldCapture = true;
					steps = steps.filter((step) => (step.capturedCell))
				}

				for (let step of dirSteps)
					steps.push(step);
			}
			return steps;
		}

		completeMoves(notCompletedMoves: Move[]): Move[] {
			let completedMoves = new Array<Move>()
			while (notCompletedMoves.length > 0) {
				let move = notCompletedMoves.pop();
				let lastStep = move.lastStep()
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

				let lastIndex = nextSteps.length - 1;
				for (let nextStepIndex = 0; nextStepIndex < nextSteps.length; ++nextStepIndex) {
					let extendedMove: Move;
					if (nextStepIndex < lastIndex)
						extendedMove = move.copy();
					else
						extendedMove = move;
					extendedMove.addStep(nextSteps[nextStepIndex]);
					notCompletedMoves.push(extendedMove);
				}

			}
			return completedMoves
		}

		findMovesFromCell(cellIndex: CellIndex, shouldCapture = false): Move[] {
			let firstSteps = this.findMoveSteps(cellIndex, shouldCapture);
			let notCompletedMoves = firstSteps.map(step => step.toMove(this));
			let moves = this.completeMoves(notCompletedMoves)
			return moves;
		}

		findAllMoves(): Move[] {
			let moves = new Array<Move>();
			let shouldCapture = false;
			for (let row = 0; row < 8; ++row) {
				for (let col = 0; col < 4; ++col) {
					let cellIndex = new CellIndex(row, col)
					if (this.isMyPiece(cellIndex)) {
						var movesFromCell = this.findMovesFromCell(cellIndex, shouldCapture)
						for (let move of movesFromCell) {
							if (move.isCapturing() && !shouldCapture) {
								shouldCapture = true;
								moves = moves.filter((move) => (move.isCapturing()));
							}
							if (!shouldCapture || move.isCapturing())
								moves.push(move)
						}
					}
				}
			}
			return moves;
		}
	}
}