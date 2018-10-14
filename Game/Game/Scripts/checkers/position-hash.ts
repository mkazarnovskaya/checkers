namespace Checkers {
	export class PositionHash<T> {
		hashObject: Object;

		constructor() {
			this.hashObject = new Object();
		}

		hash(position: Position): string {
			let key0 = position.blackPlayer ? "1" : "2";
			let key1 = 0;
			let key2 = 0;
			let key3 = 0;

			let index = 0;
			for (let row = 0; row < 8; ++row) {
				for (let col = 0; col < 4; ++col) {
					let cellValue = position.desk[row][col];
					if (cellValue == 0)
						cellValue = 0b110;
					if (index < 10) {
						key1 = ((key1 << 3) | cellValue);
					}
					else if (index == 10) {
						key1 = ((key1 << 2) | (cellValue >> 1));
						key2 = (cellValue & 1);
					}
					else if (index < 21) {
						key2 = ((key2 << 3) | cellValue);
					}
					else if (index == 21) {
						key2 = ((key2 << 1) | (cellValue & 1));
						key3 = (cellValue >> 1);
					}
					else {
						key3 = ((key3 << 3) | cellValue);
					}

					++index;
				}
			}
			return (key0 + "x" + new String(key1) + "x" + new String(key2) + "x" + new String(key3));
		}


		getValue(position: Position): T {
			let hash = this.hash(position);
			return this.hashObject[hash];
		}

		addValue(position :Position, value: T): void {
			let hash = this.hash(position);
			if (this.hashObject[hash])
				throw new Error("Value was already added for this posion.")
			this.hashObject[hash] = value;
		}

		setValue(position: Position, value: T): void {
			let hash = this.hash(position);
			this.hashObject[hash] = value;
		}

		getAllValues(): T[] {
			return Object.keys(this.hashObject).map(nodeHash => this.hashObject[nodeHash]);
		}
	}
}