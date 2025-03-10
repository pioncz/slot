import { Game } from './game';
import './style.css';

// Entry point for the application
const main = async () => {
  // Create and initialize the game
  const game = new Game();
  await game.init();
};

// Start the application
main();
