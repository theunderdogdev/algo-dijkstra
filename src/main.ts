import type p5 from "p5";
import { init } from "./p5.init";
import { PathFinderV2 } from "./utils";
const setup = (p5: p5) => {
  PathFinderV2.p5 = p5;
  p5.createCanvas(p5.windowWidth, p5.windowHeight);
  p5.background(226, 232, 240).textFont("Inconsolata");
  
  const pathfinder = new PathFinderV2();
  
  pathfinder.resetSketch();
  p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.clear().background("#cbd5e1");

    // pathfinder.resetSketch();
  };
};
declare global {
  interface Window {
    p5: typeof import("p5");
  }
}
$(function () {
  console.log("jquery initialized");
  init(window.p5, $("#app")[0], setup);
});
