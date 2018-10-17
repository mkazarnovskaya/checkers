namespace Checkers {
	export class ThreeKingsDrawChecker implements IDrawChecker {
		maxCount: number;
		counter?: number;

		constructor() {
			this.maxCount = 30;
			this.counter = null;
		}

		reset(): void {
			this.counter = null;
		}

		getDescription(): string {
			return "The player having three kings (or more) against a single enemy king and his 15th move coudn't capture enemy king.";
		}

		check(lastMove: Move, postionCounts: PositionHash<number>): boolean {
			if (this.counter != null) {
				++this.counter;
				if (this.counter >= this.maxCount)
					return true;
				return false;
			}
			else {
				var pos = lastMove.end;
				let enemySimpleCount = 0;
				let enemyKingCount = 0;
				let mySimpleCount = 0;
				let myKingCount = 0;
				for (let row = 0; row < 8; ++row) {
					for (let col = 0; col < 4; ++col) {
						let cellIndex = new CellIndex(row, col);
						if (pos.isEmpty(cellIndex))
							continue;

						let cellValue = pos.getCellValue(cellIndex);
						if (pos.isMyPiece(cellIndex)) {
							if (cellValue & CellValue.King)
								++myKingCount;
							else
								++mySimpleCount;
						}
						else {
							if (cellValue & CellValue.King)
								++enemyKingCount;
							else
								++enemySimpleCount;
						}
					}
				}
				if ((enemySimpleCount == 0 && enemyKingCount == 1 && myKingCount >= 3) || (mySimpleCount == 0 && myKingCount == 1 && enemyKingCount >= 3))
					this.counter = 0;
				return false;
			}
		}
	}
}