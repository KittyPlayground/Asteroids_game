const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const instructionsScreen = document.getElementById("instructionsScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const playButton = document.getElementById("playButton");
const highScoresButton = document.getElementById("highScoresButton");
const instructionsButton = document.getElementById("instructionsButton");
const settingsButton = document.getElementById("settingsButton");
const backFromInstructions = document.getElementById("backFromInstructions");
const backFromGameOver = document.getElementById("backFromGameOver");
const restartButton = document.getElementById("restartButton");


function hideAllScreens() {
    menuScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    instructionsScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
}

playButton.addEventListener("click", () => {
    hideAllScreens();
    window.location.href = "game.html";

});

instructionsButton.addEventListener("click", () => {
    hideAllScreens();
    instructionsScreen.classList.remove("hidden");
});

backFromInstructions.addEventListener("click", () => {
    hideAllScreens();
    menuScreen.classList.remove("hidden");
});

restartButton.addEventListener("click", () => {
    hideAllScreens();
    gameScreen.classList.remove("hidden");
    startGame();
});

backFromGameOver.addEventListener("click", () => {
    hideAllScreens();
    menuScreen.classList.remove("hidden");
});

function startGame() {
    console.log("Game started!");
}
