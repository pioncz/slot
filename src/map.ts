// src/map.ts
import { Container } from 'pixi.js';
import { FloorManager } from './floor-manager';
import { TileManager } from './tile-manager';
import { CollisionManager } from './collision';
import WORLD_MAP from './data/world.json';

export interface MapOptions {
  worldContainer: Container;
}

export class Map {
  private worldContainer: Container;
  private playerLayer: Container;
  private floorManager: FloorManager;
  private tileManager: TileManager;
  private collisionManager: CollisionManager;

  constructor(options: MapOptions) {
    this.worldContainer = options.worldContainer; // Store referenc

    this.floorManager = new FloorManager(options.worldContainer);
    this.tileManager = new TileManager(this.floorManager);
    this.collisionManager = new CollisionManager();

    // Create player layer
    this.playerLayer = new Container();
    options.worldContainer.addChild(this.playerLayer);
  }

  public draw(): void {
    // Create and draw all tiles for all floors
    this.tileManager.createTiles();

    // Initially hide upper floors
    this.floorManager.setFloorVisibility(0);
  }

  // Public methods that delegate to specialized components
  public changeFloor(newFloor: number): boolean {
    if (newFloor < 0 || newFloor >= WORLD_MAP.floors.length) {
      return false;
    }

    this.floorManager.setFloorVisibility(newFloor);
    console.log(`Player moved to floor ${newFloor}`);
    return true;
  }

  public checkForStairs(
    gridX: number,
    gridY: number,
    currentFloor: number,
  ): number {
    return this.collisionManager.checkForStairs(
      gridX,
      gridY,
      currentFloor,
    );
  }

  public isWalkableTile(
    gridX: number,
    gridY: number,
    currentFloor: number,
    playerSize: number = 0.5,
  ): boolean {
    return this.collisionManager.isWalkableTile(
      gridX,
      gridY,
      currentFloor,
      playerSize,
    );
  }

  public findFirstWalkableTile(floor: number = 0): {
    x: number;
    y: number;
    floor: number;
  } {
    return this.collisionManager.findFirstWalkableTile(floor);
  }

  public getCurrentFloor(): number {
    return this.floorManager.getCurrentFloor();
  }

  public getPlayerLayer(): Container {
    return this.playerLayer;
  }

  public createStairs(
    x: number,
    y: number,
    fromFloor: number,
    toFloor: number,
  ): boolean {
    return this.tileManager.createStairs(x, y, fromFloor, toFloor);
  }
}
