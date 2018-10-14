namespace Checkers {
	export interface IDrawChecker {
		reset(): void;
		check(pos: Position, postionCounts: PositionHash<number>): boolean;
		getDescription(): string;
	}
}