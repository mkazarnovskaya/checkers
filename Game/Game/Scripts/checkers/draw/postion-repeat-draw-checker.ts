namespace Checkers {
	export class PositionRepeatDrawChecker implements IDrawChecker {
		reset(): void {
		}

		getDescription(): string {
			return "The same position repeats itself for the third time.";
		}

		check(pos: Position, postionCounts: PositionHash<number>): boolean {
			return (postionCounts.getValue(pos) >= 3);
		}
	}
}