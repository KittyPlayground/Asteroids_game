const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const backbtn = document.getElementById("backButton");

backbtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    FPS: 60,
    ASTEROID_COUNT: 5,
    STAR_COUNT: 100,
    POWERUP_CHANCE: 0.001,
    DIFFICULTY_INCREASE_SCORE: 50,
    SPEED_INCREASE_SCORE: 100
};

// Set canvas dimensions
canvas.width = GAME_CONFIG.WIDTH;
canvas.height = GAME_CONFIG.HEIGHT;

// Game state
const gameState = {
    score: 0,
    gameOver: false,
    isPaused: false,
    lastTime: 0,
    deltaTime: 0,
    shield: false,
    rapidFire: false,
    powerUpTimer: 0
};

// Player class
class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = GAME_CONFIG.WIDTH / 2;
        this.y = GAME_CONFIG.HEIGHT / 2;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.thrust = 0.5;
        this.friction = 0.99;
        this.rotationSpeed = 0.05;
        this.size = 15;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.lives = 3;
    }

    update() {
        // Rotation
        if (keys.ArrowLeft) this.angle -= this.rotationSpeed;
        if (keys.ArrowRight) this.angle += this.rotationSpeed;

        // Thrust
        if (keys.ArrowUp) {
            this.velocityX += Math.cos(this.angle) * this.thrust;
            this.velocityY += Math.sin(this.angle) * this.thrust;
            this.createThrustParticle();
        }

        // Apply friction
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Screen wrapping
        this.x = (this.x + GAME_CONFIG.WIDTH) % GAME_CONFIG.WIDTH;
        this.y = (this.y + GAME_CONFIG.HEIGHT) % GAME_CONFIG.HEIGHT;

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer--;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }

    createThrustParticle() {
        const angle = this.angle + Math.PI + (Math.random() - 0.5) * 0.5;
        particles.push(new Particle(
            this.x - Math.cos(this.angle) * this.size,
            this.y - Math.sin(this.angle) * this.size,
            angle,
            2,
            20,
            'orange'
        ));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw ship body
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(0, this.size * 0.7);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();

        // Flashing effect when invulnerable
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
        } else {
            ctx.fillStyle = gameState.shield ? '#4488ff' : 'white';
            ctx.fill();
        }

        // Draw thrust flame when moving forward
        if (keys.ArrowUp) {
            ctx.beginPath();
            ctx.moveTo(-this.size/2, this.size);
            ctx.lineTo(0, this.size * 1.5);
            ctx.lineTo(this.size/2, this.size);
            ctx.fillStyle = 'orange';
            ctx.fill();
        }

        ctx.restore();

        // Draw lives
        for (let i = 0; i < this.lives; i++) {
            ctx.save();
            ctx.translate(30 + i * 20, 50);
            ctx.rotate(-Math.PI/2);
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(5, 5);
            ctx.lineTo(-5, 5);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.restore();
        }
    }

    hit() {
        if (this.invulnerable || gameState.shield) return false;
        this.lives--;
        if (this.lives <= 0) {
            gameState.gameOver = true;
            return true;
        }
        this.invulnerable = true;
        this.invulnerabilityTimer = 120; // 2 seconds at 60 FPS
        return false;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 7;
        this.size = 2;
        this.lifeTime = 60; // Frames until bullet disappears
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.x = (this.x + GAME_CONFIG.WIDTH) % GAME_CONFIG.WIDTH;
        this.y = (this.y + GAME_CONFIG.HEIGHT) % GAME_CONFIG.HEIGHT;
        this.lifeTime--;
        return this.lifeTime <= 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }
}

// Asteroid class
class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size || 40;
        this.speed = Math.random() * 2 + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.vertices = this.generateVertices();
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    generateVertices() {
        const vertices = [];
        const numVertices = Math.floor(Math.random() * 4) + 8;
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const variance = Math.random() * 0.4 + 0.8;
            vertices.push({
                x: Math.cos(angle) * this.size * variance,
                y: Math.sin(angle) * this.size * variance
            });
        }
        return vertices;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.x = (this.x + GAME_CONFIG.WIDTH) % GAME_CONFIG.WIDTH;
        this.y = (this.y + GAME_CONFIG.HEIGHT) % GAME_CONFIG.HEIGHT;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();

        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#444444';
        ctx.fill();

        ctx.restore();
    }

    split() {
        if (this.size < 20) return [];

        const newAsteroids = [];
        for (let i = 0; i < 2; i++) {
            newAsteroids.push(new Asteroid(this.x, this.y, this.size / 2));
        }
        return newAsteroids;
    }
}

// Particle class for explosions and effects
class Particle {
    constructor(x, y, angle, speed, life, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = 2;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life--;
        this.size *= 0.95;
        return this.life <= 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 15;
        this.angle = 0;
        this.lifeTime = 300; // 5 seconds
    }

    update() {
        this.angle += 0.05;
        this.lifeTime--;
        return this.lifeTime <= 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        if (this.type === 'shield') {
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(68, 136, 255, 0.7)';
        } else if (this.type === 'rapidFire') {
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                ctx.lineTo(
                    Math.cos(angle) * this.size,
                    Math.sin(angle) * this.size
                );
            }
            ctx.fillStyle = 'rgba(255, 136, 68, 0.7)';
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// Game objects
const player = new Player();
const bullets = [];
const asteroids = [];
const particles = [];
const powerUps = [];

// Key controls
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false
};

// Event listeners
window.addEventListener("keydown", (event) => {
    if (event.code in keys) {
        keys[event.code] = true;
        event.preventDefault();
    }
    if (event.code === "KeyP") togglePause();
    if (event.code === "KeyR" && gameState.gameOver) resetGame();
});

window.addEventListener("keyup", (event) => {
    if (event.code in keys) {
        keys[event.code] = false;
        event.preventDefault();
    }
});

// Sound effects
const sounds = {
    shoot: new Audio('audio/gunshot1.mp3'),
    explosion: new Audio('audio/boom.wav'),
    powerUp: new Audio('audio/powerup.wav')
};

Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
});

function playSound(name) {
    const sound = sounds[name];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {}); // Ignore errors from browsers blocking autoplay
    }
}

// Game functions
function createAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Math.random() * GAME_CONFIG.WIDTH;
            y = Math.random() * GAME_CONFIG.HEIGHT;
        } while (distanceBetween(x, y, player.x, player.y) < 100);

        asteroids.push(new Asteroid(x, y));
    }
}

function shootBullet() {
    if (!gameState.gameOver) {
        const bulletSpeed = gameState.rapidFire ? 10 : 7;
        bullets.push(new Bullet(player.x, player.y, player.angle));
        playSound('shoot');
    }
}

function createExplosion(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x,
            y,
            Math.random() * Math.PI * 2,
            Math.random() * 3 + 1,
            30,
            color || '#ffaa00'
        ));
    }
}

function spawnPowerUp() {
    if (Math.random() < GAME_CONFIG.POWERUP_CHANCE) {
        const type = Math.random() > 0.5 ? 'shield' : 'rapidFire';
        powerUps.push(new PowerUp(
            Math.random() * GAME_CONFIG.WIDTH,
            Math.random() * GAME_CONFIG.HEIGHT,
            type
        ));
    }
}

function distanceBetween(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function checkCollisions() {
    // Bullet-Asteroid collisions
    bullets.forEach((bullet, bulletIndex) => {
        asteroids.forEach((asteroid, asteroidIndex) => {
            if (distanceBetween(bullet.x, bullet.y, asteroid.x, asteroid.y) < asteroid.size) {
                bullets.splice(bulletIndex, 1);
                asteroids.splice(asteroidIndex, 1);

                // Create smaller asteroids
                const newAsteroids = asteroid.split();
                asteroids.push(...newAsteroids);

                // Create explosion effect
                createExplosion(asteroid.x, asteroid.y, 10);

                // Update score
                gameState.score += Math.floor(50 / asteroid.size * 10);

                playSound('explosion');
            }
        });
    });

    // Player-Asteroid collisions
    asteroids.forEach(asteroid => {
        if (distanceBetween(player.x, player.y, asteroid.x, asteroid.y) < player.size + asteroid.size) {
            if (player.hit()) {
                createExplosion(player.x, player.y, 20, '#ff0000');
                playSound('explosion');
            }
        }
    });

    // Player-PowerUp collisions
    powerUps.forEach((powerUp, index) => {
        if (distanceBetween(player.x, player.y, powerUp.x, powerUp.y) < player.size + powerUp.size) {
            if (powerUp.type === 'shield') {
                gameState.shield = true;
                gameState.powerUpTimer = 300;
            } else if (powerUp.type === 'rapidFire') {
                gameState.rapidFire = true;
                gameState.powerUpTimer = 300;
            }
            powerUps.splice(index, 1);
            playSound('powerUp');
        }
    });
}

function updatePowerUps() {
    if (gameState.powerUpTimer > 0) {
        gameState.powerUpTimer--;
        if (gameState.powerUpTimer <= 0) {
            gameState.shield = false;
            gameState.rapidFire = false;
        }
    }
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
}

function resetGame() {
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.shield = false;
    gameState.rapidFire = false;
    gameState.powerUpTimer = 0;

    player.reset();
    bullets.length = 0;
    asteroids.length = 0;
    particles.length = 0;
    powerUps.length = 0;

    createAsteroids(GAME_CONFIG.ASTEROID_COUNT);
}

function drawBackground() {
    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * GAME_CONFIG.WIDTH;
        const y = Math.random() * GAME_CONFIG.HEIGHT;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

function drawUI() {
    // Score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);

    // PowerUp indicators
    if (gameState.shield || gameState.rapidFire) {
        ctx.font = '16px Arial';
        let y = 80;
        if (gameState.shield) {
            ctx.fillStyle = '#4488ff';
            ctx.fillText('Shield: ' + Math.ceil(gameState.powerUpTimer / 60), 20, y);
            y += 25;
        }
        if (gameState.rapidFire) {
            ctx.fillStyle = '#ff8844';
            ctx.fillText('Rapid Fire: ' + Math.ceil(gameState.powerUpTimer / 60), 20, y);
        }
    }

    // Game Over screen
    if (gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2 - 40);

        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${gameState.score}`, GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2 + 10);
        ctx.fillText('Press R to Restart', GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2 + 50);

        ctx.textAlign = 'left';
    }

    // Pause screen
    if (gameState.isPaused && !gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2);
        ctx.textAlign = 'left';
    }
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    if (!gameState.lastTime) gameState.lastTime = timestamp;
    gameState.deltaTime = (timestamp - gameState.lastTime) / (1000 / GAME_CONFIG.FPS);
    gameState.lastTime = timestamp;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

    if (!gameState.isPaused && !gameState.gameOver) {
        // Update game objects
        player.update();

        // Update bullets
        bullets.forEach((bullet, index) => {
            if (bullet.update()) bullets.splice(index, 1);
        });

        // Update asteroids
        asteroids.forEach(asteroid => asteroid.update());

        // Update particles
        particles.forEach((particle, index) => {
            if (particle.update()) particles.splice(index, 1);
        });

        // Update power-ups
        powerUps.forEach((powerUp, index) => {
            if (powerUp.update()) powerUps.splice(index, 1);
        });

        // Shooting
        if (keys.Space) {
            if (gameState.rapidFire || bullets.length === 0) {
                shootBullet();
            }
        }

        // Check collisions
        checkCollisions();

        // Update power-up timers
        updatePowerUps();

        // Spawn power-ups
        spawnPowerUp();

        // Increase difficulty
        if (asteroids.length === 0) {
            createAsteroids(GAME_CONFIG.ASTEROID_COUNT);
        }
    }

    // Draw everything
    drawBackground();

    // Draw game objects
    asteroids.forEach(asteroid => asteroid.draw());
    bullets.forEach(bullet => bullet.draw());
    particles.forEach(particle => particle.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    player.draw();

    // Draw UI
    drawUI();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
function init() {
    resetGame();
    requestAnimationFrame(gameLoop);
}

init();