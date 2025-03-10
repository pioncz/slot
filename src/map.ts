import { Container } from 'pixi.js';
import { Tile, TileType } from './tile';
import { gridToIso, isoToGrid, TILE_HEIGHT } from './lib/map-helpers';

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
          debug: true
        });
      }
    }
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

  // For accessing TILE_HEIGHT in Player class
  public get tileHeight(): number {
    return TILE_HEIGHT;
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

  // These pass-through methods have been removed
  // Import gridToIso and isoToGrid directly from './lib/map-helpers' instead
}
