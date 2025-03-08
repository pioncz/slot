import * as PIXI from 'pixi.js';

// Define map: 0 = walkable (black), 1 = obstacle (white)
const MAP = [
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 0, 1, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
];

// Game constants
const TILE_SIZE = 50;
const PLAYER_SPEED = 5;

// Initialize Pixi Application
const app = new PIXI.Application({
  width: MAP[0].length * TILE_SIZE,
  height: MAP.length * TILE_SIZE,
  backgroundColor: 0x333333,
  antialias: true,
});
document.body.appendChild(app.view as HTMLCanvasElement);

// Create map container
const mapContainer = new PIXI.Container();
app.stage.addChild(mapContainer);

// Draw map
function drawMap() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      const tile = new PIXI.Graphics();
      if (MAP[y][x] === 0) {
        // Walkable tile (black)
        tile.beginFill(0x000000);
      } else {
        // Obstacle (white)
        tile.beginFill(0xffffff);
      }
      tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      tile.endFill();
      tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
      mapContainer.addChild(tile);
    }
  }
}

// Create player
const player = new PIXI.Graphics();
player.beginFill(0xff0000);
player.drawRect(0, 0, TILE_SIZE - 10, TILE_SIZE - 10);
player.endFill();

// Center the player in the tile
player.position.set(TILE_SIZE / 2, TILE_SIZE / 2);

// Add player to the stage
app.stage.addChild(player);

/* 
// Replace the rectangle with an image (commented out)
const player = PIXI.Sprite.from('player.png');
player.width = TILE_SIZE - 10;
player.height = TILE_SIZE - 10;
player.anchor.set(0.5);
player.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
app.stage.addChild(player);
*/

// Input handling
const keys: { [key: string]: boolean } = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Check if a position is valid (within bounds and not an obstacle)
function isValidPosition(x: number, y: number): boolean {
  // Convert pixel coordinates to grid coordinates
  const gridX = Math.floor(x / TILE_SIZE);
  const gridY = Math.floor(y / TILE_SIZE);

  // Check bounds
  if (
    gridX < 0 ||
    gridX >= MAP[0].length ||
    gridY < 0 ||
    gridY >= MAP.length
  ) {
    return false;
  }

  // Check if tile is walkable (0)
  return MAP[gridY][gridX] === 0;
}

// Game loop
app.ticker.add((delta) => {
  let newX = player.x;
  let newY = player.y;

  // Handle movement
  if (keys['w'] || keys['arrowup']) {
    newY -= PLAYER_SPEED * delta;
  }
  if (keys['s'] || keys['arrowdown']) {
    newY += PLAYER_SPEED * delta;
  }
  if (keys['a'] || keys['arrowleft']) {
    newX -= PLAYER_SPEED * delta;
  }
  if (keys['d'] || keys['arrowright']) {
    newX += PLAYER_SPEED * delta;
  }

  // Check if new position is valid before updating
  if (
    isValidPosition(newX, newY) &&
    isValidPosition(newX + player.width, newY) &&
    isValidPosition(newX, newY + player.height) &&
    isValidPosition(newX + player.width, newY + player.height)
  ) {
    player.x = newX;
    player.y = newY;
  }
});

// Initialize the game
function init() {
  drawMap();

  // Find a valid starting position for the player
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      if (MAP[y][x] === 0) {
        player.position.set(x * TILE_SIZE + 5, y * TILE_SIZE + 5);
        return;
      }
    }
  }
}

// Start the game
init();
