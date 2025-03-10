import { Container, Graphics, FederatedPointerEvent } from 'pixi.js';
import { Map } from './Map';

// Direction enum for player movement
enum Direction {
  North = 'north',
  East = 'east',
  South = 'south',
  West = 'west'
}

export class Player {
  private container: Container;
  private map: Map;
  private graphic: Graphics;
  
  // Player state
  private state = {
    gridX: 5,
    gridY: 5,
    x: 0,
    y: 0,
    targetGridX: 5,
    targetGridY: 5,
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
  };
  
  // Player constants
  readonly PLAYER_WIDTH = 32;
  readonly PLAYER_HEIGHT = 48;
  readonly PLAYER_SPEED = 0.1;
  
  constructor(worldContainer: Container, map: Map) {
    this.container = worldContainer;
    this.map = map;
    this.graphic = new Graphics();
  }
  
  public init(): void {
    // Find a valid starting position
    const validPosition = this.map.findFirstWalkableTile();
    this.state.gridX = validPosition.x;
    this.state.gridY = validPosition.y;
    
    // Set target to match current position
    this.state.targetGridX = this.state.gridX;
    this.state.targetGridY = this.state.gridY;
    
    // Calculate isometric coordinates
    const isoPos = this.map.gridToIso(this.state.gridX, this.state.gridY);
    this.state.x = isoPos.x;
    this.state.y = isoPos.y;
    
    // Create player graphic
    this.updateGraphics();
    
    // Position player
    this.graphic.position.set(
      this.state.x,
      this.state.y - this.PLAYER_HEIGHT + this.map.TILE_HEIGHT / 2,
    );
    
    this.map.getPlayerLayer().addChild(this.graphic);
    
    console.log(
      `Player starting at grid position: ${this.state.gridX},${this.state.gridY}`,
    );
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
    }
  }
  
  public handlePointerDown(event: FederatedPointerEvent): void {
    // Convert screen position to world position
    const worldX = event.global.x - this.container.x;
    const worldY = event.global.y - this.container.y;
    
    // Convert to grid coordinates
    const { gridX, gridY } = this.map.isoToGrid(worldX, worldY);
    
    // Check if target is valid
    if (this.map.isWalkableTile(gridX, gridY)) {
      this.state.targetGridX = gridX;
      this.state.targetGridY = gridY;
    }
  }
  
  public update(time: any): void {
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
      
      // Check if the new grid position is valid
      if (this.map.isWalkableTile(newGridX, newGridY)) {
        // Update grid position
        this.state.gridX = newGridX;
        this.state.gridY = newGridY;
        
        // Update isometric position based on the grid
        const isoPos = this.map.gridToIso(this.state.gridX, this.state.gridY);
        this.state.x = isoPos.x;
        this.state.y = isoPos.y;
        
        // Update animation frame every few ticks
        if (time.deltaTime % 10 < 1) {
          this.state.animationFrame = (this.state.animationFrame + 1) % 4;
        }
      } else {
        // We hit a wall, stop moving
        this.state.isMoving = false;
      }
    }
    
    // Update player graphics
    this.updateGraphics();
    
    // Update player sprite position
    this.graphic.position.set(
      this.state.x,
      this.state.y - this.PLAYER_HEIGHT + this.map.TILE_HEIGHT / 2,
    );
    
    // Sort objects by depth for proper rendering
    this.sortObjectsByDepth();
  }
  
  // Update player graphics based on movement state and direction
  private updateGraphics(): void {
    this.graphic.clear();
    
    // Determine color based on movement
    const color = this.state.isMoving ? 0xffaa00 : 0xff0000;
    
    // Draw an isometric character (diamond base with a "body")
    this.graphic.beginFill(color);
    
    // Base/feet
    this.graphic.moveTo(this.PLAYER_WIDTH / 2, this.PLAYER_HEIGHT - this.map.TILE_HEIGHT / 2);
    this.graphic.lineTo(this.PLAYER_WIDTH, this.PLAYER_HEIGHT - this.map.TILE_HEIGHT / 4);
    this.graphic.lineTo(this.PLAYER_WIDTH / 2, this.PLAYER_HEIGHT);
    this.graphic.lineTo(0, this.PLAYER_HEIGHT - this.map.TILE_HEIGHT / 4);
    this.graphic.closePath();
    this.graphic.endFill();
    
    // Body
    this.graphic.beginFill(color);
    this.graphic.drawRect(
      this.PLAYER_WIDTH / 4,
      0,
      this.PLAYER_WIDTH / 2,
      this.PLAYER_HEIGHT - this.map.TILE_HEIGHT / 4,
    );
    this.graphic.endFill();
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
    return this.state.y;
  }
}
