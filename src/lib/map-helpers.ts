/**
 * Utility functions for isometric mapping
 */

// Constants for tile dimensions
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const TILE_DEPTH = 32;

/**
 * Converts grid coordinates to isometric screen coordinates
 */
export function gridToIso(
  gridX: number,
  gridY: number,
): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

/**
 * Converts isometric screen coordinates back to grid coordinates
 */
export function isoToGrid(
  x: number,
  y: number,
): { gridX: number; gridY: number } {
  const gridX = Math.floor(
    (x / (TILE_WIDTH / 2) + y / (TILE_HEIGHT / 2)) / 2,
  );
  const gridY = Math.floor(
    (y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2,
  );
  return { gridX, gridY };
}
