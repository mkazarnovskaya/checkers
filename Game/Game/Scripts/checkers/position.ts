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
						this.setPiece(cellIndex, CellValue.WhiteSimple);
					else if (row < 5)
						this.setPiece(cellIndex, CellValue.Empty);
					else
						this.setPiece(cellIndex, CellValue.BlackSimple);
				}
			}
		}

		getPiece(cellIndex) {
			return this.desk[cellIndex.row][cellIndex.col];
		}

		setPiece(cellIndex: CellIndex, piece: CellValue) {
			this.desk[cellIndex.row][cellIndex.col] = piece;
		}
	}
}