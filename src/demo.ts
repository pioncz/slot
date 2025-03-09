import {
  Application,
  Container,
  Graphics,
  Sprite,
  Texture,
  Assets,
  FederatedPointerEvent,
} from 'pixi.js';
import './style.css';

const round = (num, places) =>
  Math.round(num * Math.pow(10, places)) / Math.pow(10, places);

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
const TILE_WIDTH = 64; // Width of an isometric tile
const TILE_HEIGHT = 32; // Height of an isometric tile
const TILE_DEPTH = 32; // Visual height of walls and objects
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48; // Taller for the character sprite
const PLAYER_SPEED = 0.1; // Reduced for isometric movement
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
(document.getElementById('app') || document.body).appendChild(
  app.canvas,
);

// Create world container (which will be moved to simulate camera)
const worldContainer = new Container();
app.stage.addChild(worldContainer);

// Create containers for different layers
const groundLayer = new Container();
const objectLayer = new Container();
const playerLayer = new Container();
worldContainer.addChild(groundLayer);
worldContainer.addChild(objectLayer);
worldContainer.addChild(playerLayer);

// Player state
const playerState = {
  gridX: 5, // Grid coordinates
  gridY: 5,
  x: 0, // Screen coordinates (will be calculated)
  y: 0,
  targetGridX: 5,
  targetGridY: 5,
  isMoving: false,
  direction: 'south', // 'north', 'east', 'south', 'west'
  animationFrame: 0,
};

// Sprite textures for player (placeholder - you would load actual sprite sheets)
const playerTextures = {
  north: [],
  east: [],
  south: [],
  west: [],
};

// Function to convert grid coordinates to isometric screen coordinates
function gridToIso(
  gridX: number,
  gridY: number,
): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

// Function to convert isometric screen coordinates to grid coordinates
function isoToGrid(
  x: number,
  y: number,
): { gridX: number; gridY: number } {
  // More accurate conversion for isometric coordinates
  const gridX = Math.floor(
    (x / (TILE_WIDTH / 2) + y / (TILE_HEIGHT / 2)) / 2,
  );
  const gridY = Math.floor(
    (y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2,
  );
  return { gridX, gridY };
}

// Draw isometric map
function drawMap() {
  // Draw ground tiles
  for (let y = 0; y < WORLD_MAP.length; y++) {
    for (let x = 0; x < WORLD_MAP[y].length; x++) {
      // Convert grid coordinates to isometric
      const { x: isoX, y: isoY } = gridToIso(x, y);

      // Create tile graphic based on type
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

      // Draw the isometric tile (diamond shape)
      tile.beginFill(fillColor);
      tile.moveTo(TILE_WIDTH / 2, 0);
      tile.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
      tile.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
      tile.lineTo(0, TILE_HEIGHT / 2);
      tile.closePath();
      tile.endFill();

      // Position the tile
      tile.position.set(isoX, isoY);
      groundLayer.addChild(tile);

      // For walls and objects, add a "depth" component
      if (WORLD_MAP[y][x] === 1) {
        // Wall
        const wall = new Graphics();
        wall.beginFill(0x606060); // Slightly darker for the wall face

        // Draw the wall side
        wall.moveTo(0, TILE_HEIGHT / 2);
        wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
        wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT + TILE_DEPTH);
        wall.lineTo(0, TILE_HEIGHT / 2 + TILE_DEPTH);
        wall.closePath();
        wall.endFill();

        // Draw the wall face
        wall.beginFill(0x707070);
        wall.moveTo(TILE_WIDTH / 2, TILE_HEIGHT);
        wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
        wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2 + TILE_DEPTH);
        wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT + TILE_DEPTH);
        wall.closePath();
        wall.endFill();

        // Position the wall
        wall.position.set(isoX, isoY);
        objectLayer.addChild(wall);
      } else if (WORLD_MAP[y][x] === 2) {
        // Water
        // Add a slight animation or shine to water tiles
        const waterEffect = new Graphics();
        waterEffect.beginFill(0x6060ff, 0.3);
        waterEffect.moveTo(TILE_WIDTH / 2, 0);
        waterEffect.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
        waterEffect.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
        waterEffect.lineTo(0, TILE_HEIGHT / 2);
        waterEffect.closePath();
        waterEffect.endFill();

        waterEffect.position.set(isoX, isoY);
        objectLayer.addChild(waterEffect);
      }
    }
  }
}

// Create player sprite
const player = new Graphics();
function createPlayer() {
  // Calculate initial isometric position
  const { x, y } = gridToIso(playerState.gridX, playerState.gridY);
  playerState.x = x;
  playerState.y = y;

  // Draw player (as a placeholder - would normally be a sprite)
  updatePlayerGraphics();

  // Position player
  player.position.set(
    playerState.x,
    playerState.y - PLAYER_HEIGHT + TILE_HEIGHT / 2,
  );
  playerLayer.addChild(player);
}

// Function to update player graphics based on movement state and direction
function updatePlayerGraphics() {
  player.clear();

  // Determine color based on movement
  const color = playerState.isMoving ? 0xffaa00 : 0xff0000;

  // Draw an isometric character (diamond base with a "body")
  player.beginFill(color);

  // Base/feet
  player.moveTo(PLAYER_WIDTH / 2, PLAYER_HEIGHT - TILE_HEIGHT / 2);
  player.lineTo(PLAYER_WIDTH, PLAYER_HEIGHT - TILE_HEIGHT / 4);
  player.lineTo(PLAYER_WIDTH / 2, PLAYER_HEIGHT);
  player.lineTo(0, PLAYER_HEIGHT - TILE_HEIGHT / 4);
  player.closePath();
  player.endFill();

  // Body
  player.beginFill(color);
  player.drawRect(
    PLAYER_WIDTH / 4,
    0,
    PLAYER_WIDTH / 2,
    PLAYER_HEIGHT - TILE_HEIGHT / 4,
  );
  player.endFill();

  // In a full implementation, you would use different sprite frames based on
  // playerState.direction and playerState.animationFrame
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

// Add mouse/touch input for clicking to move
worldContainer.eventMode = 'static';
worldContainer.on('pointerdown', (event: FederatedPointerEvent) => {
  // Convert screen position to world position
  const worldX = event.global.x - worldContainer.x;
  const worldY = event.global.y - worldContainer.y;

  // Convert to grid coordinates
  const { gridX, gridY } = isoToGrid(worldX, worldY);

  // Check if target is valid
  if (isWalkableTile(gridX, gridY)) {
    playerState.targetGridX = gridX;
    playerState.targetGridY = gridY;
  }
});

// Check if a position is valid (within bounds and walkable)
function isWalkableTile(gridX: number, gridY: number): boolean {
  // Check bounds
  if (
    gridX < 0 ||
    gridX >= WORLD_MAP[0].length ||
    gridY < 0 ||
    gridY >= WORLD_MAP.length
  ) {
    return false;
  }
  const gridXDec = Math.floor(gridX);
  const gridYDec = Math.floor(gridY);

  // Check if tile is walkable (0)
  return WORLD_MAP[gridYDec][gridXDec] === 0;
}

// Additional helper for debugging collision
function debugCollision(x: number, y: number) {
  const debugMarker = new Graphics();
  debugMarker.beginFill(0xff00ff);
  debugMarker.drawCircle(0, 0, 5);
  debugMarker.endFill();
  debugMarker.position.set(x, y);
  worldContainer.addChild(debugMarker);

  // Remove after a second
  setTimeout(() => {
    worldContainer.removeChild(debugMarker);
  }, 1000);
}

// Calculate direction based on movement
function calculateDirection(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): string {
  const dx = toX - fromX;
  const dy = toY - fromY;

  // Determine predominant direction
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'east' : 'west';
  } else {
    return dy > 0 ? 'south' : 'north';
  }
}

// Pathfinding function (simple A*)
function findPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
): Array<{ x: number; y: number }> {
  // A simple direct path for demonstration
  // In a real game, you'd implement A* pathfinding here
  return [{ x: targetX, y: targetY }];
}

// Game loop
app.ticker.add((time) => {
  // Reset movement flag at the start of each frame
  playerState.isMoving = false;

  // Calculate potential new position based on direct keyboard input
  let moveX = 0;
  let moveY = 0;

  // Determine movement direction based on keys
  if (keys.up) {
    moveY = -1;
    playerState.direction = 'north';
    playerState.isMoving = true;
  } else if (keys.down) {
    moveY = 1;
    playerState.direction = 'south';
    playerState.isMoving = true;
  }

  if (keys.left) {
    moveX = -1;
    playerState.direction = 'west';
    playerState.isMoving = true;
  } else if (keys.right) {
    moveX = 1;
    playerState.direction = 'east';
    playerState.isMoving = true;
  }

  // If there's no movement input, character stops immediately
  if (!playerState.isMoving) {
    // Update player visual to stopped state
    updatePlayerGraphics();
  } else {
    // Determine grid-level movement based on key presses
    let newGridX = playerState.gridX;
    let newGridY = playerState.gridY;

    // Simple direct grid movement
    if (moveX > 0) newGridX += PLAYER_SPEED;
    if (moveX < 0) newGridX -= PLAYER_SPEED;
    if (moveY > 0) newGridY += PLAYER_SPEED;
    if (moveY < 0) newGridY -= PLAYER_SPEED;

    // Debug the proposed movement
    console.log(
      `Attempting to move from (${round(
        playerState.gridX,
        2,
      )}, ${round(playerState.gridY, 2)}) to (${round(
        newGridX,
        2,
      )},${round(newGridY, 2)})`,
    );
    console.log(
      `Tile at destination: ${
        WORLD_MAP[Math.floor(newGridY)][Math.floor(newGridX)]
      }`,
    );

    // Check if the new grid position is valid
    if (isWalkableTile(newGridX, newGridY)) {
      // Update grid position
      playerState.gridX = newGridX;
      playerState.gridY = newGridY;

      // Update isometric position based on the grid
      const isoPos = gridToIso(playerState.gridX, playerState.gridY);
      playerState.x = isoPos.x;
      playerState.y = isoPos.y;

      // Update animation frame every few ticks
      if (time.deltaTime % 10 < 1) {
        playerState.animationFrame =
          (playerState.animationFrame + 1) % 4;
      }

      // Update player visual
      updatePlayerGraphics();
    } else {
      // We hit a wall, stop moving
      playerState.isMoving = false;
      updatePlayerGraphics();
    }
  }

  // Update player sprite position
  player.position.set(
    playerState.x,
    playerState.y - PLAYER_HEIGHT + TILE_HEIGHT / 2,
  );

  // Sort the objects in the playerLayer for correct depth
  sortObjectsByDepth();

  // Update camera position (center on player)
  worldContainer.x = VIEWPORT_WIDTH / 2 - playerState.x;
  worldContainer.y = VIEWPORT_HEIGHT / 2 - playerState.y;
});

// Sort objects by their y position for proper layering
function sortObjectsByDepth() {
  playerLayer.children.sort((a, b) => {
    return a.position.y - b.position.y;
  });
}

// Initialize the game
function init() {
  // Draw map first
  drawMap();

  // Set a guaranteed valid starting position
  playerState.gridX = 5;
  playerState.gridY = 5;

  // Check if this position is actually walkable
  if (!isWalkableTile(playerState.gridX, playerState.gridY)) {
    // Fallback: Search for the first walkable tile
    let foundValidTile = false;
    for (let y = 1; y < WORLD_MAP.length - 1; y++) {
      for (let x = 1; x < WORLD_MAP[y].length - 1; x++) {
        if (WORLD_MAP[y][x] === 0) {
          console.log(`Found valid starting position at ${x},${y}`);
          playerState.gridX = x;
          playerState.gridY = y;
          foundValidTile = true;
          break;
        }
      }
      if (foundValidTile) break;
    }

    // If still no valid tile found (extreme edge case)
    if (!foundValidTile) {
      console.error('No walkable tiles found in map!');
      playerState.gridX = 1;
      playerState.gridY = 1;
    }
  }

  // Ensure target matches current position
  playerState.targetGridX = playerState.gridX;
  playerState.targetGridY = playerState.gridY;

  // Calculate isometric coordinates from grid position
  const iso = gridToIso(playerState.gridX, playerState.gridY);
  playerState.x = iso.x;
  playerState.y = iso.y;

  // Now create the player with the confirmed valid position
  createPlayer();

  console.log(
    `Player starting at grid position: ${playerState.gridX},${playerState.gridY}`,
  );
  console.log(
    `Tile value at start position: ${
      WORLD_MAP[playerState.gridY][playerState.gridX]
    }`,
  );
}

// Start the game
init();
