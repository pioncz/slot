import {
  Application,
  Assets,
  BlurFilter,
  Container,
  Graphics,
  Sprite,
  Texture,
} from 'pixi.js';
import './style.css';
import { createGradient, Reel } from './helpers';

const main = async () => {
  const app = new Application();
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const DIMENSION = Math.min(WIDTH, HEIGHT);
  const MARGIN = DIMENSION / 12;
  const REEL_COLUMNS = 5;
  const REEL_WIDTH = (DIMENSION - 2 * MARGIN) / REEL_COLUMNS;
  const REEL_MARGINS = MARGIN / 4;
  const SYMBOL_SIZE = 96;
  let slotTextures: Texture[] = [];
  let reels: Reel[] = [];

  const load = async () => {
    await app.init({ backgroundAlpha: 0, resizeTo: window });
    await Assets.load([
      '/slot-symbol1.png',
      '/slot-symbol2.png',
      '/slot-symbol3.png',
    ]);
    slotTextures = [
      Texture.from('/slot-symbol1.png'),
      Texture.from('/slot-symbol2.png'),
      Texture.from('/slot-symbol3.png'),
    ];
    document.body.appendChild(app.canvas);
  };

  const initStage = () => {
    reels = [];
    const reelContainer = new Container();
    const reelWidth = REEL_WIDTH * REEL_COLUMNS;
    const reelHeight = REEL_WIDTH * 3;
    const reelFill = createGradient(
      [0x3a0075, 0x590ba9, 0x3a0075],
      0,
      reelHeight,
    );
    const reelBg = new Graphics()
      .rect(0, 0, reelWidth, reelHeight)
      .fill({ fill: reelFill });
    reelContainer.addChild(reelBg);

    for (let i = 0; i < 5; i++) {
      const rc = new Container();
      rc.x = i * REEL_WIDTH;
      rc.y = REEL_MARGINS;
      reelContainer.addChild(rc);

      const rcHeight = REEL_WIDTH * 3 - REEL_MARGINS * 2;
      const rcFill = createGradient(
        [0xaaaaaa, 0xffffff, 0xaaaaaa],
        0,
        rcHeight,
      );
      const rcBg = new Graphics()
        .rect(0, 0, REEL_WIDTH - REEL_MARGINS * 2, rcHeight)
        .fill({ fill: rcFill });
      rcBg.x = REEL_MARGINS;
      rcBg.y = 0;
      rc.addChild(rcBg);

      const rcMask = new Graphics()
        .rect(
          0,
          0,
          REEL_WIDTH - REEL_MARGINS * 2,
          REEL_WIDTH * 3 - REEL_MARGINS * 2,
        )
        .fill({ color: 0xff0000 });
      rcMask.x = REEL_MARGINS;
      rcMask.y = 0;
      rc.addChild(rcMask);
      rc.mask = rcMask;

      const reel: Reel = {
        container: rc,
        symbols: [],
        blur: new BlurFilter(),
      };

      reel.blur.strength = 0;
      rc.filters = [reel.blur];

      for (let j = 0; j < 4; j++) {
        const symbol = new Sprite(
          slotTextures[
            Math.floor(Math.random() * slotTextures.length)
          ],
        );

        symbol.y =
          (j - 1) * (REEL_WIDTH - REEL_MARGINS) + REEL_MARGINS;
        symbol.x = REEL_MARGINS;
        symbol.scale.x = symbol.scale.y =
          (REEL_WIDTH - MARGIN / 2) / SYMBOL_SIZE;
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      reels.push(reel);
    }
    reelContainer.y = HEIGHT / 2 - reelHeight / 2;
    reelContainer.x = WIDTH / 2 - reelWidth / 2;
    app.stage.addChild(reelContainer);
  };

  await load();
  initStage();
};

main();
