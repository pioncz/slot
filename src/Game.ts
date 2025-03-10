import { Application, Container } from 'pixi.js';
import { Map } from './Map';
import { Player } from './Player';

export class Game {
  private app: Application;
  private worldContainer: Container;
  private map: Map;
  private player: Player;

  // Game constants
  readonly VIEWPORT_WIDTH = 800;
  readonly VIEWPORT_HEIGHT = 600;

  constructor() {
    this.app = new Application();
    this.worldContainer = new Container();
  }

  public async init(): Promise<void> {
    // Initialize the app
    await this.app.init({
      width: this.VIEWPORT_WIDTH,
      height: this.VIEWPORT_HEIGHT,
      background: '#333333',
      antialias: true,
    });

    // Add the canvas to the document
    (document.querySelector('#app') || document.body).appendChild(
      this.app.canvas,
    );

    // Add the world container to the stage
    this.app.stage.addChild(this.worldContainer);

    // Create map and player instances
    this.map = new Map(this.worldContainer);
    this.player = new Player(this.worldContainer, this.map);

    // Draw the map
    this.map.draw();

    // Initialize the player
    this.player.init();

    // Setup input handlers
    this.setupInputHandlers();

    // Start the game loop
    this.app.ticker.add(this.update.bind(this));
  }

  private setupInputHandlers(): void {
    // Setup keyboard input
    window.addEventListener(
      'keydown',
      this.player.handleKeyDown.bind(this.player),
    );
    window.addEventListener(
      'keyup',
      this.player.handleKeyUp.bind(this.player),
    );

    // Setup mouse/touch input
    this.worldContainer.eventMode = 'static';
    this.worldContainer.on(
      'pointerdown',
      this.player.handlePointerDown.bind(this.player),
    );
  }

  private update(time: any): void {
    // Update player
    this.player.update(time);

    // Update camera position (center on player)
    this.worldContainer.x =
      this.VIEWPORT_WIDTH / 2 - this.player.getScreenX();
    this.worldContainer.y =
      this.VIEWPORT_HEIGHT / 2 - this.player.getScreenY();
  }
}
