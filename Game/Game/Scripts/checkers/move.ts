namespace Checkers {
	export class MoveStep {
		from: CellIndex
		to: CellIndex
		capturedCell: CellIndex

		constructor(from: CellIndex, to: CellIndex, capturedCell: CellIndex = null) {
			this.from = from;
			this.to = to;
			this.capturedCell = capturedCell;
		}

		captureFrom(): Direction {
			if (!this.capturedCell)
				return null;
			let result = 0;

			if (this.from.row > this.to.row)
				result |= Direction.Up;

			let colFrom = this.from.col;
			if ((this.from.row & 1) == 1)
				colFrom++;
			let colTo = this.to.col;
			if ((this.to.row & 1) == 1)
				colTo++;

			if (colFrom < colTo)
				result |= Direction.Right;

			return result;
		}

		toMove(startPosition: Position): Move {
			let endPostion = startPosition.copy();
			this.apply(endPostion)
			return new Move([this], endPostion);
		}

		apply(pos: Position) {
			let piece = pos.getCellValue(this.from);
			pos.setCellValue(this.from, CellValue.Empty);
			if (this.capturedCell)
				pos.setCellValue(this.capturedCell, CellValue.Empty);
			if (!(piece & CellValue.King)) {
				if ((this.to.row == 0 && piece & CellValue.Black) || (this.to.row == 7 && !(piece & CellValue.Black)))
					piece = (piece |CellValue.King);
			}
			pos.setCellValue(this.to, piece);
		}
	}

	export class Move {
		steps: MoveStep[]
		end: Position

		constructor(steps: MoveStep[], end: Position) {
			this.steps = steps;
			this.end = end;
		}

		lastStep(): MoveStep {
			return this.steps[this.steps.length - 1];
		}

		copy(): Move {
			let steps = this.steps.slice();
			let end = this.end.copy();
			return new Move(steps, end);
		}

		addStep(step: MoveStep) {
			this.steps.push(step);
			step.apply(this.end);
		}

		isCapturing(): boolean {
			return (this.lastStep().capturedCell != null);
		}

		getLastTargetCell(): CellIndex {
			return this.steps[this.steps.length - 1].to;
		}
	}
}