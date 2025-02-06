import {
  BlurFilter,
  Container,
  FillGradient,
  Sprite,
  TextStyleFontStyle,
  TextStyleFontWeight,
} from 'pixi.js';

export type Reel = {
  container: Container;
  symbols: Sprite[];
  blur: BlurFilter;
};

export enum State {
  initial = 'initial',
  spinning = 'spinning',
  error = 'error',
  win = 'win',
  loose = 'loose',
}

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

export const FontStyle = {
  fontFamily: 'Trade Winds, Arial',
  fontSize: 36,
  fontStyle: 'italic' as TextStyleFontStyle,
  fontWeight: 'bold' as TextStyleFontWeight,
  stroke: { color: 0x4a1850, width: 5 },
  dropShadow: {
    color: 0x000000,
    angle: Math.PI / 6,
    blur: 4,
    distance: 6,
  },
  wordWrap: true,
  wordWrapWidth: 440,
};
