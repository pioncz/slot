// ============================================================================
// 2. Update the tile.ts file to support stairs and floor levels
// ============================================================================

import { Container, Graphics, Text } from 'pixi.js';
import {
  gridToIso,
  TILE_WIDTH,
  TILE_HEIGHT,
  TILE_DEPTH,
} from './lib/map-helpers';

export enum TileType {
  Grass = 0,
  Wall = 1,
  Water = 2,
}

export interface TileOptions {
  gridX: number;
  gridY: number;
  floor: number; // Add floor level
  type: TileType;
  hasStairs?: boolean; // Indicate if this tile has stairs
  stairsDirection?: number; // Direction of stairs: 1 = up, -1 = down
  groundLayer: Container;
  objectLayer: Container;
  debug?: boolean;
}

export class Tile {
  private gridX: number;
  private gridY: number;
  private floor: number;
  private type: TileType;
  private hasStairs: boolean;
  private stairsDirection: number;
  private screenX: number;
  private screenY: number;
  private debug: boolean;

  constructor(options: TileOptions) {
    this.gridX = options.gridX;
    this.gridY = options.gridY;
    this.floor = options.floor || 0;
    this.type = options.type;
    this.hasStairs = options.hasStairs || false;
    this.stairsDirection = options.stairsDirection || 0;
    this.debug = options.debug || false;

    // Calculate screen (isometric) coordinates using helper function
    const { x, y } = gridToIso(this.gridX, this.gridY);
    
    // Apply floor offset for higher floors (lift them up visually)
    const floorOffset = this.floor * (TILE_DEPTH + 5);
    
    this.screenX = x - TILE_WIDTH / 2;
    this.screenY = y - floorOffset;

    // Draw the tile immediately after being created
    this.draw(options.groundLayer, options.objectLayer);
  }

  private draw(groundLayer: Container, objectLayer: Container): void {
    // Create base tile graphic
    const tile = new Graphics();

    // Set fill color based on tile type
    let fillColor: number;
    switch (this.type) {
      case TileType.Grass:
        fillColor = 0x408040; // Green
        break;
      case TileType.Wall:
        fillColor = 0x808080; // Gray
        break;
      case TileType.Water:
        fillColor = 0x4040c0; // Blue
        break;
    }

    // Draw the isometric tile (diamond shape)
    tile.moveTo(TILE_WIDTH / 2, 0);
    tile.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    tile.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    tile.lineTo(0, TILE_HEIGHT / 2);
    tile.closePath();
    tile.fill({ color: fillColor });

    // Position the tile
    tile.position.set(this.screenX, this.screenY);

    groundLayer.addChild(tile);

    // For walls and objects, add a "depth" component
    if (this.type === TileType.Wall) {
      this.drawWall(objectLayer);
    } else if (this.type === TileType.Water) {
      this.drawWater(objectLayer);
    }
    
    // Draw stairs if this tile has them
    if (this.hasStairs) {
      this.drawStairs(objectLayer);
    }

    // Draw debug coordinates if debug mode is enabled
    if (this.debug) {
      this.drawDebugCoordinates(groundLayer);
    }
  }

  private drawWall(objectLayer: Container): void {
    const wall = new Graphics();

    // Wall top (same as the base tile, but slightly elevated)
    wall.moveTo(TILE_WIDTH / 2, 0 - TILE_DEPTH);
    wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2 - TILE_DEPTH);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT - TILE_DEPTH);
    wall.lineTo(0, TILE_HEIGHT / 2 - TILE_DEPTH);
    wall.closePath();
    wall.fill({ color: 0x909090 }); // Lighter for the top

    // Left wall face
    wall.moveTo(0, TILE_HEIGHT / 2 - TILE_DEPTH);
    wall.lineTo(0, TILE_HEIGHT / 2);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT - TILE_DEPTH);
    wall.closePath();
    wall.fill({ color: 0x606060 }); // Darker for the sides

    // Right wall face
    wall.moveTo(TILE_WIDTH / 2, TILE_HEIGHT - TILE_DEPTH);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2 - TILE_DEPTH);
    wall.closePath();
    wall.fill({ color: 0x707070 }); // Medium for the right side

    // Position the wall
    wall.position.set(this.screenX, this.screenY);
    objectLayer.addChild(wall);
  }

  private drawWater(objectLayer: Container): void {
    // Add a slight animation or shine to water tiles
    const waterEffect = new Graphics();
    waterEffect.moveTo(TILE_WIDTH / 2, 0);
    waterEffect.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    waterEffect.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    waterEffect.lineTo(0, TILE_HEIGHT / 2);
    waterEffect.closePath();
    waterEffect.fill({ color: 0x6060ff, alpha: 0.3 });

    waterEffect.position.set(this.screenX, this.screenY);
    objectLayer.addChild(waterEffect);
  }

  private drawStairs(objectLayer: Container): void {
    const stairs = new Graphics();
    
    // Use a different color based on stairs direction
    const stairsColor = this.stairsDirection > 0 ? 0xcccc00 : 0xcc8800;
    
    // Draw the base tile
    stairs.moveTo(TILE_WIDTH / 2, 0);
    stairs.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    stairs.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    stairs.lineTo(0, TILE_HEIGHT / 2);
    stairs.closePath();
    stairs.fill({ color: stairsColor });
    
    // Draw stair steps
    const numSteps = 4;
    const stepHeight = TILE_HEIGHT / numSteps;
    
    for (let i = 0; i < numSteps; i++) {
      const yOffset = i * stepHeight;
      
      // Draw step (horizontal line)
      stairs.moveTo(TILE_WIDTH / 4, TILE_HEIGHT / 4 + yOffset);
      stairs.lineTo(TILE_WIDTH * 3 / 4, TILE_HEIGHT / 4 + yOffset);
      stairs.lineStyle({ width: 2, color: 0x000000 });
      stairs.stroke();
    }
    
    // Draw arrow indicator for direction
    const arrowColor = 0xffffff;
    const arrowSize = TILE_WIDTH / 4;
    const centerX = TILE_WIDTH / 2;
    const centerY = TILE_HEIGHT / 2;
    
    if (this.stairsDirection > 0) {
      // Up arrow
      stairs.moveTo(centerX, centerY - arrowSize);
      stairs.lineTo(centerX + arrowSize / 2, centerY);
      stairs.lineTo(centerX - arrowSize / 2, centerY);
      stairs.closePath();
      stairs.fill({ color: arrowColor });
    } else {
      // Down arrow
      stairs.moveTo(centerX, centerY + arrowSize);
      stairs.lineTo(centerX + arrowSize / 2, centerY);
      stairs.lineTo(centerX - arrowSize / 2, centerY);
      stairs.closePath();
      stairs.fill({ color: arrowColor });
    }
    
    // Position the stairs
    stairs.position.set(this.screenX, this.screenY);
    objectLayer.addChild(stairs);
  }

  private drawDebugCoordinates(groundLayer: Container): void {
    // Create text displaying the grid coordinates with updated Text constructor
    const debugInfo = `${this.gridX},${this.gridY},F${this.floor}`;
    const coordText = new Text({
      text: debugInfo,
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 'white',
        stroke: {
          color: 'black',
          width: 1,
        },
        align: 'center',
      },
    });

    // Position the text in the center of the tile
    coordText.position.set(
      this.screenX + TILE_WIDTH / 2,
      this.screenY + TILE_HEIGHT / 2,
    );

    // Set anchor to center
    coordText.anchor.set(0.5, 0.5);

    // Add the text to the ground layer
    groundLayer.addChild(coordText);
  }

  public isWalkable(): boolean {
    return this.type === TileType.Grass;
  }
}