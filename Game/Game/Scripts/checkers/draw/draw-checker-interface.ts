namespace Checkers {
	export interface IDrawChecker {
		reset(): void;
		check(lastMove: Move, postionCounts: PositionHash<number>): boolean;
		getDescription(): string;
	}
}