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
  position: number;
  prevPosition: number;
  spinning: boolean;
};

export enum State {
  initial = 'initial',
  spinning = 'spinning',
  error = 'error',
  win = 'win',
  loose = 'loose',
}

export type Animation = {
  object: any;
  property: string;
  startValue: number;
  endValue: number;
  duration: number;
  startTime: number;
  onComplete?: (a: Animation) => void;
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

export const lerp = (a1: number, a2: number, t: number) =>
  a1 * (1 - t) + a2 * t;

export const createAnimation = ({
  object,
  property,
  endValue,
  duration,
  onComplete,
}: {
  object: any;
  property: string;
  endValue: number;
  duration: number;
  onComplete?: () => void;
}) => ({
  object,
  property,
  endValue,
  duration,
  startValue: object[property],
  startTime: Date.now(),
  onComplete,
});

export const animate = (now: number, a: Animation) => {
  const progress = Math.min(1, (now - a.startTime) / a.duration);
  let finished = false;

  a.object[a.property] = lerp(a.startValue, a.endValue, progress);
  if (progress === 1) {
    finished = true;
    a.object[a.property] = a.endValue;

    if (a.onComplete) a.onComplete(a);
  }

  return finished;
};
