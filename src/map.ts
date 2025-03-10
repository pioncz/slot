import { Container } from 'pixi.js';
import { Tile, TileType } from './tile';

export interface MapOptions {
  worldContainer: Container;
}

export class Map {
  private groundLayer: Container;
  private objectLayer: Container;
  private playerLayer: Container;

  // Store layers for each floor
  private floorContainers: Record<
    number,
    { ground: Container; objects: Container }
  > = {};

  // Keep track of current floor the player is on
  private currentFloor: number = 0;

  // Multi-dimensional map data: [floor][y][x] = [tileType, hasStairs, stairsDirection]
  // stairsDirection: 1 = up, -1 = down, 0 = no stairs
  private readonly WORLD_MAP: [number, boolean, number][][][] = [
    // Floor 0 (Ground Level)
    [
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [2, false, 0],
        [2, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [2, false, 0],
        [2, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [2, false, 0],
        [2, false, 0],
        [2, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, true, 1],
        [2, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [2, false, 0],
        [2, false, 0],
        [2, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
    ],
    // Floor 1 (Upper level floor)
    [
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, true, -1],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [0, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
      [
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
        [1, false, 0],
      ],
    ],
  ];

  // Tiles storage per floor
  private tiles: Tile[][][] = [];

  constructor(options: MapOptions) {
    // Create base layers for the ground floor (floor 0)
    this.groundLayer = new Container();
    this.objectLayer = new Container();
    this.playerLayer = new Container();

    // Initialize floor containers for floor 0
    this.floorContainers[0] = {
      ground: this.groundLayer,
      objects: this.objectLayer,
    };

    // Create containers for additional floors
    for (let floor = 1; floor < this.WORLD_MAP.length; floor++) {
      const floorGround = new Container();
      const floorObjects = new Container();

      // Initialize floor containers for each floor
      this.floorContainers[floor] = {
        ground: floorGround,
        objects: floorObjects,
      };
    }

    // Add layers to the world container in the correct order (bottom to top)
    for (let floor = 0; floor < this.WORLD_MAP.length; floor++) {
      options.worldContainer.addChild(
        this.floorContainers[floor].ground,
      );
      options.worldContainer.addChild(
        this.floorContainers[floor].objects,
      );
    }

    // Add player layer last so it's always on top
    options.worldContainer.addChild(this.playerLayer);

    // Initialize tiles array for each floor
    for (let floor = 0; floor < this.WORLD_MAP.length; floor++) {
      this.tiles[floor] = [];
      for (let y = 0; y < this.WORLD_MAP[floor].length; y++) {
        this.tiles[floor][y] = [];
      }
    }
  }

  public draw(): void {
    // Create and draw all tiles for all floors
    this.createTiles();
  }

  private createTiles(): void {
    // Create tiles for each floor
    for (let floor = 0; floor < this.WORLD_MAP.length; floor++) {
      for (let y = 0; y < this.WORLD_MAP[floor].length; y++) {
        for (let x = 0; x < this.WORLD_MAP[floor][y].length; x++) {
          // Get tile data
          const [tileType, hasStairs, stairsDirection] =
            this.WORLD_MAP[floor][y][x];

          // Skip drawing tiles for upper floors that are empty space (not walls)
          // This allows us to see through to lower floors
          if (floor > 0 && tileType === 0 && !hasStairs) {
            continue;
          }

          // Create a new tile
          this.tiles[floor][y][x] = new Tile({
            gridX: x,
            gridY: y,
            floor: floor,
            type: tileType,
            hasStairs: hasStairs,
            stairsDirection: stairsDirection,
            groundLayer: this.floorContainers[floor].ground,
            objectLayer: this.floorContainers[floor].objects,
            debug: true,
          });
        }
      }
    }

    // Initially hide upper floors
    this.setFloorVisibility(0);
  }

  // Set visibility for floors
  private setFloorVisibility(activeFloor: number): void {
    // Hide all floors first
    for (
      let floor = 0;
      floor < Object.keys(this.floorContainers).length;
      floor++
    ) {
      const isVisible = floor <= activeFloor;

      // Make current and lower floors visible, higher floors invisible
      this.floorContainers[floor].ground.visible = isVisible;
      this.floorContainers[floor].objects.visible = isVisible;

      // Adjust alpha for floors below the current one (makes them darker)
      if (floor < activeFloor) {
        this.floorContainers[floor].ground.alpha = 0.5;
        this.floorContainers[floor].objects.alpha = 0.5;
      } else {
        this.floorContainers[floor].ground.alpha = 1;
        this.floorContainers[floor].objects.alpha = 1;
      }
    }

    // Update current floor
    this.currentFloor = activeFloor;
  }

  // Check if the player is on stairs and return the direction (-1 for down, 1 for up, 0 for not on stairs)
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
      tileX >= this.WORLD_MAP[currentFloor][0].length ||
      tileY < 0 ||
      tileY >= this.WORLD_MAP[currentFloor].length
    ) {
      return 0;
    }

    // Get tile data
    const [_, hasStairs, stairsDirection] =
      this.WORLD_MAP[currentFloor][tileY][tileX];

    // Return stairs direction if player is on stairs
    return hasStairs ? stairsDirection : 0;
  }

  // Change player floor level
  public changeFloor(newFloor: number): boolean {
    // Validate new floor
    if (newFloor < 0 || newFloor >= this.WORLD_MAP.length) {
      return false;
    }

    // Update floor visibility
    this.setFloorVisibility(newFloor);
    console.log(`Player moved to floor ${newFloor}`);
    return true;
  }

  public isWalkableTile(
    gridX: number,
    gridY: number,
    currentFloor: number,
    playerSize: number = 0.5,
  ): boolean {
    // Define the player's bounding box points (centered at gridX, gridY with size of playerSize)
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
      // Convert to grid coordinates to check against map
      const checkX = Math.floor(corner.x);
      const checkY = Math.floor(corner.y);

      // Check bounds
      if (
        checkX < 0 ||
        checkX >= this.WORLD_MAP[currentFloor][0].length ||
        checkY < 0 ||
        checkY >= this.WORLD_MAP[currentFloor].length
      ) {
        return false;
      }

      // If any corner is in a non-walkable tile, return false (tile type 0 is walkable)
      const [tileType, _, __] =
        this.WORLD_MAP[currentFloor][checkY][checkX];
      if (tileType !== 0) {
        return false;
      }
    }

    // All corners are in walkable tiles
    return true;
  }

  // Find first walkable tile (used for initialization)
  public findFirstWalkableTile(floor: number = 0): {
    x: number;
    y: number;
    floor: number;
  } {
    let returnX = 1;
    let returnY = 1;
    let found = false;

    for (let y = 1; y < this.WORLD_MAP[floor].length - 1; y++) {
      for (let x = 1; x < this.WORLD_MAP[floor][y].length - 1; x++) {
        const [tileType, _, __] = this.WORLD_MAP[floor][y][x];
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

  // Get current active floor
  public getCurrentFloor(): number {
    return this.currentFloor;
  }

  // Get player layer for sorting
  public getPlayerLayer(): Container {
    return this.playerLayer;
  }

  // Add a new method to add a floor
  public addNewFloor(): number {
    // Create a new floor based on a template (copy of floor 1 structure)
    const newFloorIndex = this.WORLD_MAP.length;

    // Create a template floor (similar to floor 1 but empty)
    const templateFloor: [number, boolean, number][][] = [];

    // Copy the structure from floor 1
    for (let y = 0; y < this.WORLD_MAP[0].length; y++) {
      templateFloor[y] = [];
      for (let x = 0; x < this.WORLD_MAP[0][y].length; x++) {
        // Make all tiles walls by default
        templateFloor[y][x] = [1, false, 0];
      }
    }

    // Add the new floor data
    this.WORLD_MAP.push(templateFloor);

    // Create containers for the new floor
    const floorGround = new Container();
    const floorObjects = new Container();

    // Initialize floor containers for the new floor
    this.floorContainers[newFloorIndex] = {
      ground: floorGround,
      objects: floorObjects,
    };

    // Add layers to the world container
    this.container.addChild(
      this.floorContainers[newFloorIndex].ground,
    );
    this.container.addChild(
      this.floorContainers[newFloorIndex].objects,
    );

    // Initialize tiles array for the new floor
    this.tiles[newFloorIndex] = [];
    for (let y = 0; y < templateFloor.length; y++) {
      this.tiles[newFloorIndex][y] = [];
    }

    // Return the index of the new floor
    return newFloorIndex;
  }

  // Method to create a staircase between floors
  public createStairs(
    x: number,
    y: number,
    fromFloor: number,
    toFloor: number,
  ): boolean {
    // Validate input
    if (
      fromFloor < 0 ||
      fromFloor >= this.WORLD_MAP.length ||
      toFloor < 0 ||
      toFloor >= this.WORLD_MAP.length ||
      x < 0 ||
      x >= this.WORLD_MAP[fromFloor][0].length ||
      y < 0 ||
      y >= this.WORLD_MAP[fromFloor].length
    ) {
      return false;
    }

    // Set direction (positive for up, negative for down)
    const direction = toFloor > fromFloor ? 1 : -1;

    // Update the from floor tile to have stairs
    this.WORLD_MAP[fromFloor][y][x] = [0, true, direction];

    // Update the to floor tile to have stairs in the opposite direction
    this.WORLD_MAP[toFloor][y][x] = [0, true, -direction];

    // Redraw the tiles
    if (this.tiles[fromFloor][y][x]) {
      // Remove old tile
      // Note: In a real implementation, you'd need to remove the tile properly
      // This is simplified for the example
      const fromTile = new Tile({
        gridX: x,
        gridY: y,
        floor: fromFloor,
        type: 0,
        hasStairs: true,
        stairsDirection: direction,
        groundLayer: this.floorContainers[fromFloor].ground,
        objectLayer: this.floorContainers[fromFloor].objects,
        debug: true,
      });

      this.tiles[fromFloor][y][x] = fromTile;
    }

    // Create or update the destination tile
    const toTile = new Tile({
      gridX: x,
      gridY: y,
      floor: toFloor,
      type: 0,
      hasStairs: true,
      stairsDirection: -direction,
      groundLayer: this.floorContainers[toFloor].ground,
      objectLayer: this.floorContainers[toFloor].objects,
      debug: true,
    });

    this.tiles[toFloor][y][x] = toTile;

    return true;
  }
}
