import {
  Application,
  Container,
  Graphics,
  FederatedPointerEvent,
} from 'pixi.js';

// Define map: 0 = walkable (grass), 1 = obstacle (wall), 2 = water
const WORLD_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1],
  [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Game constants
const TILE_SIZE = 32;
const PLAYER_SIZE = 24;
const PLAYER_SPEED = 3;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;

// Initialize Pixi Application
const app = new Application();

// Initialize the app with proper options
await app.init({
  width: VIEWPORT_WIDTH,
  height: VIEWPORT_HEIGHT,
  background: '#333333',
  antialias: true,
});

// Add the canvas to the document
document.body.appendChild(app.canvas);

// Create world container (which will be moved to simulate camera)
const worldContainer = new Container();
app.stage.addChild(worldContainer);

// Player state
const playerState = {
  x: 5 * TILE_SIZE + TILE_SIZE / 2,
  y: 5 * TILE_SIZE + TILE_SIZE / 2,
  targetX: 5 * TILE_SIZE + TILE_SIZE / 2,
  targetY: 5 * TILE_SIZE + TILE_SIZE / 2,
  isMoving: false,
};

// Draw map
function drawMap() {
  for (let y = 0; y < WORLD_MAP.length; y++) {
    for (let x = 0; x < WORLD_MAP[y].length; x++) {
      const tile = new Graphics();

      // Set fill color based on tile type
      let fillColor;
      switch (WORLD_MAP[y][x]) {
        case 0: // Grass (walkable)
          fillColor = 0x408040;
          break;
        case 1: // Wall (obstacle)
          fillColor = 0x808080;
          break;
        case 2: // Water (obstacle)
          fillColor = 0x4040c0;
          break;
      }

      // Use the new fill and rect methods from Pixi.js v8
      tile.rect(0, 0, TILE_SIZE, TILE_SIZE);
      tile.fill({ color: fillColor });

      tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
      worldContainer.addChild(tile);
    }
  }
}

const player = new Graphics();
function drawPlayer() {
  // Create player
  updatePlayerGraphics();
  player.position.set(
    playerState.x - PLAYER_SIZE / 2,
    playerState.y - PLAYER_SIZE / 2,
  );
  worldContainer.addChild(player);
}

// Function to update player graphics based on movement state
function updatePlayerGraphics() {
  player.clear();

  // Use the new fill and rect methods
  player.rect(0, 0, PLAYER_SIZE, PLAYER_SIZE);
  player.fill({ color: playerState.isMoving ? 0xffaa00 : 0xff0000 });
}

// Input handling
const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      keys.up = true;
      break;
    case 's':
    case 'arrowdown':
      keys.down = true;
      break;
    case 'a':
    case 'arrowleft':
      keys.left = true;
      break;
    case 'd':
    case 'arrowright':
      keys.right = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      keys.up = false;
      break;
    case 's':
    case 'arrowdown':
      keys.down = false;
      break;
    case 'a':
    case 'arrowleft':
      keys.left = false;
      break;
    case 'd':
    case 'arrowright':
      keys.right = false;
      break;
  }
});

// Check if a position is valid (within bounds and walkable)
function isWalkableTile(x: number, y: number): boolean {
  // Convert pixel coordinates to grid coordinates
  const gridX = Math.floor(x / TILE_SIZE);
  const gridY = Math.floor(y / TILE_SIZE);

  // Check bounds
  if (
    gridX < 0 ||
    gridX >= WORLD_MAP[0].length ||
    gridY < 0 ||
    gridY >= WORLD_MAP.length
  ) {
    return false;
  }

  // Check if tile is walkable (0)
  return WORLD_MAP[gridY][gridX] === 0;
}

// Game loop
app.ticker.add((time) => {
  // Update player movement targets based on input
  if (keys.up) {
    playerState.targetY = playerState.y - TILE_SIZE;
  } else if (keys.down) {
    playerState.targetY = playerState.y + TILE_SIZE;
  }

  if (keys.left) {
    playerState.targetX = playerState.x - TILE_SIZE;
  } else if (keys.right) {
    playerState.targetX = playerState.x + TILE_SIZE;
  }

  // Check if target is valid
  if (!isWalkableTile(playerState.targetX, playerState.targetY)) {
    playerState.targetX = playerState.x;
    playerState.targetY = playerState.y;
  }

  // Move player towards target
  const dx = playerState.targetX - playerState.x;
  const dy = playerState.targetY - playerState.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 1) {
    // Player is moving
    playerState.isMoving = true;

    // Update player position
    playerState.x += (dx / distance) * PLAYER_SPEED;
    playerState.y += (dy / distance) * PLAYER_SPEED;

    // Update player visual
    updatePlayerGraphics();
  } else if (distance > 0) {
    // Snap to target when very close
    playerState.x = playerState.targetX;
    playerState.y = playerState.targetY;
    playerState.isMoving = false;
    updatePlayerGraphics();
  } else {
    playerState.isMoving = false;
  }

  // Update player sprite position
  player.position.set(
    playerState.x - PLAYER_SIZE / 2,
    playerState.y - PLAYER_SIZE / 2,
  );

  // Update camera position (center on player)
  worldContainer.x = VIEWPORT_WIDTH / 2 - playerState.x;
  worldContainer.y = VIEWPORT_HEIGHT / 2 - playerState.y;
});

// Initialize the game
function init() {
  drawMap();
  drawPlayer();

  // Find a valid starting position for the player
  for (let y = 0; y < WORLD_MAP.length; y++) {
    for (let x = 0; x < WORLD_MAP[y].length; x++) {
      if (WORLD_MAP[y][x] === 0) {
        playerState.x = x * TILE_SIZE + TILE_SIZE / 2;
        playerState.y = y * TILE_SIZE + TILE_SIZE / 2;
        playerState.targetX = playerState.x;
        playerState.targetY = playerState.y;
        player.position.set(
          playerState.x - PLAYER_SIZE / 2,
          playerState.y - PLAYER_SIZE / 2,
        );
        return;
      }
    }
  }
}

// Start the game
init();
