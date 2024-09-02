const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables to track touch position for swipe detection
let touchStartX = 0;
let touchEndX = 0;

// Function to handle touch start
function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX; // Get the X position where touch started
}

// Function to handle touch end
function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX; // Get the X position where touch ended

    // Calculate swipe direction
    if (touchEndX < touchStartX - 30 && currentLane > 0) {
        // Swiped left
        currentLane--;
        player.x = lanes[currentLane];
    } else if (touchEndX > touchStartX + 30 && currentLane < lanes.length - 1) {
        // Swiped right
        currentLane++;
        player.x = lanes[currentLane];
    }
}

// Add touch event listeners for mobile controls
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);


// Set canvas dimensions to full window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let isPaused = false;
let totalPoints = 0;
let lanes = [canvas.width / 4, canvas.width / 2, (canvas.width / 4) * 3]; // Three lanes
let currentLane = 1; // Start in the middle lane
let playerMoving = false;

let skins = [
    { name: 'Blue Train', color: 'blue', price: 0, purchased: true }, // Default skin
    { name: 'Red Train', color: 'red', price: 100, purchased: false },
    { name: 'Green Train', color: 'green', price: 200, purchased: false }
];

let equippedSkin = skins[0]; // Default skin

// Clear canvas function
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw railway tracks in the background
function drawTracks() {
    ctx.strokeStyle = '#4b4b4b'; // Dark gray for the tracks
    ctx.lineWidth = 5;

    // Loop through each lane and draw vertical tracks
    lanes.forEach(lane => {
        ctx.beginPath();
        ctx.moveTo(lane - 50, 0);
        ctx.lineTo(lane - 50, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(lane + 50, 0);
        ctx.lineTo(lane + 50, canvas.height);
        ctx.stroke();

        // Draw horizontal bars across the tracks
        for (let y = 0; y < canvas.height; y += 100) {
            ctx.beginPath();
            ctx.moveTo(lane - 50, y);
            ctx.lineTo(lane + 50, y);
            ctx.stroke();
        }
    });
}

// Player object
const player = {
    x: lanes[currentLane],
    y: canvas.height - 120,
    width: 60,
    height: 60,
    speed: 10,
};

// Draw player using equipped skin color
function drawPlayer() {
    ctx.fillStyle = equippedSkin.color; // Player color is now based on equipped skin
    ctx.fillRect(player.x - 30, player.y, player.width, player.height);
    ctx.fillStyle = '#000'; // Wheels
    ctx.fillRect(player.x - 28, player.y + 45, 10, 10);
    ctx.fillRect(player.x + 18, player.y + 45, 10, 10);
}

// Trains (Enemies) and Coins arrays
const trains = [];
const coins = [];

const trainSpeed = 7; // Slightly faster
const coinSpeed = 4;

// Create new train (enemy)
function createTrain() {
    const lane = Math.floor(Math.random() * lanes.length);
    trains.push({ x: lanes[lane], y: -120, width: 80, height: 120 });
}

// Create new coin that doesn't overlap with trains
function createCoin() {
    const lane = Math.floor(Math.random() * lanes.length);
    let validLane = true;

    // Ensure the coin doesn't spawn on an active train lane
    trains.forEach((train) => {
        if (train.x === lanes[lane] && train.y < 200) { // If train is within 200px vertically
            validLane = false;
        }
    });

    if (validLane) {
        coins.push({ x: lanes[lane], y: -40, width: 30, height: 30 });
    }
}

// Draw trains (enemies)
function drawTrains() {
    ctx.fillStyle = '#808080'; // Train body
    trains.forEach((train, index) => {
        train.y += trainSpeed;
        ctx.fillRect(train.x - 40, train.y, train.width, train.height);

        // Draw train windows and wheels
        ctx.fillStyle = '#FFF'; // Windows
        ctx.fillRect(train.x - 35, train.y + 20, 20, 20);
        ctx.fillRect(train.x + 5, train.y + 20, 20, 20);
        ctx.fillStyle = '#000'; // Wheels
        ctx.fillRect(train.x - 38, train.y + 90, 15, 15);
        ctx.fillRect(train.x + 23, train.y + 90, 15, 15);

        // Remove trains that go off-screen
        if (train.y > canvas.height) {
            trains.splice(index, 1);
        }

        // Check collision with player
        if (checkCollision(player, train)) {
            endGame();
        }
    });
}

// Draw coins
function drawCoins() {
    ctx.fillStyle = 'yellow';
    coins.forEach((coin, index) => {
        coin.y += coinSpeed;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Remove coins that go off-screen
        if (coin.y > canvas.height) {
            coins.splice(index, 1);
        }

        // Check collision with player
        if (checkCollision(player, coin)) {
            score += 10;
            coins.splice(index, 1);
        }
    });
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Update score display
function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

// End the game
function endGame() {
    gameOver = true;
    totalPoints += score; // Add current game score to total points
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').innerText = score;
}

// Shop functionality
function showShopMenu() {
    const shopMenu = document.getElementById('shopMenu');
    shopMenu.style.display = 'block';

    // Add shop items dynamically
    const shopItems = skins.map((skin) => {
        const button = document.createElement('button');
        button.classList.add('shop-item');
        button.innerText = `${skin.name} - ${skin.price} points`;

        if (skin.purchased) {
            button.innerText += ' (Owned)';
            button.disabled = false; // Can equip an owned skin
        } else if (totalPoints >= skin.price) {
            button.disabled = false;
            button.onclick = () => {
                totalPoints -= skin.price;
                skin.purchased = true;
                equippedSkin = skin;
                button.innerText += ' (Owned)';
            };
        } else {
            button.disabled = true;
        }
        return button;
    });

    shopItems.forEach(item => shopMenu.appendChild(item));
}

// Quests (random word hunts)
function showQuestsMenu() {
    const questsMenu = document.getElementById('questsMenu');
    questsMenu.style.display = 'block';

    const wordHunt = document.getElementById('wordHunt');
    wordHunt.innerHTML = ''; // Clear previous quest

    const words = ['TRAIN', 'RAILWAY', 'TRACK'];
    const selectedWord = words[Math.floor(Math.random() * words.length)];

    selectedWord.split('').forEach((letter) => {
        const letterBox = document.createElement('div');
        letterBox.classList.add('quest-item');
        letterBox.innerText = letter;
        wordHunt.appendChild(letterBox);
    });
}

// Handle player controls (left, right)
window.addEventListener('keydown', (e) => {
    if (gameOver || isPaused) return;
    if (e.key === 'ArrowLeft' && currentLane > 0) {
        currentLane--;
        player.x = lanes[currentLane];
    } else if (e.key === 'ArrowRight' && currentLane < lanes.length - 1) {
        currentLane++;
        player.x = lanes[currentLane];
    }
});

// Game loop
function gameLoop() {
    if (!gameOver && !isPaused) {
        clearCanvas();
        drawTracks();
        drawPlayer();
        drawTrains();
        drawCoins();
        updateScore();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    gameOver = false;
    score = 0;
    trains.length = 0;
    coins.length = 0;
    document.getElementById('mainMenu').style.display = 'none';
    gameLoop();
    setInterval(createTrain, 2000); // Create new train every 2 seconds
    setInterval(createCoin, 3000);  // Create new coin every 3 seconds
}

// Show the main menu
function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('shopMenu').style.display = 'none';
    document.getElementById('questsMenu').style.display = 'none';
}

// Resume game after pause
function resumeGame() {
    isPaused = false;
    document.getElementById('pauseMenu').style.display = 'none';
}

// Initialize game
showMainMenu();
