import { Container, Graphics } from 'pixi.js';

export enum TileType {
  Grass = 0,
  Wall = 1,
  Water = 2
}

export class Tile {
  private gridX: number;
  private gridY: number;
  private type: TileType;
  private width: number;
  private height: number;
  private depth: number;
  private screenX: number;
  private screenY: number;
  
  constructor(
    gridX: number, 
    gridY: number, 
    type: TileType, 
    width: number, 
    height: number, 
    depth: number
  ) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = type;
    this.width = width;
    this.height = height;
    this.depth = depth;
    
    // Calculate screen (isometric) coordinates
    this.screenX = (gridX - gridY) * (width / 2);
    this.screenY = (gridX + gridY) * (height / 2);
  }
  
  public draw(groundLayer: Container, objectLayer: Container): void {
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
    tile.moveTo(this.width / 2, 0);
    tile.lineTo(this.width, this.height / 2);
    tile.lineTo(this.width / 2, this.height);
    tile.lineTo(0, this.height / 2);
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
  }
  
  private drawWall(objectLayer: Container): void {
    const wall = new Graphics();
    
    // Wall side
    wall.clear();
    wall.moveTo(0, this.height / 2);
    wall.lineTo(this.width / 2, this.height);
    wall.lineTo(this.width / 2, this.height + this.depth);
    wall.lineTo(0, this.height / 2 + this.depth);
    wall.closePath();
    wall.fill({ color: 0x606060 }); // Slightly darker for the wall face
    
    // Wall face
    wall.moveTo(this.width / 2, this.height);
    wall.lineTo(this.width, this.height / 2);
    wall.lineTo(this.width, this.height / 2 + this.depth);
    wall.lineTo(this.width / 2, this.height + this.depth);
    wall.closePath();
    wall.fill({ color: 0x707070 });
    
    // Position the wall
    wall.position.set(this.screenX, this.screenY);
    objectLayer.addChild(wall);
  }
  
  private drawWater(objectLayer: Container): void {
    // Add a slight animation or shine to water tiles
    const waterEffect = new Graphics();
    waterEffect.moveTo(this.width / 2, 0);
    waterEffect.lineTo(this.width, this.height / 2);
    waterEffect.lineTo(this.width / 2, this.height);
    waterEffect.lineTo(0, this.height / 2);
    waterEffect.closePath();
    waterEffect.fill({ color: 0x6060ff, alpha: 0.3 });
    
    waterEffect.position.set(this.screenX, this.screenY);
    objectLayer.addChild(waterEffect);
  }
  
  public isWalkable(): boolean {
    return this.type === TileType.Grass;
  }
}
