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

        // Cele to pozri podla videa pre istotu davalo ti to chatgtp


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
    console.log("Dragging: " + piece.id); // Debugging drag
    ev.dataTransfer.setData("text/plain", piece.id); // Set the piece ID in the drag event
}

function drop(ev) {
    ev.preventDefault();
    const pieceId = ev.dataTransfer.getData("text/plain");
    const piece = document.getElementById(pieceId);
    console.log("Dropping on: " + ev.currentTarget.id); // Debugging drop
    ev.currentTarget.appendChild(piece); // Move the piece to the dropped square
}