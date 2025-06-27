export const init = (
  p5: typeof import("p5"),
  root: HTMLElement,
  setupFn?: (p5Obj: import("p5")) => void,
  drawFn?: (p5Obj: import("p5")) => void
): void => {
  const sketch = (p5Obj: import("p5")) => {
    p5Obj.setup = () => {
      if (setupFn) {
        setupFn(p5Obj);
      }
    };
    p5Obj.draw = () => {
      if (drawFn) {
        drawFn(p5Obj);
      }
    };
  };
  new p5(sketch, root);
};
