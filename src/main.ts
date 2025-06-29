import type p5 from "p5";
import { init } from "./init";
import {
  BACKGROUND_COLOR,
  defaultConfig,
  type AdjGraph,
  type Elements,
} from "./utils";
import { PathFinder } from "./algorithms";

declare global {
  interface Window {
    p5: typeof p5;
  }
}
const inputReg = new RegExp(/([a-zA-Z])\s?(-|,|to)\s?([a-zA-Z])/);
const setup = (p5: p5) => {
  PathFinder.p5 = p5;
  PathFinder.config = defaultConfig;
  const pathFinder = new PathFinder();
  p5.createCanvas(p5.windowWidth, p5.windowHeight);
  p5.background(BACKGROUND_COLOR).textFont("Inconsolata");
  $("#new").on("click", function () {
    p5.clear().background(BACKGROUND_COLOR);
    pathFinder
      .reset()
      .defineEdgesAndNodes(
        PathFinder.config.itemsMin,
        PathFinder.config.itemsMax
      )
      .createEdgesAndNodes()
      .generateCircles(PathFinder.config.separation);
    const { circles, edges } = pathFinder.elements as Elements;
    PathFinder.drawCircles(circles);
    PathFinder.drawEdgePaths(edges, circles, true);
  });

  $("#search").on("click", function () {
    console.log("search");
    const input = $<HTMLInputElement>("#input").val() as string;
    const match = input.match(inputReg);
    if (match === null) {
      // raise an alert and add invalid class
      return;
    }
    const [_, start, , end] = match.map((v) => v.toUpperCase());
    if (start !== "" && end !== "" && start !== end) {
      const { circles, edges } = pathFinder.elements as Elements;
      console.log("search", start === "", end);
      const graph: AdjGraph = PathFinder.toAdjGraph(edges);
      const { distance, path } = PathFinder.shortestPath(
        graph,
        start,
        end,
        edges
      );
      console.log(distance, path);
      if (PathFinder.hasPrevious) {
        p5.clear().background(BACKGROUND_COLOR);
        PathFinder.drawCircles(circles);
        PathFinder.drawEdgePaths(edges, circles, true);
      }
      if (path) {
        PathFinder.drawEdgePaths(path, circles, false, undefined, "#04bc2f");
        PathFinder.hasPrevious = true;
        console.log(distance);
      }
    }
  });

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(BACKGROUND_COLOR).textFont("Inconsolata");
  };
};
$(function () {
  console.log("jquery initialized");
  init(window.p5, $("#app")[0], setup);
  $("#new").trigger("click");
});
