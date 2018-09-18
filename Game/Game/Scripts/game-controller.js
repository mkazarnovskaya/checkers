function GameController(ai) {
    this.graphHeight = 7;
    this.randomFactor = 0.01;
    this.ai = ai;
    initialize(this);

    function initialize(gameController) {
        $(".black-cell").click(function () {
            var cellIndex = gameController.getCellIndexByCellId(this.id);
            if ($(this).hasClass("contains-movable-piece")) {
                $(".selected-for-move").removeClass("selected-for-move");
                $(".possible-move-target").removeClass("possible-move-target");
                $(this).addClass("selected-for-move");
                var cellIndex = gameController.getCellIndexByCellId(this.id);
                var possibleMoves = gameController.currentPosition.findMovesFromCell(cellIndex);
                possibleMoves.forEach(function (move) {
                    let targetCellIndex = move.getLastTargetCell();
                    let targetCell = gameController.getCellByCellIndex(targetCellIndex);
                    targetCell.addClass("possible-move-target");
                });
            }
            else if ($(this).hasClass("possible-move-target")) {
                var startCell = gameController.getCellIndexByCellId($(".selected-for-move").attr("id"));
                var selectedMove = gameController.currentPosition.findMovesFromCell(startCell).filter(m => {
                    var targetCell = m.getLastTargetCell();
                    return (targetCell.row == cellIndex.row && targetCell.col == cellIndex.col);
                })[0];
                gameController.currentPosition = selectedMove.end;
                gameController.updateDesk();
                gameController.makeAiMove();
            }
        });
    }

    this.makeAiMove = function () {
        $(".thinking").show();
        setTimeout(() => {
            let aiMove = this.ai.findBestMove(this.currentPosition, this.graphHeight, this.randomFactor);
            this.currentPosition = aiMove.end;
            $(".thinking").hide();
            this.updateDesk();
        }, 500);
    };

    this.updateDesk = function () {
        let classesToRemove = ["contains-black-simple", "contains-black-king", "contains-white-simple", "contains-white-king", "contains-movable-piece", "selected-for-move"];
        for (let row = 0; row < 8; ++row) {
            for (let col = 0; col < 4; ++col) {
                let cellId = "cell_" + row + "_" + col;
                var cell = $("#" + cellId);
                classesToRemove.forEach(function (className) {
                    cell.removeClass(className);
                });
                let cellIndex = new Checkers.CellIndex(row, col);
                let cellValue = this.currentPosition.getCellValue(cellIndex);

                if (cellValue == Checkers.WHITE_SIMPLE)
                    cell.addClass("contains-white-simple");
                else if (cellValue == Checkers.WHITE_KING)
                    cell.addClass("contains-white-king");
                else if (cellValue == Checkers.BLACK_SIMPLE)
                    cell.addClass("contains-black-simple");
                else if (cellValue == Checkers.BLACK_KING)
                    cell.addClass("contains-black-king");

                if (this.isMyPiece(cellIndex) && this.currentPosition.findMovesFromCell(cellIndex).length > 0) {
                    cell.addClass("contains-movable-piece");
                }
            }
        }
    };

    this.isMyPiece = function (cellIndex) {
        let cellValue = this.currentPosition.getCellValue(cellIndex);
        if (cellValue == Checkers.CellValue.Empty)
            return false;
        return ((this.userPlaysBlack && (cellValue & Checkers.CellValue.Black)) || (!this.userPlaysBlack && !(cellValue & Checkers.CellValue.Black)));
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
        this.currentPosition = new Checkers.Position();
        this.currentPosition.initialize();
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