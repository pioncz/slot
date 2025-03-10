import { Container } from 'pixi.js';
import { Tile, TileType } from './tile';

export interface MapOptions {
  worldContainer: Container;
}

export class Map {
  private groundLayer: Container;
  private objectLayer: Container;
  private playerLayer: Container;
  private tiles: Tile[][] = [];

  // World map definition (0 = grass, 1 = wall, 2 = water)
  private readonly WORLD_MAP = [
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

  constructor(options: MapOptions) {
    // Create layers
    this.groundLayer = new Container();
    this.objectLayer = new Container();
    this.playerLayer = new Container();

    // Add layers to the world container
    options.worldContainer.addChild(this.groundLayer);
    options.worldContainer.addChild(this.objectLayer);
    options.worldContainer.addChild(this.playerLayer);
  }

  public draw(): void {
    // Create and draw all tiles in one pass
    this.createTiles();
  }

  private createTiles(): void {
    for (let y = 0; y < this.WORLD_MAP.length; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.WORLD_MAP[y].length; x++) {
        // Convert map data to tile type
        let tileType: TileType;
        switch (this.WORLD_MAP[y][x]) {
          case 0:
            tileType = TileType.Grass;
            break;
          case 1:
            tileType = TileType.Wall;
            break;
          case 2:
            tileType = TileType.Water;
            break;
          default:
            tileType = TileType.Grass;
        }

        // Create a new tile and have it draw itself immediately
        this.tiles[y][x] = new Tile({
          gridX: x,
          gridY: y,
          type: tileType,
          groundLayer: this.groundLayer,
          objectLayer: this.objectLayer,
          debug: true,
        });
      }
    }
  }

  // Improved collision detection accounting for player size
  public isWalkableTile(gridX: number, gridY: number, playerSize: number = 0.5): boolean {
    // Define the player's bounding box points (centered at gridX, gridY with size of playerSize)
    const halfSize = playerSize / 2;
    
    // Check all four corners of the player's bounding box
    const corners = [
      { x: gridX - halfSize, y: gridY - halfSize }, // Top-left
      { x: gridX + halfSize, y: gridY - halfSize }, // Top-right
      { x: gridX - halfSize, y: gridY + halfSize }, // Bottom-left
      { x: gridX + halfSize, y: gridY + halfSize }  // Bottom-right
    ];
    
    // Check each corner to see if it's in a non-walkable tile
    for (const corner of corners) {
      // Convert to grid coordinates to check against map
      const checkX = Math.floor(corner.x);
      const checkY = Math.floor(corner.y);
      
      // Check bounds
      if (
        checkX < 0 ||
        checkX >= this.WORLD_MAP[0].length ||
        checkY < 0 ||
        checkY >= this.WORLD_MAP.length
      ) {
        return false;
      }
      
      // If any corner is in a non-walkable tile, return false
      if (this.WORLD_MAP[checkY][checkX] !== 0) {
        return false;
      }
    }
    
    // All corners are in walkable tiles
    return true;
  }

  // Get player layer for sorting
  public getPlayerLayer(): Container {
    return this.playerLayer;
  }

  // Find first walkable tile (used for initialization)
  public findFirstWalkableTile(): { x: number; y: number } {
    let returnX = 1;
    let returnY = 1;
    let found = false;

    for (let y = 1; y < this.WORLD_MAP.length - 1; y++) {
      for (let x = 1; x < this.WORLD_MAP[y].length - 1; x++) {
        if (this.WORLD_MAP[y][x] === 0) {
          returnX = x;
          returnY = y;
          found = true;
          break;
        }
      }

      if (found) {
        break;
      }
    }

    return { x: returnX + 0.5, y: returnY + 0.5 };
  }
}
