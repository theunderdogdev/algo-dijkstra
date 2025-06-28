/**
 * Converts a hex color string to an RGBA string.
 * @param {string} hex - The hex color string (e.g., "#RRGGBB" or "RRGGBB").
 * @returns {string | null} An RGBA string (e.g., "rgba(255, 0, 0, 1)") or null if the input is invalid.
 */
window.hexToRgb = function (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}, 1)`
    : null;
};

/**
 * Checks the window size and toggles the display of the p5Canvas accordingly.
 * @returns {void}
 */
const checkSize = function () {
  // Check if jQuery is defined before using $
  if (typeof $ !== 'undefined') {
    if ($(window).width() < 800 || $(window).height() < 500) {
      $(".p5Canvas").css("display", "none");
    } else {
      $(".p5Canvas").css("display", "block");
    }
  }
};
checkSize();

/**
 * Finds the node with the shortest distance that has not yet been visited.
 * @param {Record<string, number>} distances - An object mapping node labels to their current shortest distances.
 * @param {string[]} visited - An array of node labels that have already been visited.
 * @returns {string | null} The label of the shortest unvisited node, or null if all nodes are visited or distances are empty.
 */
let shortestDistanceNode = (distances, visited) => {
  let shortest = null;
  let minDistance = Infinity; // Use JS Infinity

  for (let node in distances) {
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
};

/**
 * Finds the shortest path between two nodes in a graph using Dijkstra's algorithm.
 * @param {Record<string, Record<string, number>>} graph - The graph represented as an adjacency list.
 * @param {string} startNode - The starting node.
 * @param {string} endNode - The destination node.
 * @returns {{distance: number, path: string[]}} An object containing the shortest distance and the path.
 */
let findShortestPath = (graph, startNode, endNode) => {
  /** @type {Record<string, number>} */
  let distances = {};
  /** @type {Record<string, string | null>} */
  let parents = {};

  // Initialize all distances to Infinity, except for the startNode
  for (let node in graph) {
    if (graph.hasOwnProperty(node)) {
      distances[node] = Infinity; // Use JS Infinity
      parents[node] = null; // Initialize parents for all nodes
    }
  }
  distances[startNode] = 0; // Distance to startNode is 0

  // Initialize direct neighbors of startNode
  for (let child in graph[startNode]) {
    if (graph[startNode].hasOwnProperty(child)) {
      distances[child] = graph[startNode][child];
      parents[child] = startNode;
    }
  }

  /** @type {string[]} */
  let visited = [];
  let node = shortestDistanceNode(distances, visited);

  while (node !== null) { // Loop while a shortest unvisited node is found
    const distance = distances[node];
    const children = graph[node];

    // If the current node is unreachable, all its children are also unreachable via this path
    if (distance === Infinity) {
      break; // No need to explore further from an unreachable node
    }

    for (let child in children) {
      if (children.hasOwnProperty(child)) {
        if (child === startNode) {
          continue;
        }

        const newdistance = distance + children[child];

        // If a shorter path to child is found
        if (newdistance < distances[child]) { // Direct comparison with Infinity works as expected
          distances[child] = newdistance;
          parents[child] = node;
        }
      }
    }
    visited.push(node);
    node = shortestDistanceNode(distances, visited);
  }

  /** @type {string[]} */
  let shortestPath = [endNode];
  let parent = parents[endNode];

  // If the endNode is unreachable, return Infinity distance and an empty path
  if (distances[endNode] === Infinity) {
      return { distance: Infinity, path: [] };
  }

  // Reconstruct the path
  while (parent !== null) { // Loop while there's a parent
    shortestPath.push(parent);
    parent = parents[parent];
  }
  shortestPath.reverse(); // Path is built in reverse, so reverse it at the end

  /** @type {{distance: number, path: string[]}} */
  let results = {
    distance: distances[endNode],
    path: shortestPath,
  };
  return results;
};

/*--------------------------------------- Defining the graph data structure --------------------------------------*/
/**
 * Represents an undirected graph.
 */
class Graph {
  /**
   * @type {Map<string, Record<string, number>>}
   */
  nodes;

  constructor() {
    /**
     * A map where keys are node labels (strings) and values are objects representing neighbors
     * with edge weights.
     * @type {Map<string, Record<string, number>>}
     */
    this.nodes = new Map();
  }

  /**
   * Adds a new node to the graph.
   * @param {string} node - The label of the node to add.
   * @returns {void}
   */
  addNode(node) {
    this.nodes.set(node, {}); // Initialize with an empty object for neighbors
  }

  /**
   * Adds an undirected edge between two nodes with a given weight.
   * @param {string} source - The label of the source node.
   * @param {string} destination - The label of the destination node.
   * @param {number} wt - The weight of the edge.
   * @returns {void}
   */
  addNeighbors(source, destination, wt) {
    if (!this.nodes.has(source) || !this.nodes.has(destination)) {
      console.warn(
        `Attempted to add neighbors between non-existent nodes: ${source}, ${destination}`
      );
      return;
    }
    // Ensure the neighbor object exists before assigning
    // This check is technically redundant if addNode initializes with {}
    // but harmless as a safeguard.
    if (!this.nodes.get(source)) this.nodes.set(source, {});
    if (!this.nodes.get(destination)) this.nodes.set(destination, {});

    this.nodes.get(source)[destination] = wt;
    this.nodes.get(destination)[source] = wt;
  }

  /**
   * Returns the number of nodes in the graph.
   * @returns {number} The number of nodes.
   */
  size() {
    return this.nodes.size;
  }
}

/*--------------------------------------- Random Graphs Generation --------------------------------------*/
/**
 * @typedef {object} Circle
 * @property {number} x - The x-coordinate of the circle's center.
 * @property {number} y - The y-coordinate of the circle's center.
 * @property {number} r - The radius of the circle.
 * @property {string} color - The color of the circle (e.g., hex or rgba).
 * @property {string} text - The text label for the circle.
 */

/**
 * @typedef {object} Configuration
 * @property {number} wMax - Maximum weight for edges.
 * @property {number} wMin - Minimum weight for edges.
 * @property {number} separation - Minimum separation between circles.
 * @property {number} maxIterations - Maximum iterations for placing circles to prevent infinite loops.
 * @property {number} itemsMin - Minimum number of nodes/items.
 * @property {number} itemsMax - Maximum number of nodes/items.
 * @property {number} xOffset - X-axis offset for drawing.
 * @property {number} yOffset - Y-axis offset for drawing.
 * @property {number} drawAdjust - Edge line adjustment.
 */

/**
 * @typedef {object} PathFinderInstance
 * @property {Configuration} CONFIG - Configuration settings for graph generation and rendering.
 * @property {Map<string, Circle>} circles - A map of circle labels to their Circle properties.
 * @property {number} winHeight - The current window height used for canvas.
 * @property {number} winWidth - The current window width used for canvas.
 * @property {Graph} graph - The graph data structure.
 * @property {{distance: number, path: string[]} | null} finalPath - The result of the shortest path calculation.
 * @property {string[]} colors - Array of predefined colors for circles.
 * @property {{distance: number, path: string[]} | null} lastExists - Stores the last drawn path for clearing.
 * @property {import("p5")} p5 - The p5.js instance.
 * @property {string} ALPHABETS - String containing all uppercase alphabet letters.
 * @property {number} numNodes - The number of nodes currently in the graph.
 * @property {number} numEdges - The number of edges currently in the graph.
 * @property {string[]} nodes - Array of node labels (e.g., ["A", "B", "C"]).
 * @property {string[]} edges - Array of edge strings (e.g., ["AB", "BC"]).
 * @property {Record<string, Record<string, number>>} newGraph - The graph converted to a plain object for `findShortestPath`.
 * @property {function(number, number): void} defineEdgesAndNodes - Defines the number of nodes and edges.
 * @property {function(number, number): string[]} getLabels - Generates node labels.
 * @property {function(): void} createNodes - Creates nodes in the graph.
 * @property {function(): number} generateWeight - Generates a random weight for edges.
 * @property {function(): void} createEdges - Creates edges in the graph.
 * @property {function(): void} createGraph - Converts graph to a plain object.
 * @property {function(string): Circle | undefined} getCircle - Retrieves a circle by its label.
 * @property {function(): void} adjustWindowDims - Adjusts window dimensions.
 * @property {function(number): void} createCircles - Creates and positions circles for nodes.
 * @property {function(): void} drawCircles - Draws all circles on the canvas.
 * @property {function(): void} drawEdgeLines - Draws all edges on the canvas.
 * @property {function(): void} resetSketch - Resets the entire sketch.
 * @property {function(): void} drawPath - Draws the shortest path found.
 */
const PathFinder = {
  /** @type {Map<string, Circle>} */
  circles: new Map(),
  /** @type {number} */
  winHeight: 0,
  /** @type {number} */
  winWidth: 0,
  /** @type {Graph} */
  graph: new Graph(),
  /** @type {{distance: number, path: string[]} | null} */
  finalPath: null,
  /** @type {string[]} */
  colors: ["#8b5cf6", "#3b82f6", "#0ea5e9", "#10b981", "#f97316"],
  /** @type {{distance: number, path: string[]} | null} */
  lastExists: null, // This is correctly within PathFinder
  /** @type {import("p5") | null} */ // Changed to allow null initially
  p5: null,
  /** @type {string} */
  ALPHABETS: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  /** @type {Configuration} */
  CONFIG: {
    wMax: 100,
    wMin: 10,
    separation: 50,
    maxIterations: 10000,
    itemsMin: 10,
    itemsMax: 22,
    xOffset: 50,
    yOffset: 50,
    drawAdjust: 2,
  },
  /**
   * Defines the number of nodes and edges for the graph based on min and max values.
   * @param {number} min - The minimum number of nodes.
   * @param {number} max - The maximum number of nodes.
   * @returns {void}
   */
  defineEdgesAndNodes(min, max) {
    /** @type {number} */
    this.numNodes = Math.floor(Math.random() * (max - min + 1)) + min;
    /** @type {number} */
    // A common approach is to have numEdges be proportional to numNodes, or a bit more
    // For a connected graph, you need at least numNodes - 1 edges.
    // Let's aim for 1.5 to 2 times numNodes for a somewhat dense graph, up to a max to prevent too many edges
    this.numEdges = Math.floor(Math.random() * (this.numNodes - this.numNodes * 0.75  + 1)) + this.numNodes;
    // Cap numEdges to prevent excessive edges, e.g., max edges for N nodes is N*(N-1)/2
    const maxPossibleEdges = (this.numNodes * (this.numNodes - 1)) / 2;
    this.numEdges = Math.min(this.numEdges, maxPossibleEdges);
    if (this.numNodes > 1 && this.numEdges < this.numNodes - 1) { // Ensure at least enough edges for a connected graph if possible
        this.numEdges = this.numNodes - 1;
    }
  },
  /**
   * Generates an array of alphabet labels from a given start and end index.
   * @param {number} start - The starting index in the ALPHABETS string.
   * @param {number} end - The ending index in the ALPHABETS string (exclusive).
   * @returns {string[]} An array of character labels.
   */
  getLabels(start, end) {
    return this.ALPHABETS.slice(start, end).split("");
  },
  /**
   * Creates nodes in the graph based on the generated labels.
   * @returns {void}
   */
  createNodes() {
    /** @type {string[]} */
    this.nodes = this.getLabels(0, this.numNodes);
    for (const node of this.nodes) {
      this.graph.addNode(node);
    }
  },
  /**
   * Generates a random weight for an edge.
   * @returns {number} The generated weight.
   */
  generateWeight: () => {
    return Math.round(
      Math.random() * (PathFinder.CONFIG.wMax - PathFinder.CONFIG.wMin) +
        PathFinder.CONFIG.wMin
    );
  },
  /**
   * Creates random edges between nodes in the graph.
   * @returns {void}
   */
  createEdges() {
    /** @type {Set<string>} */
    const existingEdges = new Set(); // Use a Set for faster lookups
    this.edges = []; // Reset this.edges array

    for (let i = 0; i < this.numEdges; ) {
      const aIndex = Math.floor(Math.random() * this.numNodes);
      const bIndex = Math.floor(Math.random() * this.numNodes);

      const nodeA = this.nodes[aIndex];
      const nodeB = this.nodes[bIndex];

      if (nodeA === nodeB) {
        continue; // No self-loops
      }

      // Create a canonical representation for the edge to avoid duplicates (e.g., "AB" vs "BA")
      const edgeKey = nodeA < nodeB ? `${nodeA}${nodeB}` : `${nodeB}${nodeA}`;

      if (!existingEdges.has(edgeKey)) {
        existingEdges.add(edgeKey);
        this.edges.push(edgeKey); // Store for debug/info if needed
        this.graph.addNeighbors(
          nodeA,
          nodeB,
          this.generateWeight()
        );
        i++;
      }
    }
  },
  /**
   * Converts the graph's nodes map into a plain object format suitable for pathfinding algorithms.
   * @returns {void}
   */
  createGraph() {
    /** @type {Record<string, Record<string, number>>} */
    this.newGraph = {};
    for (let [key, value] of this.graph.nodes.entries()) { // Iterate using entries() for Map
      this.newGraph[key] = value;
    }
  },
  /**
   * Retrieves a Circle object by its label.
   * @param {string} label - The label of the circle.
   * @returns {Circle | undefined} The Circle object or undefined if not found.
   */
  getCircle(label) {
    return this.circles.get(label);
  },
  /**
   * Adjusts the window dimensions stored in PathFinder.
   * @returns {void}
   */
  adjustWindowDims() {
    this.winWidth = $(window).width() - 10;
    this.winHeight = $(window).height() - 10;
  },
  /**
   * Creates and positions circles for each node, ensuring they don't overlap.
   * @param {number} [separation=50] - The minimum separation distance between circles.
   * @returns {void}
   */
  createCircles(separation = 50) {
    this.adjustWindowDims();
    /** @type {Map<string, Circle>} */
    this.circles = new Map(); // Re-initialize circles for a new graph
    let breaker = 0;
    let i = 0;
    while (this.circles.size < this.numNodes && i < this.nodes.length) { // Ensure i doesn't exceed nodes length
      // Use this.p5.random for p5.js functions
      const circle = {
        x: this.p5.random(
          this.CONFIG.xOffset,
          this.winWidth - this.CONFIG.xOffset
        ),
        y: this.p5.random(
          this.CONFIG.yOffset,
          this.winHeight - this.CONFIG.yOffset
        ),
        r: 25,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        text: this.nodes[i], // Assign the node label as text
      };
      let overlapping = false;
      for (const [_, other] of this.circles) {
        const d = this.p5.dist(circle.x, circle.y, other.x, other.y);
        if (d < circle.r + other.r + separation) {
          overlapping = true;
          break; // Optimization: no need to check further if overlap found
        }
      }
      if (!overlapping) {
        this.circles.set(this.nodes[i], circle);
        i++;
      }

      breaker++;
      if (breaker > this.CONFIG.maxIterations) {
        console.warn(
          "Max iterations reached for circle placement. Some nodes might not be placed."
        );
        break; // Break if max iterations reached to prevent infinite loop
      }
    }
  },
  /**
   * Draws all the circles (nodes) on the p5 canvas.
   * @returns {void}
   */
  drawCircles() {
    // Iterate over the Map, not a fixed-length array
    for (const [label, circle] of this.circles) {
      this.p5
        .fill(circle.color)
        .noStroke()
        .circle(circle.x, circle.y, circle.r * 2)
        .fill("white")
        .textAlign(this.p5.CENTER, this.p5.CENTER)
        .textSize(22)
        .text(label, circle.x, circle.y); // Use label from map as text
    }
  },
  /**
   * Draws lines (edges) between connected circles on the p5 canvas, along with edge weights.
   * @returns {void}
   */
  drawEdgeLines() {
    // Iterate over the actual nodes present in the graph, not just `this.nodes`
    for (const nodeLabel of this.graph.nodes.keys()) {
      const graphNeighbors = this.graph.nodes.get(nodeLabel);
      if (!graphNeighbors) continue;

      const currCirc = this.getCircle(nodeLabel);
      if (!currCirc) continue;

      for (const item in graphNeighbors) {
        if (!graphNeighbors.hasOwnProperty(item)) continue;

        const nextCirc = this.getCircle(item);
        if (!nextCirc) continue;

        // To avoid drawing duplicate lines (e.g., A-B and B-A),
        // only draw if nodeLabel is "less" than item (lexicographically)
        // This assumes undirected graph where neighbors are added symmetrically.
        if (nodeLabel > item) { // Only draw one direction for undirected graph
            continue;
        }

        // Calculate angle from current circle to next circle
        const angle = this.p5.atan2(
          nextCirc.y - currCirc.y,
          nextCirc.x - currCirc.x
        );

        // Calculate start point on current circle's circumference
        const x1Circ =
          currCirc.x +
          (currCirc.r + this.CONFIG.drawAdjust) * this.p5.cos(angle);
        const y1Circ =
          currCirc.y +
          (currCirc.r + this.CONFIG.drawAdjust) * this.p5.sin(angle);

        // Calculate end point on next circle's circumference (point back towards first circle)
        const x2Circ =
          nextCirc.x +
          (nextCirc.r + this.CONFIG.drawAdjust) *
            this.p5.cos(angle + this.p5.PI);
        const y2Circ =
          nextCirc.y +
          (nextCirc.r + this.CONFIG.drawAdjust) *
            this.p5.sin(angle + this.p5.PI);

        this.p5.stroke("rgb(255,255,255)");
        this.p5.strokeWeight(1.2);
        this.p5.line(x1Circ, y1Circ, x2Circ, y2Circ);
        this.p5.noStroke(); // Turn off stroke for text

        // Draw text (weight) in the middle of the line (center-to-center)
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.textSize(16); // Slightly smaller text for weights
        this.p5.fill(255); // Ensure text is visible
        this.p5.text(
          graphNeighbors[item],
          (currCirc.x + nextCirc.x) / 2,
          (currCirc.y + nextCirc.y) / 2
        );
      }
    }
  },
  /**
   * Resets the p5 sketch, generating a new random graph and drawing it.
   * @returns {void}
   */
  resetSketch() {
    this.p5.clear();
    this.p5.background("rgba(9, 38, 53, 1)");
    this.defineEdgesAndNodes(this.CONFIG.itemsMin, this.CONFIG.itemsMax);
    this.graph = new Graph(); // Reset the graph instance
    this.createNodes();
    this.createEdges();
    this.createCircles(this.CONFIG.separation); // Use config separation
    this.drawCircles();
    this.drawEdgeLines();
    this.createGraph(); // Ensure newGraph is updated
    this.finalPath = null; // Clear any previous final path
    this.lastExists = null; // Clear last exists
  },

  /**
   * Draws the shortest path found on the p5 canvas.
   * @returns {void}
   */
  drawPath() {
    if (!this.finalPath || this.finalPath.path.length < 2) {
      console.warn("No valid path to draw.");
      return;
    }

    // Always redraw the base graph before drawing the path
    this.p5.clear().background("rgba(9, 38, 53, 1)");
    this.drawCircles();
    this.drawEdgeLines();

    for (let i = 0; i < this.finalPath.path.length - 1; i++) {
      const circ1 = this.getCircle(this.finalPath.path[i]);
      const circ2 = this.getCircle(this.finalPath.path[i + 1]);

      if (!circ1 || !circ2) {
        console.warn(
          `Could not find circle for node: ${this.finalPath.path[i]} or ${
            this.finalPath.path[i + 1]
          }`
        );
        continue;
      }
      const angle = this.p5.atan2(circ2.y - circ1.y, circ2.x - circ1.x);
      const x1Circ =
        circ1.x + (circ1.r + this.CONFIG.drawAdjust) * this.p5.cos(angle);
      const y1Circ =
        circ1.y + (circ1.r + this.CONFIG.drawAdjust) * this.p5.sin(angle);

      // Calculate end point on next circle's circumference (point back towards first circle)
      const x2Circ =
        circ2.x +
        (circ2.r + this.CONFIG.drawAdjust) *
            this.p5.cos(angle + this.p5.PI);
      const y2Circ =
        circ2.y +
        (circ2.r + this.CONFIG.drawAdjust) *
            this.p5.sin(angle + this.p5.PI);

      this.p5.stroke("rgb(4, 188, 47)");
      this.p5.strokeWeight(3); // Make path thicker
      this.p5.line(x1Circ, y1Circ, x2Circ, y2Circ);
    }
    this.lastExists = this.finalPath;
  },
};

// Check if jQuery is loaded before using $
if (typeof $ !== 'undefined') {
  PathFinder.winWidth = $(window).width() - 10;
  PathFinder.winHeight = $(window).height() - 10;

  $(window).on("resize", () => { // Use .on() for consistency and potential multiple handlers
    PathFinder.adjustWindowDims();
    checkSize();
    // Ensure p5.js functions are called correctly
    if (PathFinder.p5) { // Check if p5 instance is stored in PathFinder
      PathFinder.p5.resizeCanvas(PathFinder.winWidth, PathFinder.winHeight);
      PathFinder.p5.background("rgba(9, 38, 53, 1)");
      PathFinder.drawCircles(); // Redraw elements after resize
      PathFinder.drawEdgeLines();
      if (PathFinder.finalPath) {
        PathFinder.drawPath();
      }
    }
  });

  $("#new").click(function () {
    PathFinder.resetSketch();
  });

  /**
   * Creates and displays a temporary alert message.
   * @param {string} text - The message to display in the alert.
   * @returns {void}
   */
  const createAlert = (text) => {
    // Check if #bstrap-a exists before trying to manipulate it
    const alertElement = $("#bstrap-a");
    if (alertElement.length) {
      alertElement.text(text).fadeIn();
      setTimeout(() => {
        alertElement.fadeOut();
        console.log("Alert faded out");
      }, 5000);
    } else {
        console.warn("Alert element #bstrap-a not found.");
    }
  };

  $("#search").click(function () {
    const searchButton = $(this);
    searchButton.addClass("routing");
    let start = $("#start").val()
    let end = $("#end").val()

    if (start === "") {
      createAlert("Please provide a start point!");
      searchButton.removeClass("routing"); // Remove routing class immediately if invalid input
      return; // Exit function early
    } else if (end === "") {
      createAlert("Please provide an end point!");
      searchButton.removeClass("routing"); // Remove routing class immediately if invalid input
      return; // Exit function early
    }

    start = start.replace(/\s+/g, "").toUpperCase();
    end = end.replace(/\s+/g, "").toUpperCase();

    // Check if start/end nodes actually exist in the graph
    if (!PathFinder.graph.nodes.has(start)) {
      createAlert(`Start node '${start}' not found in graph.`);
      PathFinder.resetSketch(); // Reset to clear potential path highlights
    } else if (!PathFinder.graph.nodes.has(end)) {
      createAlert(`End node '${end}' not found in graph.`);
      PathFinder.resetSketch(); // Reset to clear potential path highlights
    } else {
      PathFinder.finalPath = findShortestPath(PathFinder.newGraph, start, end);
      PathFinder.drawPath(); // This will redraw the base graph and then highlight the path

      if (PathFinder.finalPath.distance === Infinity) { // Compare with JS Infinity
        createAlert("No path found between the specified nodes.");
      } else {
        createAlert(`Shortest path distance: ${PathFinder.finalPath.distance}`);
      }
    }

    $("#start").val("");
    $("#end").val("");

    // Use a variable to ensure 'this' refers to the button when the timeout executes
    setTimeout(() => {
      searchButton.removeClass("routing");
    }, 1500);
  });

  /** @type {JQuery<HTMLElement>} */
  const nav = $("nav.floating-nav");

  $("#nav-toggler").click(function (e) {
    if (nav.hasClass("active")) {
      nav.removeClass("active");
      $(this).removeClass("active");
    } else {
      $(this).addClass("active");
      nav.addClass("active");
    }
  });

  $(".entries").on("keyup", function (evt) {
    /** @type {JQuery<HTMLInputElement>} */
    const currentInput = $(this);
    /** @type {JQuery<HTMLInputElement>} */
    const sib = currentInput.parent().siblings(".entry-wrap").children("input");

    if (evt.key !== "Backspace") {
      if (String(currentInput.val()).length === 1 && sib.val() === "") {
        sib.focus();
      }
    } else {
      // If backspace and current input is empty, and sibling is not empty or it's the start field
      if (String(currentInput.val()) === "" && (String(sib.val()) !== "" || currentInput.attr("id") === "start")) {
        sib.focus();
      }
    }
  });
}


/**
 * The p5.js setup function, called once when the sketch starts.
 * @param {import("p5")} p - The p5.js instance.
 * @returns {void}
 */
function setup() {
  // Pass the p5 instance directly to PathFinder.p5, don't assume global window.p5
  // p is the p5 instance passed by the p5.js library
  PathFinder.p5 = this; // 'this' inside setup refers to the p5 instance

  this.textFont("Inconsolata");
  this.createCanvas(PathFinder.winWidth, PathFinder.winHeight).position(5, 5);
  PathFinder.resetSketch();
}