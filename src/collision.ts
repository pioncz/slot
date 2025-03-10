// src/managers/CollisionManager.ts
import WORLD_MAP from './data/world.json';

export class CollisionManager {
  constructor() {}

  public isWalkableTile(
    gridX: number,
    gridY: number,
    currentFloor: number,
    playerSize: number = 0.5,
  ): boolean {
    // Define the player's bounding box points
    const halfSize = playerSize / 2;

    // Check all four corners of the player's bounding box
    const corners = [
      { x: gridX - halfSize, y: gridY - halfSize }, // Top-left
      { x: gridX + halfSize, y: gridY - halfSize }, // Top-right
      { x: gridX - halfSize, y: gridY + halfSize }, // Bottom-left
      { x: gridX + halfSize, y: gridY + halfSize }, // Bottom-right
    ];

    // Check each corner to see if it's in a non-walkable tile
    for (const corner of corners) {
      const checkX = Math.floor(corner.x);
      const checkY = Math.floor(corner.y);

      // Check bounds
      if (
        checkX < 0 ||
        checkX >= WORLD_MAP.floors[currentFloor][0].length ||
        checkY < 0 ||
        checkY >= WORLD_MAP.floors[currentFloor].length
      ) {
        return false;
      }

      // If any corner is in a non-walkable tile, return false
      const [tileType] =
        WORLD_MAP.floors[currentFloor][checkY][checkX];
      if (tileType !== 0) {
        return false;
      }
    }

    // All corners are in walkable tiles
    return true;
  }

  public checkForStairs(
    gridX: number,
    gridY: number,
    currentFloor: number,
  ): number {
    // Convert to integer grid coordinates
    const tileX = Math.floor(gridX);
    const tileY = Math.floor(gridY);

    // Check bounds
    if (
      tileX < 0 ||
      tileX >= WORLD_MAP.floors[currentFloor][0].length ||
      tileY < 0 ||
      tileY >= WORLD_MAP.floors[currentFloor].length
    ) {
      return 0;
    }

    // Get tile data
    const [_, hasStairs, stairsDirection] =
      WORLD_MAP.floors[currentFloor][tileY][tileX];

    // Return stairs direction if player is on stairs
    return hasStairs ? stairsDirection : 0;
  }

  public findFirstWalkableTile(floor: number = 0): {
    x: number;
    y: number;
    floor: number;
  } {
    let returnX = 1;
    let returnY = 1;
    let found = false;

    for (let y = 1; y < WORLD_MAP.floors[floor].length - 1; y++) {
      for (
        let x = 1;
        x < WORLD_MAP.floors[floor][y].length - 1;
        x++
      ) {
        const [tileType] = WORLD_MAP.floors[floor][y][x];
        if (tileType === 0) {
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

    return { x: returnX + 0.5, y: returnY + 0.5, floor };
  }
}
