import type p5 from "p5";
import {
  ALPHABETS,
  randomColor,
  type AdjGraph,
  type Circle,
  type Configuration,
  type Elements,
  type WeightedEdges,
} from "./utils";

export class PathFinder {
  private $elements: Elements | null = null;
  static hasPrevious?: boolean = false;
  get elements(): Elements | null {
    return this.$elements;
  }

  private static configuration: Configuration;
  static set config(partialConfig: Partial<Configuration>) {
    if (PathFinder.configuration === undefined) {
      PathFinder.configuration = {} as Configuration;
    }
    Object.entries(partialConfig).forEach(([k, v]) => {
      PathFinder.configuration[k as keyof Configuration] = v;
    });
  }
  static get config(): Configuration {
    return this.configuration;
  }
  private static p5Instance: p5;
  static set p5(p: p5) {
    this.p5Instance = p;
  }
  static get p5() {
    return this.p5Instance;
  }

  constructor() {}
  defineEdgesAndNodes(min: number, max: number): this {
    if (this.$elements !== null) {
      this.$elements.numNodes =
        Math.floor(Math.random() * (max - min + 1)) + min;
      this.$elements.numEdges =
        Math.floor(
          Math.random() *
            (this.$elements.numNodes -
              this.$elements.numNodes * PathFinder.configuration.edgeDensity +
              1)
        ) + this.$elements.numNodes;
      const maxPossibleEdges =
        (this.$elements.numNodes * (this.$elements.numNodes - 1)) / 2;
      this.$elements.numEdges = Math.min(
        this.$elements.numEdges,
        maxPossibleEdges
      );
      if (
        this.$elements.numNodes > 1 &&
        this.$elements.numEdges < this.$elements.numNodes - 1
      ) {
        // Ensure at least enough edges for a connected graph if possible
        this.$elements.numEdges = this.$elements.numNodes - 1;
      }
    }
    return this;
  }
  private getLabels(start: number, end: number): string[] {
    return ALPHABETS.slice(start, end).split("");
  }

  static generateWeight(): number {
    return Math.round(
      Math.random() * (PathFinder.configuration.wMax - PathFinder.configuration.wMin) +
        PathFinder.configuration.wMin
    );
  }

  createEdgesAndNodes(): this {
    if (this.$elements !== null) {
      this.$elements.nodes = this.getLabels(0, this.$elements.numNodes);
      const { nodes, numNodes, edges }: Elements = this.$elements;
      for (let i = 0; i < this.$elements.numEdges; ) {
        const nodeA = nodes[Math.floor(Math.random() * numNodes)];
        const nodeB = nodes[Math.floor(Math.random() * numNodes)];
        if (nodeA === nodeB) {
          continue; // No self-loops
        }
        const edgeKey =
          nodeA < nodeB ? `${nodeA}-${nodeB}` : `${nodeB}-${nodeA}`;
        if (!edges.has(edgeKey)) {
          edges.set(edgeKey, PathFinder.generateWeight());
          i++;
        }
      }
    }
    return this;
  }

  static toAdjGraph(edges: WeightedEdges): AdjGraph {
    const adjGraph: AdjGraph = {};

    for (const [edgeString, weight] of edges) {
      const [u, v] = edgeString.split("-");

      // Add edge u -> v
      (adjGraph[u] = adjGraph[u] || {})[v] = weight;
      // Add edge v -> u (for undirected graph)
      (adjGraph[v] = adjGraph[v] || {})[u] = weight;
    }
    return adjGraph;
  }

  getCircle(label: string): Circle {
    return (this.$elements as Elements).circles.get(label) as Circle;
  }

  generateCircles(separation: number = 100): void {
    if (this.$elements === null) {
      return;
    }
    // Local scoped variables make things faster
    const { numNodes, circles, nodes }: Elements = this.$elements;
    const p5: p5 = PathFinder.p5;
    const { xOffset, yOffset, radius, maxIterations }: Configuration =
      PathFinder.configuration;
    console.warn(PathFinder.configuration);
    let breaker = 0;
    let i = 0;
    while (circles.size < numNodes && i < nodes.length) {
      const circle: Circle = {
        x: p5.random(xOffset, p5.windowWidth - xOffset),
        y: p5.random(yOffset, p5.windowHeight - yOffset),
        r: radius,
        d: radius * 2,
        color: randomColor(),
      };
      let isOverlapping: boolean = false;
      for (const [_, other] of circles) {
        const dist = p5.dist(circle.x, circle.y, other.x, other.y);
        if (dist < circle.r + other.r + separation) {
          isOverlapping = true;
          break;
        }
      }
      if (!isOverlapping) {
        circles.set(nodes[i], circle);
        i++;
      }
      breaker++;
      if (breaker > maxIterations) {
        console.warn(
          "Max iterations reached for circle placement. Some nodes might not be placed."
        );
        break;
      }
    }
  }

  static nearestNeighbor(
    distances: Record<string, number>,
    visited: string[]
  ): string | null {
    let shortest = null;
    let minDistance = Infinity; // Use JS Infinity

    for (const node in distances) {
      // Ensure node is a direct property of distances
      if (!distances.hasOwnProperty(node)) {
        continue;
      }

      const distance = distances[node];

      // If the node has been visited, skip it
      if (visited.includes(node)) {
        continue;
      }

      // If this node's distance is less than the current minimum, it's the new shortest
      if (distance < minDistance) {
        minDistance = distance;
        shortest = node;
      }
    }
    return shortest;
  }

  static shortestPath(
    adjGraph: AdjGraph,
    start: string,
    end: string,
    edges: WeightedEdges
  ): { distance: number; path: WeightedEdges | null } {
    const distances: Record<string, number> = {};
    const parents: Record<string, string | null> = {};
    console.log(adjGraph);
    // Initialize all distances to Infinity, except for the start
    for (let node in adjGraph) {
      if (adjGraph.hasOwnProperty(node)) {
        distances[node] = Infinity; // Use JS Infinity
        parents[node] = null; // Initialize parents for all nodes
      }
    }
    distances[start] = 0; // Distance to start is 0

    // Initialize direct neighbors of start
    for (let child in adjGraph[start]) {
      if (adjGraph[start].hasOwnProperty(child)) {
        distances[child] = adjGraph[start][child];
        parents[child] = start;
      }
    }

    const visited: string[] = [];
    let node = PathFinder.nearestNeighbor(distances, visited);

    while (node !== null) {
      // Loop while a shortest unvisited node is found
      const distance = distances[node];
      const children = adjGraph[node];

      // If the current node is unreachable, all its children are also unreachable via this path
      if (distance === Infinity) {
        break; // No need to explore further from an unreachable node
      }

      for (let child in children) {
        if (children.hasOwnProperty(child)) {
          if (child === start) {
            continue;
          }

          const newdistance = distance + children[child];

          // If a shorter path to child is found
          if (newdistance < distances[child]) {
            // Direct comparison with Infinity works as expected
            distances[child] = newdistance;
            parents[child] = node;
          }
        }
      }
      visited.push(node);
      node = PathFinder.nearestNeighbor(distances, visited);
    }

    const shortestPath: string[] = [end];
    let parent: string | null = parents[end];

    // If the end is unreachable, return Infinity distance and an empty path
    if (distances[end] === Infinity) {
      return { distance: Infinity, path: null };
    }
    // Reconstruct the path
    while (parent !== null) {
      // Loop while there's a parent
      shortestPath.push(parent);
      parent = parents[parent];
    }
    shortestPath.reverse(); // Path is built in reverse, so reverse it at the end
    return {
      distance: distances[end],
      path: shortestPath
        .slice(0, -1)
        .map((el1, j) => {
          const el2 = shortestPath[j + 1];
          return `${el1}-${el2}`;
        })
        .reduce((_$, k) => {
          _$.set(k, edges.get(k));
          return _$;
        }, new Map()),
    };
  }

  static drawCircles(circles: Map<string, Circle>) {
    const p5 = PathFinder.p5;
    for (const [label, circle] of circles) {
      p5.fill(circle.color)
        .noStroke()
        .circle(circle.x, circle.y, circle.d)
        .fill("white")
        .textAlign(this.p5.CENTER, this.p5.CENTER)
        .textSize(22)
        .text(label, circle.x, circle.y); // Use label from map as text
    }
  }

  reset(): this {
    this.$elements = null;
    this.$elements = {
      circles: new Map(),
      edges: new Map(),
      nodes: new Array(),
      numEdges: 0,
      numNodes: 0,
    };
    return this;
  }

  static drawEdgePaths(
    edgePaths: WeightedEdges,
    circles: Map<string, Circle>,
    shouldDrawText: boolean = false,
    textFillColor: string = "white",
    lineColor: string = "white"
  ) {
    const p5 = PathFinder.p5;
    const { drawAdjust }: Configuration = PathFinder.configuration;
    for (const [edge, weight] of edgePaths) {
      const [nodeA, nodeB] = edge.split("-");
      const circA = circles.get(nodeA),
        circB = circles.get(nodeB);
      if (circA && circB) {
        const angle = p5.atan2(circA.y - circB.y, circA.x - circB.x);
        const x1 = circA.x - (circA.r + drawAdjust) * p5.cos(angle);
        const y1 = circA.y - (circA.r + drawAdjust) * p5.sin(angle);
        const x2 = circB.x + (circB.r + drawAdjust) * p5.cos(angle);
        const y2 = circB.y + (circB.r + drawAdjust) * p5.sin(angle);
        p5.stroke(lineColor).strokeWeight(1.2).line(x1, y1, x2, y2);
        if (shouldDrawText) {
          p5.noStroke()
            .textAlign(p5.CENTER, p5.CENTER)
            .textSize(16)
            .fill(textFillColor)
            .text(weight, (circA.x + circB.x) / 2, (circA.y + circB.y) / 2);
        }
      }
    }
  }
}
