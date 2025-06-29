import type p5 from "p5";

export const init = (
  p5Constructor: typeof p5,
  root: HTMLElement,
  setupFn?: (p5Obj: p5) => void,
  drawFn?: (p5Obj: p5) => void
): void => {
  const sketch = (p5Obj: p5) => {
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
  new p5Constructor(sketch, root);
};
