import { Container, Graphics } from 'pixi.js';
import { Tile, TileType } from './Tile';

export class Map {
  private groundLayer: Container;
  private objectLayer: Container;
  private playerLayer: Container;
  private tiles: Tile[][] = [];

  // Map constants
  readonly TILE_WIDTH = 64;
  readonly TILE_HEIGHT = 32;
  readonly TILE_DEPTH = 32;

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

  constructor(worldContainer: Container) {
    // Create layers
    this.groundLayer = new Container();
    this.objectLayer = new Container();
    this.playerLayer = new Container();

    // Add layers to the world container
    worldContainer.addChild(this.groundLayer);
    worldContainer.addChild(this.objectLayer);
    worldContainer.addChild(this.playerLayer);
  }

  public draw(): void {
    // Create the tile objects from the map data
    this.createTiles();

    // Draw all tiles
    for (let y = 0; y < this.WORLD_MAP.length; y++) {
      for (let x = 0; x < this.WORLD_MAP[y].length; x++) {
        const tile = this.tiles[y][x];
        tile.draw(this.groundLayer, this.objectLayer);
      }
    }
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

        // Create a new tile
        this.tiles[y][x] = new Tile(
          x,
          y,
          tileType,
          this.TILE_WIDTH,
          this.TILE_HEIGHT,
          this.TILE_DEPTH,
        );
      }
    }
  }

  // Grid to screen coordinates conversion
  public gridToIso(
    gridX: number,
    gridY: number,
  ): { x: number; y: number } {
    return {
      x: (gridX - gridY) * (this.TILE_WIDTH / 2),
      y: (gridX + gridY) * (this.TILE_HEIGHT / 2),
    };
  }

  // Screen to grid coordinates conversion
  public isoToGrid(
    x: number,
    y: number,
  ): { gridX: number; gridY: number } {
    const gridX = Math.floor(
      (x / (this.TILE_WIDTH / 2) + y / (this.TILE_HEIGHT / 2)) / 2,
    );
    const gridY = Math.floor(
      (y / (this.TILE_HEIGHT / 2) - x / (this.TILE_WIDTH / 2)) / 2,
    );
    return { gridX, gridY };
  }

  // Check if a tile is walkable
  public isWalkableTile(gridX: number, gridY: number): boolean {
    // Check bounds
    if (
      gridX < 0 ||
      gridX >= this.WORLD_MAP[0].length ||
      gridY < 0 ||
      gridY >= this.WORLD_MAP.length
    ) {
      return false;
    }

    const gridXDec = Math.floor(gridX);
    const gridYDec = Math.floor(gridY);

    // Check if tile is walkable (grass, type 0)
    return this.WORLD_MAP[gridYDec][gridXDec] === 0;
  }

  // Get player layer for sorting
  public getPlayerLayer(): Container {
    return this.playerLayer;
  }

  // Find first walkable tile (used for initialization)
  public findFirstWalkableTile(): { x: number; y: number } {
    for (let y = 1; y < this.WORLD_MAP.length - 1; y++) {
      for (let x = 1; x < this.WORLD_MAP[y].length - 1; x++) {
        if (this.WORLD_MAP[y][x] === 0) {
          return { x, y };
        }
      }
    }
    // Fallback - should never happen with the current map
    return { x: 1, y: 1 };
  }
}
