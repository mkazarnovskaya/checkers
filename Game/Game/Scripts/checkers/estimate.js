var _model_weights;

function estimate(position) {
	let input = new ML.Matrix(position);
	layer1_times = new ML.Matrix(_model_weights.layer1_times);
	layer1_plus = new ML.Matrix([_model_weights.layer1_plus]);
	//layer1 = input.mmul(layer1_times);
	layer1 = bmul(input, layer1_times);
	layer1 = layer1.addRowVector(layer1_plus);
	layer1 = layer1.mul(-1);
	layer1 = layer1.exp();
	layer1.apply((i, j) => layer1.set(i, j, 1 / (1 + layer1.get(i, j))));
	layer2_times = new ML.Matrix(_model_weights.layer2_times);
	layer2 = layer1.mmul(layer2_times);
	layer2_plus = new ML.Matrix([_model_weights.layer2_plus]);
	layer2 = layer2.addRowVector(layer2_plus);
	layer2 = layer2.mul(-1);
	layer2 = layer2.exp();
	layer2.apply((i, j) => layer2.set(i, j, 1 / (1 + layer2.get(i, j))));
	return layer2;

}

function bmul(bmatrix, matrix) {
	let rowCnt = bmatrix.rows;
	let colCnt = matrix.columns;
	let resultMatrix = ML.Matrix.zeros(rowCnt, colCnt);
	let innerCnt = matrix.rows;
	for (let rowIndex = 0; rowIndex < rowCnt; ++rowIndex) {
		//let bRow = bmatrix.getRow(rowIndex);
		//let newRow = [];
		//for (let colIndex = 0; colIndex < colCnt; ++colIndex)
		//	newRow[colIndex] = 0;

		for (let inner = 0; inner < innerCnt; ++inner) {
			if (bmatrix.get(rowIndex, inner) != 0) {
				for (let colIndex = 0; colIndex < colCnt; ++colIndex) {
					let value = resultMatrix.get(rowIndex, colIndex);
					value += matrix.get(inner, colIndex);
					resultMatrix.set(rowIndex, colIndex, value);
					//newRow[colIndex] += matrix.get(inner, colIndex);
				}
			}
		}
		//resultMatrix.setRow(rowIndex, newRow);
	}
	return resultMatrix;
}

