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

function drop(ev) {
    ev.preventDefault();
    const pieceId = ev.dataTransfer.getData("text/plain");
    const startSquare = ev.dataTransfer.getData("startSquare");
    const piece = document.getElementById(pieceId);
    //console.log("Dropping on: " + ev.currentTarget.id);
    const destination = ev.currentTarget;
    const endSquare = destination.id;

    const pieceType = piece.getAttribute("class")
    const pieceColor = piece.getAttribute("color");

    const startX = startSquare.charCodeAt(0) - 97;
    const startY = 8 - parseInt(startSquare[1]);
    const endX = endSquare.charCodeAt(0) - 97;
    const endY = 8 - parseInt(endSquare[1]);


    if ((isWhiteTurn && pieceColor !== "white") || (!isWhiteTurn && pieceColor !== "black")) {
        return;
    }

    console.log(`Start: (${startX}, ${startY})`);
    console.log(`End: (${endX}, ${endY})`);

    if (pieceType == "piece pawn") {

        let direction;
        if (pieceColor === "white") { direction = -1; }
        else if (pieceColor === "black") { direction = 1; }

        if (pieceColor === "white") { startingRow = 6 }
        else if (pieceColor === "black") { startingRow = 1 }

        if (startX === endX && endY === startY + direction) {
            if (isSquareOccupied(destination) == "blank") {
                destination.appendChild(piece);
                isWhiteTurn = !isWhiteTurn;
            }

            if (isSquareOccupied(destination) !== pieceColor) {
                return;
            }
        }

        if (startX === endX && startY === startingRow && endY === startY + (2 * direction) && isSquareOccupied(boardSquares[(startY + direction) * 8 + startX]) === "blank")
        {
            if (isSquareOccupied(destination) == "blank") {
                destination.appendChild(piece);
                isWhiteTurn = !isWhiteTurn;
            }

            if (isSquareOccupied(destination) !== pieceColor) {
                return;
            }
        }

        if (Math.abs(endX - startX) === 1 && endY === startY + direction)
        {
            if (isSquareOccupied(destination) !== pieceColor && isSquareOccupied(destination) !== "blank") {
                while (destination.firstChild) {
                    destination.removeChild(destination.firstChild);
                }
                destination.appendChild(piece);
                isWhiteTurn = !isWhiteTurn;
            }
        }

        console.log(direction);
        console.log(pieceColor);
    }

        //if (isSquareOccupied(destination) == "blank") {
        //    destination.appendChild(piece);
        //    isWhiteTurn = !isWhiteTurn;
        //}

        //if (isSquareOccupied(destination) !== pieceColor) {
        //    while (destination.firstChild) {
        //        destination.removeChild(destination.firstChild);
        //    }
        //    destination.appendChild(piece);
        //    isWhiteTurn = !isWhiteTurn;
        //}
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