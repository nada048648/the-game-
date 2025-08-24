// Game variables and constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const lengthElement = document.getElementById('length');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

// Game constants
const GRID_SIZE = 20;
const GRID_WIDTH = canvas.width / GRID_SIZE;
const GRID_HEIGHT = canvas.height / GRID_SIZE;
const GAME_SPEED = 150; // milliseconds

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval = null;
let score = 0;
let gameRunning = false;
let gamePaused = false;

// Educational items - positive (good) and negative (bad)
const POSITIVE_ITEMS = [
    { type: 'solar', symbol: '☀️', message: 'الألواح الشمسية مصدر نظيف للكهرباء وتقلل من الانبعاثات الضارة', points: 2 },
    { type: 'tree', symbol: '🌳', message: 'الأشجار تنقي الهواء وتوفر الأكسجين وتحافظ على التوازن البيئي', points: 3 },
    { type: 'recycle', symbol: '♻️', message: 'إعادة التدوير تحافظ على الموارد الطبيعية وتقلل من النفايات', points: 2 }
];

const NEGATIVE_ITEMS = [
    { type: 'coal', symbol: '🛢️', message: 'الفحم يطلق غازات ضارة ويساهم في التغير المناخي', points: -2 },
    { type: 'factory', symbol: '🏭', message: 'الدخان الصناعي يلوث الهواء ويضر بالصحة والبيئة', points: -3 },
    { type: 'plastic', symbol: '🔥', message: 'البلاستيك الأحادي الاستخدام يلوث المحيطات ويضر بالكائنات البحرية', points: -2 }
];

// Initialize game
function initGame() {
    // Reset game state
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    
    score = 0;
    direction = 'right';
    nextDirection = 'right';
    gameRunning = false;
    gamePaused = false;
    
    // Update UI
    scoreElement.textContent = score;
    lengthElement.textContent = snake.length;
    
    // Generate first food
    generateFood();
    
    // Draw initial state
    draw();
    
    // Enable/disable buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'إيقاف مؤقت';
}

// Generate food at random position
function generateFood() {
    const isPositive = Math.random() > 0.4; // 60% chance for positive items
    const items = isPositive ? POSITIVE_ITEMS : NEGATIVE_ITEMS;
    const randomItem = items[Math.floor(Math.random() * items.length)];
    
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT),
            ...randomItem
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional)
    drawGrid();
    
    // Draw snake
    drawSnake();
    
    // Draw food
    drawFood();
}

// Draw grid lines
function drawGrid() {
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    // Draw snake body
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Snake head
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            
            // Draw eyes
            ctx.fillStyle = 'white';
            const eyeSize = GRID_SIZE / 5;
            const offset = GRID_SIZE / 4;
            
            if (direction === 'right') {
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - offset, segment.y * GRID_SIZE + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - offset, segment.y * GRID_SIZE + GRID_SIZE - offset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'left') {
                ctx.fillRect(segment.x * GRID_SIZE + offset - eyeSize, segment.y * GRID_SIZE + offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + offset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - offset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'up') {
                ctx.fillRect(segment.x * GRID_SIZE + offset, segment.y * GRID_SIZE + offset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - offset - eyeSize, segment.y * GRID_SIZE + offset - eyeSize, eyeSize, eyeSize);
            } else if (direction === 'down') {
                ctx.fillRect(segment.x * GRID_SIZE + offset, segment.y * GRID_SIZE + GRID_SIZE - offset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - offset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - offset, eyeSize, eyeSize);
            }
        } else {
            // Snake body
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            
            // Add some texture to body segments
            ctx.fillStyle = '#45a049';
            ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        }
    });
}

// Draw food with symbol
function drawFood() {
    const isPositive = food.points > 0;
    
    // Draw background circle
    ctx.fillStyle = isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw symbol (text)
    ctx.font = `${GRID_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isPositive ? '#2e7d32' : '#c62828';
    ctx.fillText(
        food.symbol,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2
    );
}

// Update game state
function update() {
    // Update direction
    direction = nextDirection;
    
    // Move snake
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        // Handle food collection
        handleFoodCollection();
        
        // Generate new food
        generateFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
    
    // Update UI
    lengthElement.textContent = snake.length;
    
    // Redraw game
    draw();
}

// Handle food collection and show educational message
function handleFoodCollection() {
    // Update score
    score += food.points;
    scoreElement.textContent = score;
    
    // Show educational message
    showEducationalMessage(food.message, food.points > 0);
    
    // Handle snake length based on food type
    if (food.points > 0) {
        // Positive food - add segments
        for (let i = 0; i < Math.abs(food.points); i++) {
            const tail = snake[snake.length - 1];
            snake.push({ ...tail });
        }
    } else {
        // Negative food - remove segments
        for (let i = 0; i < Math.abs(food.points); i++) {
            if (snake.length > 3) { // Keep minimum length of 3
                snake.pop();
            }
        }
    }
}

// Show educational message
function showEducationalMessage(message, isPositive) {
    messageText.textContent = message;
    messageBox.className = 'educational-message show';
    messageBox.querySelector('.message-content').className = `message-content ${isPositive ? 'good' : 'bad'}`;
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageBox.className = 'educational-message';
    }, 3000);
}

// Game over function
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    
    // Show game over message
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over show';
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <h2>انتهت اللعبة!</h2>
            <p>النقاط النهائية: ${score}</p>
            <p>أقصى طول: ${snake.length}</p>
            <button class="btn btn-primary restart-game" onclick="restartGame()">لعب مرة أخرى</button>
        </div>
    `;
    document.body.appendChild(gameOverDiv);
    
    // Enable/disable buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameInterval = setInterval(update, GAME_SPEED);
        
        // Enable/disable buttons
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }
}

// Pause/resume game
function togglePause() {
    if (gameRunning) {
        if (gamePaused) {
            // Resume game
            gameInterval = setInterval(update, GAME_SPEED);
            gamePaused = false;
            pauseBtn.textContent = 'إيقاف مؤقت';
        } else {
            // Pause game
            clearInterval(gameInterval);
            gamePaused = true;
            pauseBtn.textContent = 'استئناف';
        }
    }
}

// Restart game
function restartGame() {
    // Remove game over overlay if exists
    const gameOverDiv = document.querySelector('.game-over');
    if (gameOverDiv) {
        gameOverDiv.remove();
    }
    
    clearInterval(gameInterval);
    initGame();
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (!gameRunning || gamePaused) return;
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// Button event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// Touch controls for mobile devices
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    if (!gameRunning || gamePaused) return;
    
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault();
}, false);

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
}, false);

canvas.addEventListener('touchend', (event) => {
    if (!gameRunning || gamePaused) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // Minimum swipe distance
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (dx < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // Vertical swipe
            if (dy > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (dy < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
    }
    
    event.preventDefault();
}, false);

// Initialize game on load
window.addEventListener('load', initGame);

// Prevent scrolling with arrow keys
window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
});

// Export functions for global access
window.restartGame = restartGame;

