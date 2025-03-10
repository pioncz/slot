// ============================================================================
// 3. Update the player.ts file to support floor navigation
// ============================================================================

import { Container, Graphics, Text } from 'pixi.js';
import { Map } from './map';
import { TILE_HEIGHT, gridToIso } from './lib/map-helpers';

// Direction enum for player movement
enum Direction {
  North = 'north',
  East = 'east',
  South = 'south',
  West = 'west',
}

export interface PlayerOptions {
  worldContainer: Container;
  map: Map;
}

export class Player {
  private container: Container;
  private map: Map;
  private graphic: Graphics;

  // Player state
  private state = {
    gridX: 5,
    gridY: 5,
    floor: 0, // Add floor level
    x: 0,
    y: 0,
    isMoving: false,
    direction: Direction.South,
    animationFrame: 0,
  };

  // Input state
  private keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false, // New key for interaction (use stairs)
  };

  // Interaction cooldown timer (prevents rapidly switching floors)
  private interactionCooldown = 0;
  private readonly INTERACTION_COOLDOWN_MAX = 30; // About half a second

  // Player constants
  readonly PLAYER_WIDTH = 32;
  readonly PLAYER_HEIGHT = 48;
  readonly PLAYER_SPEED = 0.1;

  constructor(options: PlayerOptions) {
    this.container = options.worldContainer;
    this.map = options.map;
    this.graphic = new Graphics();
  }

  public init(): void {
    // Find a valid starting position
    const validPosition = this.map.findFirstWalkableTile();

    // Make sure we're using integer grid coordinates to start
    // This ensures player is properly aligned with grid cells
    this.state.gridX = validPosition.x;
    this.state.gridY = validPosition.y;
    this.state.floor = validPosition.floor;

    // Calculate isometric coordinates using the helper function
    const isoPos = gridToIso(this.state.gridX, this.state.gridY);
    this.state.x = isoPos.x;
    this.state.y = isoPos.y;

    // Create player graphic
    this.updateGraphics();

    // Position player
    this.graphic.position.set(this.state.x, this.state.y);

    // Add the debug indicator
    this.addDebugIndicator();

    this.map.getPlayerLayer().addChild(this.graphic);

    console.log(
      `Player starting at grid position: ${this.state.gridX},${this.state.gridY} on floor ${this.state.floor}`,
    );
  }

  private addDebugIndicator(): void {
    // Add a debug indicator to the player container
    const debugText = new Text({
      text: `Grid: ${Math.floor(this.state.gridX)},${Math.floor(
        this.state.gridY,
      )} F${this.state.floor}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 'white',
        stroke: {
          color: 'black',
          width: 2,
        },
        align: 'center',
      },
    });

    // Position above the player
    debugText.position.set(0, -this.PLAYER_HEIGHT - 10);

    // Set anchor to center horizontally
    debugText.anchor.set(0.5, 0);

    this.graphic.addChild(debugText);
  }

  public handleKeyDown(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.keys.up = true;
        break;
      case 's':
      case 'arrowdown':
        this.keys.down = true;
        break;
      case 'a':
      case 'arrowleft':
        this.keys.left = true;
        break;
      case 'd':
      case 'arrowright':
        this.keys.right = true;
        break;
      case 'e':
      case ' ':
        this.keys.interact = true;
        break;
    }
  }

  public handleKeyUp(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.keys.up = false;
        break;
      case 's':
      case 'arrowdown':
        this.keys.down = false;
        break;
      case 'a':
      case 'arrowleft':
        this.keys.left = false;
        break;
      case 'd':
      case 'arrowright':
        this.keys.right = false;
        break;
      case 'e':
      case ' ':
        this.keys.interact = false;
        break;
    }
  }

  public update(time: any): void {
    // Decrease interaction cooldown if active
    if (this.interactionCooldown > 0) {
      this.interactionCooldown--;
    }
    
    // Reset movement flag at the start of each frame
    this.state.isMoving = false;

    // Calculate potential new position based on keyboard input
    let moveX = 0;
    let moveY = 0;

    // Determine movement direction based on keys
    if (this.keys.up) {
      moveY = -1;
      this.state.direction = Direction.North;
      this.state.isMoving = true;
    } else if (this.keys.down) {
      moveY = 1;
      this.state.direction = Direction.South;
      this.state.isMoving = true;
    }

    if (this.keys.left) {
      moveX = -1;
      this.state.direction = Direction.West;
      this.state.isMoving = true;
    } else if (this.keys.right) {
      moveX = 1;
      this.state.direction = Direction.East;
      this.state.isMoving = true;
    }

    // Check for interaction (stairs usage)
    if (this.keys.interact && this.interactionCooldown === 0) {
      const stairsDirection = this.map.checkForStairs(
        this.state.gridX,
        this.state.gridY,
        this.state.floor
      );
      
      if (stairsDirection !== 0) {
        // Attempt to change floors
        const newFloor = this.state.floor + stairsDirection;
        const success = this.map.changeFloor(newFloor);
        
        if (success) {
          this.state.floor = newFloor;
          
          // Set cooldown to prevent rapid stair usage
          this.interactionCooldown = this.INTERACTION_COOLDOWN_MAX;
          
          console.log(`Player moved to floor ${this.state.floor}`);
        }
      }
    }

    // If there's movement input, move the player
    if (this.state.isMoving) {
      // Determine grid-level movement based on key presses
      let newGridX = this.state.gridX;
      let newGridY = this.state.gridY;

      // Simple direct grid movement
      if (moveX > 0) newGridX += this.PLAYER_SPEED;
      if (moveX < 0) newGridX -= this.PLAYER_SPEED;
      if (moveY > 0) newGridY += this.PLAYER_SPEED;
      if (moveY < 0) newGridY -= this.PLAYER_SPEED;

      // Check if the new grid position is valid on the current floor
      if (this.map.isWalkableTile(newGridX, newGridY, this.state.floor)) {
        // Update grid position
        this.state.gridX = newGridX;
        this.state.gridY = newGridY;
        // Update isometric position based on the grid directly using the helper function
        const isoPos = gridToIso(this.state.gridX, this.state.gridY);
        this.state.x = isoPos.x;
        this.state.y = isoPos.y;

        // Update animation frame every few ticks
        if (time.deltaTime % 10 < 1) {
          this.state.animationFrame =
            (this.state.animationFrame + 1) % 4;
        }

        // Update the debug text if it exists
        if (this.graphic.children.length > 0) {
          const debugText = this.graphic.children[0] as Text;
          debugText.text = `Grid: ${Math.floor(
            this.state.gridX,
          )},${Math.floor(this.state.gridY)} F${this.state.floor}`;
        }
      } else {
        // We hit a wall, stop moving
        this.state.isMoving = false;
      }
    }

    // Update player graphics
    this.updateGraphics();

    // Update player sprite position
    this.graphic.position.set(this.state.x, this.state.y);

    // Apply vertical offset based on floor level
    // This ensures the player appears at the correct height on each floor
    const floorOffset = this.state.floor * (32 + 5); // Match the tile's floor offset
    this.graphic.position.y -= floorOffset;

    // Sort objects by depth for proper rendering
    this.sortObjectsByDepth();
  }

  // Update player graphics based on movement state and direction
  private updateGraphics(): void {
    this.graphic.clear();

    // Determine color based on floor level
    const floorColors = [0xff0000, 0xffaa00, 0xffff00, 0x00ff00, 0x00ffff];
    const color = floorColors[this.state.floor % floorColors.length];

    // Draw the isometric character (diamond base with a "body")
    // Important: Draw the player centered at (0,0) within its own Graphics object

    // Base/feet - centered diamond shape
    this.graphic.moveTo(0, -TILE_HEIGHT / 4); // Top point
    this.graphic.lineTo(this.PLAYER_WIDTH / 2, 0); // Right point
    this.graphic.lineTo(0, TILE_HEIGHT / 4); // Bottom point
    this.graphic.lineTo(-this.PLAYER_WIDTH / 2, 0); // Left point
    this.graphic.closePath();
    this.graphic.fill({ color });

    // Body - centered rectangle
    this.graphic.rect(
      -this.PLAYER_WIDTH / 4,
      -this.PLAYER_HEIGHT + TILE_HEIGHT / 4,
      this.PLAYER_WIDTH / 2,
      this.PLAYER_HEIGHT - TILE_HEIGHT / 4,
    );
    this.graphic.fill({ color });
  }

  // Sort objects by their y position for proper layering
  private sortObjectsByDepth(): void {
    this.map.getPlayerLayer().children.sort((a, b) => {
      return a.position.y - b.position.y;
    });
  }

  // Getters for screen position (used by camera)
  public getScreenX(): number {
    return this.state.x;
  }

  public getScreenY(): number {
    // Include floor offset in screen Y position for camera following
    const floorOffset = this.state.floor * (32 + 5); // Match tile floor offset
    return this.state.y - floorOffset;
  }
  
  // Get the player's current floor
  public getCurrentFloor(): number {
    return this.state.floor;
  }
}