import { BlurFilter, Container, FillGradient, Sprite } from 'pixi.js';

export type Reel = {
  container: Container;
  symbols: Sprite[];
  blur: BlurFilter;
};

export const createGradient = (
  colorStops: number[],
  x: number,
  y: number,
) => {
  const gradientFill = new FillGradient(0, 0, x, y);
  colorStops.forEach((number, index) => {
    const ratio = index / (colorStops.length - 1);

    gradientFill.addColorStop(ratio, number);
  });
  return gradientFill;
};
