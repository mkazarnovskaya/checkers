namespace Checkers {
	export class KingMovesOnlyDrawChecker implements IDrawChecker {
		maxCount: number;
		counter?: number;
		totalKingCount: number;

		constructor() {
			this.maxCount = 30;
			this.totalKingCount = 0;
			this.counter = null;
		}

		reset(): void {
			this.totalKingCount = 0;
			this.counter = null;
		}

		getDescription(): string {
			return "Only kings were moved during 15 moves without any captures.";
		}

		check(lastMove: Move, postionCounts: PositionHash<number>): boolean {
			var pos = lastMove.end;
			let conditionBroken = false;
			var newTotalKingCount = this.getTotalKingCount(pos);
			if (newTotalKingCount != this.totalKingCount) {
				this.totalKingCount = newTotalKingCount;
				//number of kings changed
				conditionBroken = true;
			}
			else {
				if (lastMove.isCapturing()) {
					//the current move is capturing
					conditionBroken = true;
				}
				else {
					let targetCellValue = pos.getCellValue(lastMove.getLastTargetCell());
					if ((targetCellValue & CellValue.King) == 0) {
						//moving piece is not king
						conditionBroken = true;
					}
				}
			}
			if (conditionBroken) {
				this.counter = null;
				return false;
			}

			if (this.counter == null)
				this.counter = 0;
			else
				++this.counter;
			return (this.counter >= 30);
		}

		getTotalKingCount(pos: Position) {
			let kingCount = 0;
			for (let row = 0; row < 8; ++row) {
				for (let col = 0; col < 4; ++col) {
					let cellIndex = new CellIndex(row, col);
					let cellValue = pos.getCellValue(cellIndex);
					if (cellValue & CellValue.King)
						++kingCount;
				}
			}
			return kingCount;
		}
	}
}