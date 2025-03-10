// src/managers/FloorManager.ts
import { Container } from 'pixi.js';
import WORLD_MAP from './data/world.json';

export class FloorManager {
  private floorContainers: Record<
    number,
    { ground: Container; objects: Container }
  > = {};
  private currentFloor: number = 0;

  constructor(worldContainer: Container) {
    // Initialize containers for all floors
    for (let floor = 0; floor < WORLD_MAP.floors.length; floor++) {
      const floorGround = new Container();
      const floorObjects = new Container();

      this.floorContainers[floor] = {
        ground: floorGround,
        objects: floorObjects,
      };

      // Add to world container
      worldContainer.addChild(floorGround);
      worldContainer.addChild(floorObjects);
    }
  }

  public getFloorContainers(floor: number): {
    ground: Container;
    objects: Container;
  } {
    return this.floorContainers[floor];
  }

  public setFloorVisibility(activeFloor: number): void {
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

      // Adjust alpha for floors below the current one
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

  public getCurrentFloor(): number {
    return this.currentFloor;
  }

  public addNewFloor(worldContainer: Container): number {
    // Create containers for the new floor
    const newFloorIndex = Object.keys(this.floorContainers).length;
    const floorGround = new Container();
    const floorObjects = new Container();

    // Initialize floor containers for the new floor
    this.floorContainers[newFloorIndex] = {
      ground: floorGround,
      objects: floorObjects,
    };

    // Add layers to the world container
    worldContainer.addChild(floorGround);
    worldContainer.addChild(floorObjects);

    return newFloorIndex;
  }
}
