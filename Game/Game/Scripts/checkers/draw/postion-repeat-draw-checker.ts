namespace Checkers {
	export class PositionRepeatDrawChecker implements IDrawChecker {
		reset(): void {
		}

		getDescription(): string {
			return "The same position repeats itself for the third time.";
		}

		check(lastMove: Move, postionCounts: PositionHash<number>): boolean {
			var pos = lastMove.end;
			return (postionCounts.getValue(pos) >= 3);
		}
	}
}