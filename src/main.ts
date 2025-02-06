import { Application, Assets, Texture } from 'pixi.js';
import './style.css';

const main = async () => {
  const app = new Application();
  let slotTextures: Texture[] = [];

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

  const initStage = () => {};

  await load();
  initStage();
};

main();
