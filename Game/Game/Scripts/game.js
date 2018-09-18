$(document).ready(function () {
    $(".black-cell").click(function () {
        var cellIndex = getCellIndexByCellId(this.id);
        if ($(this).hasClass("contains-movable-piece")) {
            $(".selected-for-move").removeClass("selected-for-move");
            $(".possible-move-target").removeClass("possible-move-target");
            $(this).addClass("selected-for-move");
            var cellIndex = getCellIndexByCellId(this.id);
            var possibleMoves = _currentPosition.findMovesFromCell(cellIndex);
            possibleMoves.forEach(function (move) {
                let targetCellIndex = move.getLastTargetCell();
                let targetCell = getCellByCellIndex(targetCellIndex);
                targetCell.addClass("possible-move-target");
            });
        }
        else if ($(this).hasClass("possible-move-target")) {
            var startCell = getCellIndexByCellId($(".selected-for-move").attr("id"));
            var selectedMove = _currentPosition.findMovesFromCell(startCell).filter(m => {
                var targetCell = m.getLastTargetCell();
                return (targetCell.row == cellIndex.row && targetCell.col == cellIndex.col);
            })[0];
            _currentPosition = selectedMove.end;
            updateDesk();
            startAiMove();
        }
    });

    $.ajax({
        url: "./TrainedModels/model_12.json",
        success: function (data) {
            _model_weights = data;
            _ai = new Checkers.Ai();
            startGame(false);

            $("#new_game_white").click(() => startGame(false));
            $("#new_game_black").click(() => startGame(true));
        }
    });
});

var _currentPosition;
var _blackPlayer;
var _ai;
function startGame(blackPlayer) {
    _currentPosition = new Checkers.Position();
    _currentPosition.initialize();
    _blackPlayer = blackPlayer;
    updateDesk();

    if (_blackPlayer) {
        $("#desk").addClass("rotated");
        startAiMove();
    }
    else {
        $("#desk").removeClass("rotated");
    }
}

function startAiMove() {
    $(".thinking").show();
    setTimeout(() => {
        let aiMove = _ai.findBestMove(_currentPosition, 7, 0.01);
        _currentPosition = aiMove.end;
        $(".thinking").hide();
        updateDesk();
    }, 500);
}

function updateDesk() {
    let classesToRemove = ["contains-black-simple", "contains-black-king", "contains-white-simple", "contains-white-king", "contains-movable-piece"];
    for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 4; ++col) {
            let cellId = "cell_" + row + "_" + col;
            var cell = $("#" + cellId);
            classesToRemove.forEach(function (className) {
                cell.removeClass(className);
            });
            let cellIndex = new Checkers.CellIndex(row, col);
            let cellValue = _currentPosition.getCellValue(cellIndex);

            if (cellValue == Checkers.WHITE_SIMPLE)
                cell.addClass("contains-white-simple");
            else if (cellValue == Checkers.WHITE_KING)
                cell.addClass("contains-white-king");
            else if (cellValue == Checkers.BLACK_SIMPLE)
                cell.addClass("contains-black-simple");
            else if (cellValue == Checkers.BLACK_KING)
                cell.addClass("contains-black-king");

            if (isMyPiece(cellIndex) && _currentPosition.findMovesFromCell(cellIndex).length > 0) {
                cell.addClass("contains-movable-piece");
            }
        }
    }
}

function isMyPiece(cellIndex) {
    let cellValue = _currentPosition.getCellValue(cellIndex);
    if (cellValue == Checkers.CellValue.Empty)
        return false;
    return ((_blackPlayer && (cellValue & Checkers.CellValue.Black)) || (!_blackPlayer && !(cellValue & Checkers.CellValue.Black)));
}

function getCellIndexByCellId(cellId) {
    let idParts = cellId.split("_");
    return cellIndex = new Checkers.CellIndex(Number(idParts[1]), Number(idParts[2]));
}

function getCellByCellIndex(cellIndex) {
    let cellId = "cell_" + cellIndex.row + "_" + cellIndex.col;
    return $("#" + cellId);
}