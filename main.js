
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
canvas.width = 800;
canvas.height = 600;

// Spaceship object
const spaceship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,           // Rotation angle in radians
    speed: 0,           // Speed of movement
    rotationSpeed: 0.05, // Speed of rotation
    velocityX: 0,       // X velocity
    velocityY: 0,       // Y velocity
    size: 10            // Radius for collision detection
};

// Key controls
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false // For shooting
};

// Event listeners for keydown and keyup
window.addEventListener("keydown", (event) => {
    if (event.code in keys) keys[event.code] = true;
});
window.addEventListener("keyup", (event) => {
    if (event.code in keys) keys[event.code] = false;
});

// Initialize score and game over state
let score = 0;
let gameOver = false;

// Initialize bullets array
const bullets = [];

// Function to draw the spaceship
function drawSpaceship() {
    ctx.save();

    // Translate and rotate the canvas to draw the spaceship
    ctx.translate(spaceship.x, spaceship.y);
    ctx.rotate(spaceship.angle);

    // Draw a triangle for the spaceship
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(5, 10);
    ctx.lineTo(-5, 10);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.fill();

    ctx.restore();
}

// Update spaceship position and angle based on controls
function updateSpaceship() {
    if (keys.ArrowLeft) spaceship.angle -= spaceship.rotationSpeed;
    if (keys.ArrowRight) spaceship.angle += spaceship.rotationSpeed;

    // Apply forward thrust
    if (keys.ArrowUp) {
        spaceship.velocityX += Math.cos(spaceship.angle) * 0.1;
        spaceship.velocityY += Math.sin(spaceship.angle) * 0.1;
    }

    // Update position with velocity
    spaceship.x += spaceship.velocityX;
    spaceship.y += spaceship.velocityY;

    // Screen wrapping
    if (spaceship.x > canvas.width) spaceship.x = 0;
    if (spaceship.x < 0) spaceship.x = canvas.width;
    if (spaceship.y > canvas.height) spaceship.y = 0;
    if (spaceship.y < 0) spaceship.y = canvas.height;

    // Shooting bullets
    if (keys.Space) {
        shootBullet();
        keys.Space = false; // Prevent multiple bullets from being shot at once
    }
}

// Array to store all asteroids
const asteroids = [];

// Function to create a new asteroid
function createAsteroid() {
    const asteroid = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 20,
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2
    };
    asteroids.push(asteroid);
}

// Create initial asteroids
for (let i = 0; i < 5; i++) {
    createAsteroid();
}

// Function to draw all asteroids
function drawAsteroids() {
    asteroids.forEach((asteroid) => {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "gray";
        ctx.fill();
    });
}

// Function to update all asteroid positions
function updateAsteroids() {
    asteroids.forEach((asteroid, index) => {
        // Move asteroid in the direction of its angle
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;

        // Screen wrapping for asteroids
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.y > canvas.height) asteroid.y = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;

        // Check for bullet collisions
        bullets.forEach((bullet, bulletIndex) => {
            const dx = asteroid.x - bullet.x;
            const dy = asteroid.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size) { // Collision detected
                // Remove asteroid and bullet
                asteroids.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score += 10; // Increase score
                playExplosionSound(); // Play explosion sound
            }
        });
    });
}

// Function to check for collisions between spaceship and asteroids
function checkCollisions() {
    asteroids.forEach((asteroid) => {
        const dx = spaceship.x - asteroid.x;
        const dy = spaceship.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check for collision
        if (distance < spaceship.size + asteroid.size) {
            gameOver = true; // Set game over state
        }
    });
}

// Function to display the score on the canvas
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Function to create a bullet
function shootBullet() {
    const bullet = {
        x: spaceship.x,
        y: spaceship.y,
        angle: spaceship.angle,
        speed: 5, // Speed of the bullet
        size: 5 // Bullet size for collision detection
    };
    bullets.push(bullet);
    playShootSound(); // Play shooting sound
}

// Function to update bullets positions
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;

        // Remove bullets that are out of bounds
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

// Function to draw all bullets
function drawBullets() {
    bullets.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "yellow";
        ctx.fill();
    });
}

// Function to increase difficulty over time
function increaseDifficulty() {
    if (score % 50 === 0 && score > 0) {
        for (let i = 0; i < 2; i++) {
            createAsteroid();
        }
    }

    // Increase speed of asteroids after certain score
    if (score % 100 === 0 && score > 0) {
        asteroids.forEach(asteroid => {
            asteroid.speed += 0.5; // Increase asteroid speed
        });
    }
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    if (!gameOver) {
        updateSpaceship();
        updateAsteroids();
        updateBullets();
        checkCollisions();

        drawSpaceship();
        drawAsteroids();
        drawBullets();

        // Increase difficulty based on score
        increaseDifficulty();

        // Increase score over time
        score += 1;
        drawScore();
    } else {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Press R to Restart", canvas.width / 2 - 100, canvas.height / 2 + 40);
    }

    requestAnimationFrame(gameLoop);
}

// Event listener for restarting the game
window.addEventListener("keydown", (event) => {
    if (event.code === "KeyR" && gameOver) {
        // Reset game state
        score = 0;
        gameOver = false;
        asteroids.length = 0;
        for (let i = 0; i < 5; i++) {
            createAsteroid(); // Create initial asteroids
        }
        bullets.length = 0;
    }
});

// Load sound effects
const shootSound = new Audio('audio/gunshot1.mp3');
const explosionSound = new Audio('audio/explosion.mp3');

function playShootSound() {
    shootSound.currentTime = 0;
    shootSound.play();
}

function playExplosionSound() {
    explosionSound.currentTime = 0;
    explosionSound.play();
}

gameLoop();
