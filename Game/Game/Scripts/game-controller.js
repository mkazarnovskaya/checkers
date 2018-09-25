function GameController(ai) {
    this.graphHeight = 7;
    this.randomFactor = 0.01;
    this.ai = ai;
    this.lastMove = null;
	this.initialPosition = new Checkers.Position();
	this.currentMove = null;

    initialize(this);

    function initialize(gameController) {
        gameController.initialPosition.initialize();

        $(".black-cell").click(function () {
			if ($(this).hasClass("contains-movable-piece")) {
				gameController.onSelectPieceToMove(this);
            }
			else if ($(this).hasClass("possible-move-target")) {
				gameController.onSelectMoveTargetCell(this);
            }
        });
	}

	this.onSelectPieceToMove = function (sender) {
		$(".selected-for-move").removeClass("selected-for-move");
		$(".possible-move-target").removeClass("possible-move-target");
		$(sender).addClass("selected-for-move");
		var cellIndex = this.getCellIndexByCellId(sender.id);
		var possibleMoves = this.getPositionOnMoveBegin().findMovesFromCell(cellIndex);
		if (this.currentMove != null)
			possibleMoves = possibleMoves.filter(m => m.startsWith(this.currentMove.steps));
		possibleMoves.forEach(function (move) {
			let stepIndex = (this.currentMove != null) ? this.currentMove.steps.length : 0;
			let targetCellIndex = move.steps[stepIndex].to;
			let targetCell = this.getCellByCellIndex(targetCellIndex);
			targetCell.addClass("possible-move-target");
		}, this);
	}

	this.onSelectMoveTargetCell = function (sender) {
		var selectedCellIndex = this.getCellIndexByCellId($(".selected-for-move").attr("id"));
		var targetCellIndex = this.getCellIndexByCellId(sender.id);
		if (this.currentMove == null) {
			var step = this.getPositionOnCurrentStep().findMoveSteps(selectedCellIndex).filter(s => s.to.equals(targetCellIndex))[0];
			var pos = this.getPositionOnMoveBegin().copy();
			step.apply(pos);
			this.currentMove = new Checkers.Move([step], pos);
		}
		else {
			var possibleMoves = this.getPositionOnMoveBegin().findMovesFromCell(this.currentMove.steps[0].from)
				.filter(m = m.startsWith(this.currentMove.steps) && m.steps[this.currentMove.steps.length].to.equals(targetCellIndex));
			var step = possibleMoves[0].steps[this.currentMove.steps.length];
			this.currentMove.addStep(step);
		}

		if (!this.getPositionOnMoveBegin().findAllMoves().some(m => m.startsWith(this.currentMove.steps) && m.steps.length > this.currentMove.steps.length)) {
			this.lastMove = this.currentMove;
			this.lastMove.end.blackPlayer = !this.lastMove.end.blackPlayer;
			this.currentMove = null;
		}
		this.updateDesk();
		if (this.currentMove == null)
			this.makeAiMove();
	}

    this.getPositionOnMoveBegin = function () {
        return (this.lastMove != null) ? this.lastMove.end : this.initialPosition;
	}

	this.getPositionOnCurrentStep = function () {
		return (this.currentMove != null) ? this.currentMove.end : this.getPositionOnMoveBegin();
	}

    this.makeAiMove = function () {
        $(".thinking").show();
        setTimeout(() => {
            let aiMove = this.ai.findBestMove(this.getPositionOnMoveBegin(), this.graphHeight, this.randomFactor);
			$(".thinking").hide();
			this.displayAiMove(aiMove);
        }, 500);
	};

	this.displayAiMove = function (aiMove, stepIndex = 0) {
		if (this.currentMove == null) {
			let pos = this.lastMove.end.copy();
			let fistStep = aiMove.steps[0];
			fistStep.apply(pos);
			this.currentMove = new Checkers.Move([fistStep], pos);
		}
		else {
			this.currentMove.addStep(aiMove.steps[stepIndex]);
		}
		++stepIndex;
		if (stepIndex >= aiMove.steps.length) {
			this.lastMove = aiMove;
			this.currentMove = null;
			this.updateDesk();
		}
		else {
			this.updateDesk();
			setTimeout(() => this.displayAiMove(aiMove, stepIndex), 500);
		}

	}

    this.updateDesk = function () {
		let classesToRemove = ["contains-black-simple", "contains-black-king", "contains-white-simple", "contains-white-king", "contains-movable-piece", "selected-for-move", "possible-move-target", "last-moved-piece"];
		var movableCellIndexes = (this.currentMove == null) ? this.getPositionOnMoveBegin().findAllMoves().map(m => m.steps[0].from) : [this.currentMove.getLastTargetCell()];
        for (let row = 0; row < 8; ++row) {
            for (let col = 0; col < 4; ++col) {
                let cellId = "cell_" + row + "_" + col;
                var cell = $("#" + cellId);
                classesToRemove.forEach(function (className) {
                    cell.removeClass(className);
                });
                let cellIndex = new Checkers.CellIndex(row, col);
				let cellValue = this.getPositionOnCurrentStep().getCellValue(cellIndex);

                if (cellValue == Checkers.WHITE_SIMPLE)
                    cell.addClass("contains-white-simple");
                else if (cellValue == Checkers.WHITE_KING)
                    cell.addClass("contains-white-king");
                else if (cellValue == Checkers.BLACK_SIMPLE)
                    cell.addClass("contains-black-simple");
                else if (cellValue == Checkers.BLACK_KING)
                    cell.addClass("contains-black-king");

                if (movableCellIndexes.some(c => c.equals(cellIndex))) {
                    cell.addClass("contains-movable-piece");
                }
                if (this.lastMove != null && this.lastMove.getLastTargetCell().equals(cellIndex)) {
                    cell.addClass("last-moved-piece");
                }
            }
        }
    };

    this.getCellIndexByCellId = function (cellId) {
        let idParts = cellId.split("_");
        return cellIndex = new Checkers.CellIndex(Number(idParts[1]), Number(idParts[2]));
    };

    this.getCellByCellIndex = function (cellIndex) {
        let cellId = "cell_" + cellIndex.row + "_" + cellIndex.col;
        return $("#" + cellId);
    }

    this.startNewGame =  function (userPlaysBlack) {
        this.lastMove = null;
        this.userPlaysBlack = userPlaysBlack;
        this.updateDesk();

        if (this.userPlaysBlack) {
            $("#desk").addClass("rotated");
            this.makeAiMove();
        }
        else {
            $("#desk").removeClass("rotated");
        }
    }

    return this;
}