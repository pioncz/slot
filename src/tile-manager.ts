// src/managers/TileManager.ts
import { Tile } from './tile';
import { FloorManager } from './floor-manager';
import WORLD_MAP from './data/world.json';

export class TileManager {
  private tiles: Tile[][][] = [];
  private floorManager: FloorManager;

  constructor(floorManager: FloorManager) {
    this.floorManager = floorManager;

    // Initialize tiles array for each floor
    for (let floor = 0; floor < WORLD_MAP.floors.length; floor++) {
      this.tiles[floor] = [];
      for (let y = 0; y < WORLD_MAP.floors[floor].length; y++) {
        this.tiles[floor][y] = [];
      }
    }
  }

  public createTiles(): void {
    // Create tiles for each floor
    for (let floor = 0; floor < WORLD_MAP.floors.length; floor++) {
      for (let y = 0; y < WORLD_MAP.floors[floor].length; y++) {
        for (let x = 0; x < WORLD_MAP.floors[floor][y].length; x++) {
          // Skip drawing tiles for upper floors that are empty space
          if (
            floor > 0 &&
            WORLD_MAP.floors[floor][y][x][0] === 0 &&
            !WORLD_MAP.floors[floor][y][x][1]
          ) {
            continue;
          }

          this.createTile(floor, x, y);
        }
      }
    }
  }

  private createTile(floor: number, x: number, y: number): void {
    const [tileType, hasStairs, stairsDirection] =
      WORLD_MAP.floors[floor][y][x];
    const floorContainers =
      this.floorManager.getFloorContainers(floor);

    this.tiles[floor][y][x] = new Tile({
      gridX: x,
      gridY: y,
      floor: floor,
      type: tileType,
      hasStairs: hasStairs,
      stairsDirection: stairsDirection,
      groundLayer: floorContainers.ground,
      objectLayer: floorContainers.objects,
      debug: true,
    });
  }

  public createStairs(
    x: number,
    y: number,
    fromFloor: number,
    toFloor: number,
  ): boolean {
    // Validate input
    if (
      fromFloor < 0 ||
      fromFloor >= WORLD_MAP.floors.length ||
      toFloor < 0 ||
      toFloor >= WORLD_MAP.floors.length ||
      x < 0 ||
      x >= WORLD_MAP.floors[fromFloor][0].length ||
      y < 0 ||
      y >= WORLD_MAP.floors[fromFloor].length
    ) {
      return false;
    }

    // Set direction (positive for up, negative for down)
    const direction = toFloor > fromFloor ? 1 : -1;

    // Update world data
    WORLD_MAP.floors[fromFloor][y][x] = [0, true, direction];
    WORLD_MAP.floors[toFloor][y][x] = [0, true, -direction];

    // Update tiles
    const fromFloorContainers =
      this.floorManager.getFloorContainers(fromFloor);
    const toFloorContainers =
      this.floorManager.getFloorContainers(toFloor);

    // Create updated tiles
    this.tiles[fromFloor][y][x] = new Tile({
      gridX: x,
      gridY: y,
      floor: fromFloor,
      type: 0,
      hasStairs: true,
      stairsDirection: direction,
      groundLayer: fromFloorContainers.ground,
      objectLayer: fromFloorContainers.objects,
      debug: true,
    });

    this.tiles[toFloor][y][x] = new Tile({
      gridX: x,
      gridY: y,
      floor: toFloor,
      type: 0,
      hasStairs: true,
      stairsDirection: -direction,
      groundLayer: toFloorContainers.ground,
      objectLayer: toFloorContainers.objects,
      debug: true,
    });

    return true;
  }
}
