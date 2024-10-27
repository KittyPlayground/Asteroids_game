// Get canvas and context
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
};

// Event listeners for keydown and keyup
window.addEventListener("keydown", (event) => {
    if (event.code in keys) keys[event.code] = true;
});
window.addEventListener("keyup", (event) => {
    if (event.code in keys) keys[event.code] = false;
});

// Function to draw the spaceship
function drawSpaceship() {
    ctx.save(); // Save the current drawing state

    // Translate and rotate the canvas to draw the spaceship
    ctx.translate(spaceship.x, spaceship.y);
    ctx.rotate(spaceship.angle);

    // Draw a triangle for the spaceship
    ctx.beginPath();
    ctx.moveTo(0, -10); // Tip of the spaceship
    ctx.lineTo(5, 10);  // Bottom right of the spaceship
    ctx.lineTo(-5, 10); // Bottom left of the spaceship
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore(); // Restore the original drawing state
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
}

// Array to store all asteroids
const asteroids = [];

// Function to create a new asteroid
function createAsteroid() {
    const asteroid = {
        x: Math.random() * canvas.width,        // Random x position
        y: Math.random() * canvas.height,       // Random y position
        size: Math.random() * 20 + 20,          // Random size between 20 and 40
        speed: Math.random() * 2 + 1,           // Random speed between 1 and 3
        angle: Math.random() * Math.PI * 2      // Random direction in radians
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
    asteroids.forEach((asteroid) => {
        // Move asteroid in the direction of its angle
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;

        // Screen wrapping for asteroids
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.y > canvas.height) asteroid.y = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
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
            console.log("Collision detected!"); // Placeholder for collision response
            // For now, just log the collision. You can implement more actions later.
        }
    });
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    updateSpaceship();    // Update spaceship position
    updateAsteroids();    // Update asteroid positions
    checkCollisions();    // Check for collisions

    drawSpaceship();      // Draw spaceship
    drawAsteroids();      // Draw asteroids

    requestAnimationFrame(gameLoop); // Call the loop again
}

// Start the game loop
gameLoop();
