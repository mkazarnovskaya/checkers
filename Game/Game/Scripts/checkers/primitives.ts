namespace Checkers {
	export enum CellValue {
		Empty =	0b000,
		Occupied = 0b001,
		Black = 0b010,
		King = 0xb100,
		WhiteSimple = 0b001,
		BlackSimple = 0b011,
		WhiteKing = 0b101,
		BlackKing = 0b111,
	}

	export enum Direction {
		Up = 0b01,
		Right = 0b10,
	}

	export class CellIndex {
		row: number;
		col: number;

		constructor(row: number, col: number) {
			this.row = row;
			this.col = col;
		}

		next(dir: Direction): CellIndex {
			let nextRow = ((dir & Direction.Up) == Direction.Up) ? this.row + 1 : this.row - 1;
			if (nextRow < 0 || nextRow > 7)
				return null;
			let nextCol: number;
			if ((dir & Direction.Right) == Direction.Right) //right
				nextCol = ((this.row & 1) == 0) ? this.col : this.col + 1;
			else //left
				nextCol = ((this.row & 1) == 0) ? this.col - 1 : this.col;
			if (nextCol < 0 || nextCol > 3)
				return null;

			return new CellIndex(nextRow, nextCol);
		}
	}
}