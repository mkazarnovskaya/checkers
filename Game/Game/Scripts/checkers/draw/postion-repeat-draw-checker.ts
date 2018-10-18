namespace Checkers {
	export class PositionRepeatDrawChecker implements IDrawChecker {
		reset(): void {
		}

		getDescription(): string {
			return "The same position was repeated three times.";
		}

		check(lastMove: Move, postionCounts: PositionHash<number>): boolean {
			var pos = lastMove.end;
			return (postionCounts.getValue(pos) >= 3);
		}
	}
}