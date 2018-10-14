function GameController(ai) {
    this.graphHeight = 6;
    this.randomFactor = 0.02;
    this.ai = ai;
    this.lastMove = null;
	this.initialPosition = new Checkers.Position();
	this.currentMove = null;
	this.positionCounts = new Checkers.PositionHash();
	this.drawCheckers = [new Checkers.PositionRepeatDrawChecker(), new Checkers.ThreeKingsDrawChecker()];

    initialize(this);

    function initialize(gameController) {
        gameController.initialPosition.initialize();

        $(".black-cell").click(function () {
			if ($(this).hasClass("movable-piece")) {
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
		var moveStartIndex = (this.currentMove != null) ? this.currentMove.getMoveStartCell() : this.getCellIndexByCellId(sender.id);
		var possibleMoves = this.getPositionOnMoveBegin().findMovesFromCell(moveStartIndex);
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
			let nextStepIndex = this.currentMove.steps.length;
			var possibleMoves = this.getPositionOnMoveBegin().findMovesFromCell(this.currentMove.getMoveStartCell())
				.filter(m => m.startsWith(this.currentMove.steps) && m.steps[nextStepIndex].to.equals(targetCellIndex));
			var step = possibleMoves[0].steps[nextStepIndex];
			this.currentMove.addStep(step);
		}

		if (!this.getPositionOnMoveBegin().findAllMoves().some(m => m.startsWith(this.currentMove.steps) && m.steps.length > this.currentMove.steps.length)) {
			this.lastMove = this.currentMove;
			this.lastMove.end.blackPlayer = !this.lastMove.end.blackPlayer;
			this.currentMove = null;
		}
		this.updateDesk();
		if (this.currentMove == null) {
			if (this.verifyLastMove())
				this.makeAiMove();
		}
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
			this.processAiMove(aiMove);
        }, 500);
	};

	this.processAiMove = function (aiMove, stepIndex = 0) {
		if (this.currentMove == null) {
			let pos = this.getPositionOnMoveBegin().copy();
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
			this.verifyLastMove();
		}
		else {
			this.updateDesk();
			setTimeout(() => this.processAiMove(aiMove, stepIndex), 500);
		}

	}

    this.updateDesk = function () {
		let classesToRemove = ["black-simple", "black-king", "white-simple", "white-king", "movable-piece", "selected-for-move", "possible-move-target", "last-moved-piece"];
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
                    cell.addClass("white-simple");
                else if (cellValue == Checkers.WHITE_KING)
                    cell.addClass("white-king");
                else if (cellValue == Checkers.BLACK_SIMPLE)
                    cell.addClass("black-simple");
                else if (cellValue == Checkers.BLACK_KING)
                    cell.addClass("black-king");

				if (this.currentMove != null && this.currentMove.getLastTargetCell().equals(cellIndex)) {
					cell.addClass("selected-for-move");
				}
                if (movableCellIndexes.some(c => c.equals(cellIndex))) {
                    cell.addClass("movable-piece");
                }
                if (this.lastMove != null && this.lastMove.getLastTargetCell().equals(cellIndex)) {
                    cell.addClass("last-moved-piece");
                }
            }
		}

		if (this.currentMove != null)
			this.onSelectPieceToMove($(".selected-for-move").first())
	};

	this.verifyLastMove = function () {
		var pos = this.lastMove.end;

		//check for win/loose
		if (pos.findAllMoves().length == 0) {
			if (pos.blackPlayer == this.userPlaysBlack)
				$(".lost").show();
			else
				$(".won").show();
			return false;
		}

		//check for draw
		for (let drawCheckerIndex = 0; drawCheckerIndex < this.drawCheckers.length; ++drawCheckerIndex) {
			let checker = this.drawCheckers[drawCheckerIndex];
			if (checker.check(pos, this.positionCounts)) {
				$(".draw-reason").text(checker.getDescription());
				$(".draw").show();
				return false;
			}
		}

		var prevPosCount = this.positionCounts.getValue(pos);
		if (prevPosCount == null)
			prevPosCount = 0;
		this.positionCounts.setValue(pos, prevPosCount + 1);
		return true;
	};

    this.getCellIndexByCellId = function (cellId) {
        let idParts = cellId.split("_");
        return cellIndex = new Checkers.CellIndex(Number(idParts[1]), Number(idParts[2]));
    };

    this.getCellByCellIndex = function (cellIndex) {
        let cellId = "cell_" + cellIndex.row + "_" + cellIndex.col;
        return $("#" + cellId);
    }

	this.startNewGame = function (userPlaysBlack) {
		$(".won").hide();
		$(".lost").hide();

        this.lastMove = null;
		this.userPlaysBlack = userPlaysBlack;
		this.positionCounts = new Checkers.PositionHash();
		this.drawCheckers.forEach(function (checker) {
			checker.reset();
		});

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