import type p5 from "p5";

interface Elements {
  numEdges: number;
  numNodes: number;
  edges: Map<string, number>;
  circles: Map<string, Circle>;
}

interface Circle {
  text: string;
  x: number;
  y: number;
  r: number;
  color: string;
}

interface Configuration {
  wMax: number;
  wMin: number;
  separation: number;
  maxIterations: number;
  itemsMin: number;
  itemsMax: number;
  xOffset: number;
  yOffset: number;
}
export const defaultConfig: Configuration = {
  wMax: 100,
  wMin: 0.1,
  separation: 50,
  maxIterations: 10000,
  itemsMin: 10,
  itemsMax: 22,
  xOffset: 50,
  yOffset: 50,
} as const;

export class PathFinderV2 {
  private graph: Map<string, Map<string, number>>;
  private elements: Partial<Elements> = { numEdges: 0, numNodes: 0 };
  private static ALPHABETS: string = "abcdefghijklmnopqstuvwxyz";
  private static COLORS: string[] = [
    "#8b5cf6",
    "#3b82f6",
    "#0ea5e9",
    "#10b981",
    "#f97316",
  ];
  private static p5Object: p5;
  static set p5(p5Inst: p5) {
    PathFinderV2.p5Object = p5Inst;
  }
  static get p5(): p5 {
    return PathFinderV2.p5Object;
  }
  constructor() {
    this.graph = new Map();
  }

  private static get width() {
    return PathFinderV2.p5.windowWidth;
  }
  private static get height() {
    return PathFinderV2.p5.windowHeight;
  }

  private static CONFIG: Configuration = defaultConfig;
  static set config(_config: Partial<Configuration>) {
    Object.entries(_config).forEach(([k, v]) => {
      PathFinderV2.CONFIG[k as keyof Configuration] = v;
    });
  }

  static get config(): Configuration {
    return PathFinderV2.CONFIG;
  }

  private static readonly getChars = (start: number, end: number): string[] => {
    return PathFinderV2.ALPHABETS.slice(start, end).split("");
  };

  private static readonly generateWeight = (): number => {
    return Math.round(
      Math.random() * (PathFinderV2.CONFIG.wMax - PathFinderV2.CONFIG.wMin) +
        PathFinderV2.CONFIG.wMax
    );
  };

  private addNeighbor(source: string, destination: string, weight: number) {
    if (!this.graph.has(source)) {
      this.graph.set(source, new Map());
    }
    this.graph.get(source)?.set(destination, weight);
    if (!this.graph.has(destination)) {
      this.graph.set(destination, new Map());
    }
    this.graph.get(destination)?.set(source, weight);
  }

  generateElements(minNodes: number, maxNodes: number): void {
    const init =
      Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
    this.elements.numEdges = init;
    this.elements.numNodes = init;
    console.warn("num edges", init);
    const nodes = PathFinderV2.getChars(0, this.elements.numNodes);
    this.elements.edges = new Map();
    this.elements.circles = new Map();
    let i = 0;
    // Create edges
    while (i < this.elements.numEdges) {
      const src = nodes[Math.floor(Math.random() * this.elements.numEdges)];
      const dest = nodes[Math.floor(Math.random() * this.elements.numEdges)];
      if (!this.elements.edges.has(`${src}-${dest}`)) {
        const wt = PathFinderV2.generateWeight();
        this.elements.edges.set(`${src}-${dest}`, wt);
        this.addNeighbor(src, dest, wt);
        i++;
      }
    }

    let breaker = 0;
    i = 0;
    // Create nodes of the graph
    while (this.elements.circles.size < this.elements.numNodes) {
      const circle: Circle = {
        x: PathFinderV2.p5.random(
          50,
          PathFinderV2.width - PathFinderV2.config.xOffset
        ),
        y: PathFinderV2.p5.random(
          50,
          PathFinderV2.height - PathFinderV2.config.yOffset
        ),
        r: 25,
        text: nodes[i],
        color:
          PathFinderV2.COLORS[
            Math.floor(Math.random() * PathFinderV2.COLORS.length)
          ],
      };
      let isOverlapping = false;
      for (let [_, other] of this.elements.circles) {
        const d = PathFinderV2.p5.dist(circle.x, circle.y, other.x, other.y);
        if (d < circle.r + other.r + PathFinderV2.CONFIG.separation) {
          isOverlapping = true;
        }
      }
      if (!isOverlapping) {
        this.elements.circles.set(circle.text, circle);
        i++;
      }
      breaker++;
      if (breaker > PathFinderV2.CONFIG.maxIterations) {
        break;
      }
    }
  }

  static drawCricles(circles: Map<string, Circle>): void {
    const p5 = PathFinderV2.p5;
    for (const [text, circle] of circles) {
      p5.fill(circle.color)
        .noStroke()
        .circle(circle.x, circle.y, circle.r * 2)
        .fill("white")
        .textAlign(p5.CENTER, p5.CENTER)
        .textSize(25)
        .text(text, circle.x, circle.y);
    }
  }
  static drawEdges(
    edges: Map<string, number>,
    circles: Map<string, Circle>
  ): void {
    const p5 = PathFinderV2.p5;
    for (const [edge, wt] of edges) {
      const [p1, p2] = edge.split("-");
      const circ1 = circles.get(p1);
      const circ2 = circles.get(p2);
      if (circ1 && circ2) {
        p5.stroke("rgb(255,255,255)")
          .strokeWeight(1.5)
          .line(circ1.x, circ1.y, circ2.x, circ2.y)
          .noStroke()
          .textAlign(p5.CENTER, p5.CENTER)
          .textSize(20)
          .fill("white")
          .text(wt, (circ1.x + circ2.x) / 2, (circ1.y + circ2.y) / 2);
      } else {
        console.warn(`Recieved undefined circ1: ${circ1}, circ2: ${circ2}`);
      }
    }
  }
  resetSketch() {
    PathFinderV2.p5.clear().background("#cbd5e1");
    this.generateElements(
      PathFinderV2.CONFIG.itemsMin,
      PathFinderV2.CONFIG.itemsMax
    );
    if (this.elements.circles && this.elements.edges) {
      PathFinderV2.drawEdges(this.elements.edges, this.elements.circles);
      PathFinderV2.drawCricles(this.elements.circles);
    }
  }
}
