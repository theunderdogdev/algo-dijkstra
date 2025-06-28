/**
 * Initializes a p5.js sketch in instance mode.
 *
 * @param {import("p5")} p5 - The p5.js library imported (e.g., from 'p5').
 * @param {HTMLElement} element - The DOM element to attach the p5.js canvas to.
 * @param {function(import("p5")): void} drawCallback - A function that will be called as the p5 `draw` loop.
 * It receives the p5 instance as an argument.
 * @param {function(import("p5")): void} setupCallback - An optional function that will be called as the p5 `setup` function.
 * It receives the p5 instance as an argument.
 * If not provided, a default `setupCanvas` from this module will be used.
 */
export const init = (p5, element, setupCallback, drawCallback) => {
  /**
   *
   * @param {import("p5")} p5Instance
   */
  const sketch = (p5Instance) => {
    // Set up the setup function
    p5Instance.setup = () => {
      if (setupCallback) {
        setupCallback(p5Instance);
      }
    };
    
    // Set up the draw function
    p5Instance.draw = () => {
      if (drawCallback) {
        drawCallback(p5Instance);
      }
    };
  };

  // Create a new p5 instance and attach it to the specified element
  new p5(sketch, element);
};
