namespace Checkers {
	export enum CellValue {
		Empty =	0b000,
		Occupied = 0b001,
		Black = 0b010,
		King = 0b100,
	}

	export enum Direction {
		Up = 0b01,
		Right = 0b10,
	}

	export let ALL_MOVE_DIRECTIONS: Direction[] = [Direction.Up | Direction.Right, Direction.Up, 0b00, Direction.Right];

	export let WHITE_SIMPLE = CellValue.Occupied;
	export let WHITE_KING = CellValue.Occupied | CellValue.King;
	export let BLACK_SIMPLE = CellValue.Occupied | CellValue.Black;
	export let BLACK_KING = CellValue.Occupied | CellValue.Black | CellValue.King;

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

		equals(other: CellIndex): boolean{
			if (other == null)
				return false;
            return (this.row == other.row && this.col == other.col);
        }
	}
}