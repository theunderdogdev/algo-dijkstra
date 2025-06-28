window.hexToRgb = function (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}, 1)`
    : null;
};
const checkSize = function () {
  if ($(window).width() < 800 || $(window).height() < 500) {
    $(".p5Canvas").css("display", "none");
  } else {
    $(".p5Canvas").css("display", "block");
  }
};
checkSize();
let shortestDistanceNode = (distances, visited) => {
  let shortest = null;

  for (let node in distances) {
    let currentIsShortest =
      shortest === null || distances[node] < distances[shortest];

    if (currentIsShortest && !visited.includes(node)) {
      shortest = node;
    }
  }
  return shortest;
};
let findShortestPath = (graph, startNode, endNode) => {
  let distances = {};
  distances[endNode] = "Infinity";
  distances = Object.assign(distances, graph[startNode]);
  let parents = { endNode: null };
  for (let child in graph[startNode]) {
    parents[child] = startNode;
  }

  // collect visited nodes
  let visited = [];
  let node = shortestDistanceNode(distances, visited);

  // for that node:
  while (node) {
    let distance = distances[node];
    let children = graph[node];

    for (let child in children) {
      if (String(child) === String(startNode)) {
        continue;
      } else {
        let newdistance = distance + children[child];

        if (!distances[child] || distances[child] > newdistance) {
          // save the distance to the object
          distances[child] = newdistance;
          // record the path
          parents[child] = node;
        }
      }
    }
    visited.push(node);
    node = shortestDistanceNode(distances, visited);
  }

  // using the stored paths from start node to end node
  // record the shortest path
  let shortestPath = [endNode];
  let parent = parents[endNode];
  while (parent) {
    shortestPath.push(parent);
    parent = parents[parent];
  }
  shortestPath.reverse();

  // the shortest path
  let results = {
    distance: distances[endNode],
    path: shortestPath,
  };
  return results;
};
/*--------------------------------------- Defining the graph data structure --------------------------------------*/
class Graph {
  constructor() {
    this.nodes = new Map();
  }
  addNode(node) {
    var node_params = {};
    this.nodes.set(node, node_params);
  }
  addNeighbors(source, destination, wt) {
    this.nodes.get(source)[destination] = wt;
    this.nodes.get(destination)[source] = wt;
  }

  size() {
    var length = 0;
    for (var a of g.nodes.keys()) {
      length++;
    }
    return length;
  }
}
/*--------------------------------------- Random Graphs Generation --------------------------------------*/

const PathFinder = {
  circles: [],
  winHeight: 0,
  winWidth: 0,
  graph: new Graph(),
  finalPath: null,
  colors: ["#8b5cf6", "#3b82f6", "#0ea5e9", "#10b981", "#f97316"],
  lastExists: null,
  defineEdgesAndNodes() {
    this.numNodes = Math.floor(Math.random() * 5) + 10;
    this.numEdges = this.numNodes;
  },
  choseChar(len) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return characters.charAt(Math.floor(Math.random() * len));
  },
  createNodes() {
    this.nodes = [];
    for (i = 1; i <= this.numNodes; ) {
      const aplh = this.choseChar(this.numNodes);
      if (!this.nodes.includes(aplh)) {
        this.nodes.push(aplh);
        i++;
      }
    }
  },
  shuffler() {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    this.weights = [];
    let i = this.numEdges,
      j = 0;

    while (i--) {
      j = Math.floor(Math.random() * (i + 1));
      this.weights.push(nums[j]);
      nums.splice(j, 1);
    }
  },
  addNodesToGraph() {
    this.sortedNodes = this.nodes.sort();
    for (let char in this.sortedNodes) {
      this.graph.addNode(this.sortedNodes[char]);
    }
  },
  createEdges() {
    this.edges = [];
    for (let i = 1; i <= this.numNodes; ) {
      const a = Math.floor(Math.random() * this.numEdges);
      const b = Math.floor(Math.random() * this.numEdges);

      if (
        !this.edges.includes(this.nodes[a] + this.nodes[b]) &&
        this.nodes[a] != this.nodes[b]
      ) {
        this.edges.push(this.nodes[a] + this.nodes[b]);
        //console.log(nodes[a],nodes[b])
        this.graph.addNeighbors(
          this.nodes[a],
          this.nodes[b],
          this.weights[i - 1]
        );
        i++;
      }
    }
  },
  createGraph() {
    this.newGraph = {};
    for (let a of this.graph.nodes.keys()) {
      this.newGraph[a] = this.graph.nodes.get(a);
    }
  },
  getCircle(label) {
    for (let cir in this.circles) {
      if (this.circles[cir].text === label) {
        return this.circles[cir];
      }
    }
  },
  adjustWindowDims() {
    this.winWidth = $(window).width() - 10;
    this.winHeight = $(window).height() - 10;
  },
  createCircles(separation = 50) {
    this.adjustWindowDims();
    this.circles = [];
    let breaker = 0;
    let i = 0;
    while (this.circles.length < this.numNodes) {
      const circle = {
        x: random(50, this.winWidth - 50),
        y: random(50, this.winHeight - 50),
        r: 25,
        text: this.nodes[i],
        color: this.colors[Math.floor(Math.random() * 5)],
      };
      let overlapping = false;
      for (let j = 0; j < this.circles.length; j++) {
        const other = this.circles[j];
        const d = dist(circle.x, circle.y, other.x, other.y);
        if (d < circle.r + other.r + separation) {
          overlapping = true;
        }
      }
      if (!overlapping) {
        this.circles.push(circle);
        i++;
      }

      // Are we stuck?
      breaker++;
      if (breaker > 1000) {
        break;
      }
    }
  },
  drawCircles() {
    for (let i = 0; i < this.circles.length; i++) {
      fill(this.circles[i].color);
      noStroke();
      ellipse(
        this.circles[i].x,
        this.circles[i].y,
        this.circles[i].r * 2,
        this.circles[i].r * 2
      );
      fill("#FFFFFF");
      textAlign(CENTER, CENTER);
      textSize(22);
      text(this.circles[i].text, this.circles[i].x, this.circles[i].y);
    }
  },
  drawEdgeLines() {
    for (let i = 0; i < this.numNodes; i++) {
      const graphNodes = this.graph.nodes.get(this.nodes[i]);
      const currCirc = this.getCircle(this.nodes[i]);
      const x1 = currCirc.x;
      const y1 = currCirc.y;
      for (item of Object.keys(graphNodes)) {
        const nextCirc = this.getCircle(item);
        const x2 = nextCirc.x;
        const y2 = nextCirc.y;
        stroke("rgb(255,255,255)");
        strokeWeight(1.5);

        line(x1, y1, x2, y2);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20);
        text(graphNodes[item], (x1 + x2) / 2, (y1 + y2) / 2);
      }
    }
  },
  resetSketch() {
    clear();
    background("rgba(9, 38, 53, 1)");
    this.defineEdgesAndNodes();
    this.createNodes();
    this.addNodesToGraph();
    this.shuffler();
    this.createEdges();
    this.createCircles(100);
    this.drawCircles();
    this.drawEdgeLines();
    this.createGraph();
  },

  drawPath() {
    if (this.lastExists !== null) {
      clear();
      background("rgba(9, 38, 53, 1)");
      this.drawCircles();
      this.drawEdgeLines();
    }

    for (i = 0; i < this.finalPath.path.length - 1; ) {
      const circ1 = this.getCircle(this.finalPath.path[i]);
      const circ2 = PathFinder.getCircle(this.finalPath.path[i + 1]);
      let x1, y1, x2, y2;
      x1 = circ1.x;
      y1 = circ1.y;
      x2 = circ2?.x;
      y2 = circ2?.y;
      stroke("rgba(13,110,253,1)");
      line(x1, y1, x2, y2);
      i += 1;
    }
    this.lastExists = this.finalPath;
  },
};

PathFinder.winWidth = $(window).width() - 10;
PathFinder.winHeight = $(window).height() - 10;

window.addEventListener("resize", () => {
  PathFinder.adjustWindowDims();
  checkSize();
  createCanvas(PathFinder.winWidth, PathFinder.winHeight).position(5, 5);
  background("rgba(9, 38, 53, 1)");
});

function setup() {
  textFont("Inconsolata");
  createCanvas(PathFinder.winWidth, PathFinder.winHeight).position(5, 5);
  PathFinder.resetSketch();
}

$("#new").click(function () {
  PathFinder.resetSketch();
});
const createAlert = (text) => {
  $("#bstrap-a").text(text).fadeIn();
  setTimeout(() => {
    $("#bstrap-a").fadeOut();
    console.log("executed");
  }, 5000);
};
let lastExists;
$("#search").click(function () {
  $(this).addClass("routing");
  let start = $("#start").val();
  let end = $("#end").val();
  if (start == "") {
    createAlert("Please provide start point!");
  } else if (end == "") {
    createAlert("Please provide end point!");
  } else {
    start = start.replace(/\s+/g, "");
    end = end.replace(/\s+/g, "");
    PathFinder.finalPath = findShortestPath(PathFinder.newGraph, start, end);
    PathFinder.drawPath();
    if (PathFinder.finalPath.distance === "Infinity") {
      createAlert("No path found");
    }

    $("#start").val("");
    $("#end").val("");
  }
  setTimeout(() => {
    $(this).removeClass("routing");
  }, 1500);
});
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
  const sib = $(this).parent().siblings(".entry-wrap").children("input");
  if (evt.key !== "Backspace") {
    console.log("not bsp", $(this).val().length);
    if ($(this).val().length === 1 && sib.val() === "") {
      sib.focus();
    }
  } else {
    console.log("bsp");
    if (sib.val() !== "" || sib.attr("id") === "start") {
      sib.focus();
    }
  }
});