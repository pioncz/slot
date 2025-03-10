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
  type: TileType;
  groundLayer: Container;
  objectLayer: Container;
  debug?: boolean;
}

export class Tile {
  private gridX: number;
  private gridY: number;
  private type: TileType;
  private screenX: number;
  private screenY: number;
  private debug: boolean;

  constructor(options: TileOptions) {
    this.gridX = options.gridX;
    this.gridY = options.gridY;
    this.type = options.type;
    this.debug = options.debug || false;

    // Calculate screen (isometric) coordinates using helper function
    const { x, y } = gridToIso(this.gridX, this.gridY);
    this.screenX = x;
    this.screenY = y;

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
    tile.clear();
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
      // this.drawWall(objectLayer);
    } else if (this.type === TileType.Water) {
      this.drawWater(objectLayer);
    }

    // Draw debug coordinates if debug mode is enabled
    if (this.debug) {
      this.drawDebugCoordinates(groundLayer);
    }
  }

  private drawWall(objectLayer: Container): void {
    const wall = new Graphics();

    // Wall side
    wall.clear();
    wall.moveTo(0, TILE_HEIGHT / 2);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT + TILE_DEPTH);
    wall.lineTo(0, TILE_HEIGHT / 2 + TILE_DEPTH);
    wall.closePath();
    wall.fill({ color: 0x606060 }); // Slightly darker for the wall face

    // Wall face
    wall.moveTo(TILE_WIDTH / 2, TILE_HEIGHT);
    wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    wall.lineTo(TILE_WIDTH, TILE_HEIGHT / 2 + TILE_DEPTH);
    wall.lineTo(TILE_WIDTH / 2, TILE_HEIGHT + TILE_DEPTH);
    wall.closePath();
    wall.fill({ color: 0x707070 });

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

  private drawDebugCoordinates(groundLayer: Container): void {
    // Create text displaying the grid coordinates with updated Text constructor
    const coordText = new Text({
      text: `${this.gridX},${this.gridY}`,
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
