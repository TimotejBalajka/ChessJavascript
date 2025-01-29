// JavaScript source code
let legalSquares = [];
let isWhiteTurn = true;
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");


document.addEventListener("DOMContentLoaded", function () {
    setupBoardSquares();
    setupPieces();
});

function setupBoardSquares() {
    for (let i = 0; i < boardSquares.length; i++) {
        boardSquares[i].addEventListener("dragover", allowDrop);
        boardSquares[i].addEventListener("drop", drop);
        document.getElementById("restartButton").addEventListener("click", resetBoard);
        document.getElementById("saveButton").addEventListener("click", saveGameState);
        document.getElementById("loadButton").addEventListener("click", loadGameState);
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8));
        let square = boardSquares[i];
        square.id = column + row;
    }
}

function setupPieces() {
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id = pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
    }

    for (let i = 0; i < piecesImages.length; i++) {
        piecesImages[i].setAttribute("draggable", false);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    const piece = ev.target;
    //console.log("Dragging: " + piece.id);
    const pieceColor = piece.getAttribute("color");
    if ((isWhiteTurn && pieceColor == "white") || (!isWhiteTurn && pieceColor == "black")) {
        ev.dataTransfer.setData("text/plain", piece.id);

        const startSquare = piece.parentElement.id;
        ev.dataTransfer.setData("startSquare", startSquare);
    }
}

function validateMove(piece, startSquare, endSquare) {
    const pieceType = piece.getAttribute("class");
    const pieceColor = piece.getAttribute("color");
    const startX = startSquare.id.charCodeAt(0) - 97;
    const startY = 8 - parseInt(startSquare.id[1]);
    const endX = endSquare.id.charCodeAt(0) - 97;
    const endY = 8 - parseInt(endSquare.id[1]);

    // Validate based on piece type
    switch (pieceType) {
        case "piece pawn":
            return validatePawnMove(startX, startY, endX, endY, pieceColor, endSquare);
        case "piece rook":
            return validateRookMove(startX, startY, endX, endY);
        case "piece knight":
            return validateKnightMove(startX, startY, endX, endY);
        case "piece bishop":
            return validateBishopMove(startX, startY, endX, endY);
        case "piece queen":
            return validateQueenMove(startX, startY, endX, endY);
        case "piece king":
            return validateKingMove(startX, startY, endX, endY);
        default:
            return false;
    }
}

function validatePawnMove(startX, startY, endX, endY, color, endSquare) {
    const direction = color === "white" ? -1 : 1;
    const startingRow = color === "white" ? 6 : 1;

    // Normal move
    if (startX === endX && endY === startY + direction && isSquareOccupied(endSquare) === "blank") {
        return true;
    }

    // Initial double move
    if (startX === endX && startY === startingRow && endY === startY + 2 * direction &&
        isSquareOccupied(boardSquares[(startY + direction) * 8 + startX]) === "blank" &&
        isSquareOccupied(endSquare) === "blank") {
        return true;
    }

    // Capture
    if (Math.abs(endX - startX) === 1 && endY === startY + direction &&
        isSquareOccupied(endSquare) !== "blank" &&
        isSquareOccupied(endSquare) !== color) {
        return true;
    }

    return false;
}

function validateRookMove(startX, startY, endX, endY) {
    if (startX === endX || startY === endY) {
        return isRookPathClear(startX, startY, endX, endY, "piece rook");
    }
    return false;
}

function validateKnightMove(startX, startY, endX, endY) {
    const knightMoves = [
        [2, 1], [2, -1],
        [-2, 1], [-2, -1],
        [1, 2], [1, -2],
        [-1, 2], [-1, -2]
    ];
    return knightMoves.some(([dx, dy]) => startX + dx === endX && startY + dy === endY);
}

function validateBishopMove(startX, startY, endX, endY) {
    if (Math.abs(endX - startX) === Math.abs(endY - startY)) {
        return isBishopPathClear(startX, startY, endX, endY, "piece bishop");
    }
    return false;
}

function validateQueenMove(startX, startY, endX, endY) {
    const isDiagonal = Math.abs(endX - startX) === Math.abs(endY - startY);
    const isStraight = startX === endX || startY === endY;
    return (isDiagonal && isBishopPathClear(startX, startY, endX, endY, "piece queen")) ||
        (isStraight && isRookPathClear(startX, startY, endX, endY, "piece queen"));
}

function validateKingMove(startX, startY, endX, endY) {
    return Math.abs(endX - startX) <= 1 && Math.abs(endY - startY) <= 1;
}

function isMoveValid(piece, startSquare, endSquare) {
    const pieceColor = piece.getAttribute("color");
    const targetPiece = endSquare.querySelector(".piece");

    if (targetPiece && targetPiece.getAttribute("color") === pieceColor) {
        console.log("Cannot capture your own piece");
        return false;
    }

    if (!validateMove(piece, startSquare, endSquare)) {
        return false;
    }

    // Simulate move to check for king safety
    const originalParent = piece.parentElement;
    const capturedPiece = endSquare.querySelector(".piece");
    if (capturedPiece) {
        endSquare.removeChild(capturedPiece);
    }
    endSquare.appendChild(piece);

    const isKingSafe = !isCheck(piece.getAttribute("color"));

    // Revert the move
    originalParent.appendChild(piece);
    if (capturedPiece) {
        endSquare.appendChild(capturedPiece);
    }

    return isKingSafe;
}

function drop(ev) {
    ev.preventDefault();
    const pieceId = ev.dataTransfer.getData("text/plain");
    const piece = document.getElementById(pieceId);
    const startSquare = document.getElementById(ev.dataTransfer.getData("startSquare"));
    const endSquare = ev.currentTarget;

    if (!isMoveValid(piece, startSquare, endSquare)) {
        console.log("Invalid move");
        return;
    }

    // Execute the move
    const capturedPiece = endSquare.querySelector(".piece");
    const capturedPieceType = capturedPiece ? capturedPiece.getAttribute("class") : null;

    if (capturedPiece) {
        endSquare.removeChild(capturedPiece);
    }
    endSquare.appendChild(piece);

    const move = {
        piece: piece.className,
        color: piece.getAttribute("color"),
        start: startSquare.id,
        end: endSquare.id,
        captured: capturedPieceType,
    };
    moveHistory.push(move);

    // Display the move history
    updateMoveHistoryDisplay();

    if (piece.classList.contains("pawn") && (endSquare.id[1] === "1" || endSquare.id[1] === "8")) {
        const color = piece.getAttribute("color");
        promotePawn(piece, color);
    }

    isWhiteTurn = !isWhiteTurn;


    // Check for checkmate or check
    const currentPlayerColor = isWhiteTurn ? "white" : "black";
    if (isCheckmate(currentPlayerColor)) {
        console.log(`Checkmate! ${currentPlayerColor === "white" ? "Black" : "White"} wins!`);
        alert(`Checkmate! ${currentPlayerColor === "white" ? "Black" : "White"} wins!`);
    } else if (isCheck(currentPlayerColor)) {
        console.log(`${currentPlayerColor} is in check.`);
    } else {
        console.log("Move executed.");
    }
    console.log(piece.src);
}

function isSquareOccupied(square) {
    if (square.querySelector(".piece")) {
        const color = square.querySelector(".piece").getAttribute("color");
        return color;
    }
    else {
        return "blank";
    }
}

function isCheck(color) {
    const opponentColor = color === "white" ? "black" : "white";
    const kingSquare = findKing(color);

    // Check all opponent pieces to see if any can attack the king
    for (const square of boardSquares) {
        const piece = square.querySelector(".piece");
        if (piece && piece.getAttribute("color") === opponentColor) {
            const pieceType = piece.getAttribute("class");

            // Use existing movement functions to check if the piece can attack the king
            const startX = square.id.charCodeAt(0) - 97;
            const startY = 8 - parseInt(square.id[1]);
            const endX = kingSquare.id.charCodeAt(0) - 97;
            const endY = 8 - parseInt(kingSquare.id[1]);

            if (canAttack(piece, pieceType, startX, startY, endX, endY)) {
                return true;
            }
        }
    }
    return false;
}

function findKing(color) {
    for (const square of boardSquares) {
        const piece = square.querySelector(".piece");
        if (piece && piece.getAttribute("class") === "piece king" && piece.getAttribute("color") === color) {
            return square;
        }
    }
    return null;
}

function canAttack(piece, pieceType, startX, startY, endX, endY) {
    // Simulate movement logic for each piece
    switch (pieceType) {
        case "piece pawn":
            const direction = piece.getAttribute("color") === "white" ? -1 : 1;
            return (
                Math.abs(endX - startX) === 1 &&
                endY === startY + direction &&
                isSquareOccupied(boardSquares[endY * 8 + endX]) !== piece.getAttribute("color")
            );
        case "piece rook":
            return startX === endX || startY === endY ? isRookPathClear(startX, startY, endX, endY, pieceType) : false;
        case "piece bishop":
            return Math.abs(endX - startX) === Math.abs(endY - startY) ? isBishopPathClear(startX, startY, endX, endY, pieceType) : false;
        case "piece queen":
            const isDiagonal = Math.abs(endX - startX) === Math.abs(endY - startY);
            const isStraight = startX === endX || startY === endY;
            return (isDiagonal && isBishopPathClear(startX, startY, endX, endY, pieceType)) || (isStraight && isRookPathClear(startX, startY, endX, endY, pieceType));
        case "piece knight":
            const knightMoves = [
                [2, 1], [2, -1],
                [-2, 1], [-2, -1],
                [1, 2], [1, -2],
                [-1, 2], [-1, -2]
            ];
            return knightMoves.some(([dx, dy]) => startX + dx === endX && startY + dy === endY);
        case "piece king":
            return Math.abs(endX - startX) <= 1 && Math.abs(endY - startY) <= 1;
        default:
            return false;
    }
}

function isCheckmate(currentPlayerColor) {
    const kingInCheck = isCheck(currentPlayerColor); // Check if the king is currently in check
    if (!kingInCheck) return false; // If the king is not in check, it's not checkmate.

    // Iterate through all pieces of the current player
    for (const square of boardSquares) {
        const piece = square.querySelector(".piece");
        if (piece && piece.getAttribute("color") === currentPlayerColor) {
            const pieceType = piece.getAttribute("class");

            // Get all possible moves for the piece
            const startX = square.id.charCodeAt(0) - 97;
            const startY = 8 - parseInt(square.id[1]);

            for (let endX = 0; endX < 8; endX++) {
                for (let endY = 0; endY < 8; endY++) {
                    const endSquare = document.getElementById(String.fromCharCode(97 + endX) + (8 - endY));
                    if (endSquare) {
                        // Check if the move is valid
                        if (isMoveValid(piece, square, endSquare)) {
                            return false; // A legal move exists, so it's not checkmate.
                        }
                    }
                }
            }
        }
    }

    return true; // No legal moves found, checkmate!
}

function isRookPathClear(startX, startY, endX, endY, pieceType) {

    if (pieceType == "piece rook" || pieceType == "piece queen") {


        if (startX === endX) {
            const step = startY < endY ? 1 : -1;
            for (let y = startY + step; y !== endY; y += step) {
                const index = y * 8 + startX;
                if (isSquareOccupied(boardSquares[index]) !== "blank") {
                    return false;
                }
            }
        } else if (startY === endY) {
            const step = startX < endX ? 1 : -1;
            for (let x = startX + step; x !== endX; x += step) {
                const index = startY * 8 + x;
                if (isSquareOccupied(boardSquares[index]) !== "blank") {
                    return false;
                }
            }
        }

        return true;
    }
}


function isBishopPathClear(startX, startY, endX, endY, pieceType) {

    if (pieceType == "piece bishop" || pieceType == "piece queen") {

        const deltaX = endX > startX ? 1 : -1;
        const deltaY = endY > startY ? 1 : -1;

        let currentX = startX + deltaX;
        let currentY = startY + deltaY;

        while (currentX !== endX && currentY !== endY) {
            const squareIndex = currentY * 8 + currentX;
            const square = boardSquares[squareIndex];

            if (!square) {
                console.error(`Square at (${currentX}, ${currentY}) not found!`);
                return false;
            }

            if (isSquareOccupied(square) !== "blank") {
                return false;
            }

            currentX += deltaX;
            currentY += deltaY;
        }

        return true;
    }
}

function promotePawn(pawn, color) {
    // Create a modal for the user to choose the promoted piece
    const modal = document.createElement("div");
    modal.setAttribute("class", "promotion-modal");

    const options = ["queen", "rook", "bishop", "knight"];
    options.forEach((option) => {
        const button = document.createElement("button");
        button.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        button.addEventListener("click", () => {
            // Update the pawn to the selected piece
            const newPieceImage = `pieces/${color}${option}.png`;
            const pawnImg = pawn.querySelector("img");
            if (pawnImg) {
                pawnImg.src = newPieceImage;
            }
            pawn.setAttribute("class", `piece ${option}`);
            document.body.removeChild(modal); // Remove the modal
        });
        modal.appendChild(button);
    });

    document.body.appendChild(modal);
}


function resetBoard() {
    // Clear all squares
    localStorage.removeItem("chessGameState"); // Clear saved game state
    for (let square of boardSquares) {
        square.innerHTML = "";
    }

    // Reset pieces
    const initialSetup = {
        a1: "whiteRook", a2: "whitePawn", a7: "blackPawn", a8: "blackRook",
        b1: "whiteKnight", b2: "whitePawn", b7: "blackPawn", b8: "blackKnight",
        c1: "whiteBishop", c2: "whitePawn", c7: "blackPawn", c8: "blackBishop",
        d1: "whiteQueen", d2: "whitePawn", d7: "blackPawn", d8: "blackQueen",
        e1: "whiteKing", e2: "whitePawn", e7: "blackPawn", e8: "blackKing",
        f1: "whiteBishop", f2: "whitePawn", f7: "blackPawn", f8: "blackBishop",
        g1: "whiteKnight", g2: "whitePawn", g7: "blackPawn", g8: "blackKnight",
        h1: "whiteRook", h2: "whitePawn", h7: "blackPawn", h8: "blackRook",
    };

    for (const [squareId, piece] of Object.entries(initialSetup)) {
        const square = document.getElementById(squareId);
        const pieceDiv = document.createElement("div");
        pieceDiv.className = `piece ${piece.slice(5).toLowerCase()}`;
        pieceDiv.setAttribute("color", piece.startsWith("white") ? "white" : "black");
        pieceDiv.setAttribute("draggable", true);

        const pieceImg = document.createElement("img");
        pieceImg.src = `pieces/${piece}.png`;
        pieceImg.setAttribute("draggable", false);

        pieceDiv.appendChild(pieceImg);
        square.appendChild(pieceDiv);
    }

    // Reset turn
    isWhiteTurn = true;
    console.log("Board reset!");
    setupBoardSquares();
    setupPieces();
    moveHistory = [];
    updateMoveHistoryDisplay();
}

// Save the game state
function saveGameState() {
    const gameState = {
        pieces: [],
        turn: isWhiteTurn
    };

    for (let i = 0; i < boardSquares.length; i++) {
        const square = boardSquares[i];
        const piece = square.querySelector(".piece");

        if (piece) {
            const pieceInfo = {
                id: piece.id,
                color: piece.getAttribute("color"),
                type: piece.classList[1],
                squareId: square.id
            };
            gameState.pieces.push(pieceInfo);
        }
    }

    localStorage.setItem("chessGameState", JSON.stringify(gameState));
    localStorage.setItem("moveHistory", JSON.stringify(moveHistory)); // Save move history
    console.log("Game saved!");
}

// Load the game state
function loadGameState() {
    const savedGameState = localStorage.getItem("chessGameState");
    const savedMoveHistory = localStorage.getItem("moveHistory");

    if (savedGameState, savedMoveHistory) {
        const gameState = JSON.parse(savedGameState);

        // Clear the board first
        for (let square of boardSquares) {
            square.innerHTML = "";
        }

        // Place pieces back on the board
        for (const pieceInfo of gameState.pieces) {
            const square = document.getElementById(pieceInfo.squareId);
            const pieceDiv = document.createElement("div");
            pieceDiv.className = `piece ${pieceInfo.type}`;
            pieceDiv.setAttribute("color", pieceInfo.color);
            pieceDiv.setAttribute("draggable", true);

            const pieceImg = document.createElement("img");
            pieceImg.src = `pieces/${pieceInfo.color}${pieceInfo.type.charAt(0).toUpperCase() + pieceInfo.type.slice(1)}.png`;
            pieceImg.setAttribute("draggable", false);

            pieceDiv.appendChild(pieceImg);
            square.appendChild(pieceDiv);
        }

        if (savedMoveHistory) {
            moveHistory = JSON.parse(savedMoveHistory);
            updateMoveHistoryDisplay();
        }

        // Restore the turn
        isWhiteTurn = gameState.turn;
        console.log("Game loaded!");
        setupPieces();
    } else {
        console.log("No saved game found.");
    }
}

let moveHistory = [];

function deleteMoveHistory() {
    moveHistory = [];
}

function updateMoveHistoryDisplay() {
    const historyDiv = document.getElementById("moveHistory");
    historyDiv.innerHTML = ""; // Clear previous history

    moveHistory.forEach((move, index) => {
        const moveText = document.createElement("p");
        moveText.textContent = `${index + 1}. ${move.color} ${move.piece.split(" ")[1]} to ${move.end}` +
            (move.captured ? ` (Captured ${move.captured.split(" ")[1]})` : "");
        historyDiv.appendChild(moveText);
    });
}