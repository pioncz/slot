import {
  Application,
  Assets,
  BlurFilter,
  Container,
  Graphics,
  Sprite,
  TextStyle,
  Texture,
  Text,
} from 'pixi.js';
import './style.css';
import {
  createAnimation,
  createGradient,
  FontStyle,
  Reel,
  State,
  Animation,
  animate,
  Easings,
} from './helpers';
import WebFont from 'webfontloader';

const main = async () => {
  let state = State.initial;
  const app = new Application();
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const DIMENSION = Math.min(WIDTH, HEIGHT);
  const MARGIN = DIMENSION / 12;
  const REEL_COLUMNS = 5;
  const REEL_WIDTH = (DIMENSION - 2 * MARGIN) / REEL_COLUMNS;
  const REEL_MARGINS = MARGIN / 4;
  const SYMBOL_SIZE = 96;
  const animations: Animation[] = [];
  let slotTextures: Texture[] = [];
  let reels: Reel[] = [];
  let stateText: Text;

  const load = async () => {
    const loadFontPromise = new Promise((resolve) => {
      WebFont.load({
        active: function () {
          resolve(null);
        },
        google: {
          families: ['Trade Winds'],
        },
      });
    });
    await app.init({ backgroundAlpha: 0, resizeTo: window });
    await Assets.load([
      'slot-symbol1.png',
      'slot-symbol2.png',
      'slot-symbol3.png',
    ]);
    slotTextures = [
      Texture.from('slot-symbol2.png'),
      Texture.from('slot-symbol1.png'),
      Texture.from('slot-symbol3.png'),
    ];
    document.body.appendChild(app.canvas);
    await loadFontPromise;
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
        position: 0,
        prevPosition: 0,
        blur: new BlurFilter(),
        spinning: false,
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

    const headerFill = createGradient([0xffffff, 0x00e4ff], 0, 50);
    const headerStyle = new TextStyle({
      ...FontStyle,
      fontSize: 44,
      fill: { fill: headerFill },
    });
    const headerText = new Text({
      text: 'RAPID SLOT!',
      style: headerStyle,
      anchor: { x: 0.5, y: 0.5 },
    });
    headerText.x = WIDTH / 2;
    headerText.y = (HEIGHT - REEL_WIDTH * 3) / 4;
    app.stage.addChild(headerText);

    const playFill = createGradient([0xffffff, 0x00ff46], 0, 50);
    const playStyle = new TextStyle({
      ...FontStyle,
      fontSize: 30,
      fill: { fill: playFill },
    });
    const playText = new Text({
      text: 'PLAY!',
      style: playStyle,
      anchor: { x: 0.5, y: 0.5 },
    });
    playText.x = WIDTH / 2;
    playText.y = HEIGHT - (HEIGHT - REEL_WIDTH * 3) / 4;
    playText.eventMode = 'static';
    playText.cursor = 'pointer';
    playText.addListener('pointerdown', () => {
      start();
    });
    app.stage.addChild(playText);

    const stateStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#fff',
      align: 'right',
      wordWrapWidth: 440,
    });
    stateText = new Text({
      text: state,
      style: stateStyle,
      anchor: { x: 1, y: 1 },
    });
    stateText.x = app.screen.width;
    stateText.y = app.screen.height;
    app.stage.addChild(stateText);
  };

  const start = () => {
    if (state === State.spinning) {
      return;
    }
    setState(State.spinning);

    reels.forEach((r, i) => {
      const extra = Math.floor(Math.random() * 3);
      const endValue = r.position + 10 + i * 5 + extra;
      const duration = 250 + i * 60 + extra * 300;

      r.spinning = true;

      const animation = createAnimation({
        object: r,
        property: 'position',
        endValue,
        duration,
        easing: Easings.backout,
        onComplete: () => {
          r.spinning = false;

          if (reels.every((r) => r.spinning === false)) {
            setState(State.initial);
          }
        },
      });
      animations.push(animation);
    });
  };

  const setState = (newState: State) => {
    state = newState;
    stateText.text = newState;
  };

  await load();
  initStage();

  app.ticker.add(() => {
    const now = Date.now();
    const toRemove = [];

    for (let i = 0; i < animations.length; i++) {
      const finished = animate(now, animations[i]);
      if (finished) toRemove.push(animations[i]);
    }

    for (let i = 0; i < toRemove.length; i++) {
      animations.splice(animations.indexOf(toRemove[i]), 1);
    }

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];

      r.blur.strengthY = r.position - r.prevPosition;
      r.prevPosition = r.position;

      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;

        s.y =
          (((r.position + j) % r.symbols.length) - 1) *
            (REEL_WIDTH - REEL_MARGINS) +
          REEL_MARGINS;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          s.texture =
            slotTextures[
              Math.floor(Math.random() * slotTextures.length)
            ];
        }
      }
    }
  });
};

main();
