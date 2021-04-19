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
   /*--------------------------------------- Defining the graph data structure
                                                                             --------------------------------------*/
   class Graph{
    constructor(){
      this.nodes = new Map()
    }
    addNode(node){
      var node_params = {}
      this.nodes.set(node,node_params)
    }
    addNeighbors(source,destination,wt){
      this.nodes.get(source)[destination] = wt;
      this.nodes.get(destination)[source] = wt;
    }
    
      size(){
        var length = 0;
        for(var a of g.nodes.keys()){
          length++
        }
        return length;
      }
  }
  /*--------------------------------------- Random Graphs Generation
                                                                    --------------------------------------*/
  var g = new Graph()

    var numNodes = Math.floor(Math.random() * 5) + 10;
    var numEdges = numNodes;
    function choseChar(len) {
        var result;
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    result = characters.charAt(Math.floor(Math.random() * len))
    return result
    }
    var nodes = []
    for(i = 1;i<=numNodes;){
        var aplh = choseChar(numNodes);
        if(!nodes.includes(aplh)){
            nodes.push(aplh)
            i++
        }
    }
    var sorted_nodes = nodes.sort()
    for(charas in sorted_nodes){
        g.addNode(sorted_nodes[charas])
    }
/*------------------------------- Fixed the array because our max value is around 15
                                                                             ------------------------------------*/
        function shuffler(){
          var nums = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
          ranNums = [],
          i = numEdges,
          j = 0;

      while (i--) {
          j = Math.floor(Math.random() * (i+1));
          ranNums.push(nums[j]);
          nums.splice(j,1);
      }
      return ranNums
    }
    var wt = shuffler() //IMP

    var edges_g = []

    for(i = 1;i<=numNodes;){
      a = Math.floor(Math.random() * numEdges);
      b = Math.floor(Math.random() * numEdges);
     

       if(!edges_g.includes(nodes[a] + nodes[b]) && nodes[a] != nodes[b] ){
          edges_g.push(nodes[a] + nodes[b])
          //console.log(nodes[a],nodes[b])
          g.addNeighbors(nodes[a],nodes[b],wt[i-1])
          i++
       }

    }
    var new_g = {}
    for(a of g.nodes.keys()){
        new_g[a] = g.nodes.get(a)
    }
     
 function getCircle(tex){
   for(cir in circles){
      if(circles[cir].text == tex){
        return circles[cir];
      }
    
   }
 }
 /*------------------------------- creating array of non overlapping circle object
                                                                             ------------------------------------*/
     
var circles = [];
   function setup() {
    createCanvas(1200,745).position(5,75);
    background('rgba(0, 0, 0, 0.25)')
    // Lets make sure we don't get stuck in infinite loop 
    var breaker = 0;
  
    var i =0;
    while (circles.length < numNodes) {
      
      var circle = {
        x: random(50,1150),
        y: random(50,695),
        r: 25,
        text : nodes[i]
      };
  
      // Does it overlap any previous circles?
      var overlapping = false;
      for (var j = 0; j < circles.length; j++) {
        var other = circles[j];
        var d = dist(circle.x, circle.y, other.x, other.y);
        if (d < circle.r + other.r + 50) {
          overlapping = true;
        }
      }
  
      // If not keep it!
      if (!overlapping) {
        circles.push(circle);
        i++
      }
  
      // Are we stuck?
      breaker++;
      if (breaker > 10000) {
        break;
      }
    }
  
   colors = ['rgba(0, 255, 0, 0.35)','pink','rgba(253, 255, 137, 0.32)','rgba(51, 214, 214, 0.637)','rgba(151, 110, 110, 0.35)']
    // Drawing all the circles
    for (var i = 0; i < circles.length; i++) {
      fill(colors[Math.floor(Math.random()*5)]);
      noStroke();
      ellipse(circles[i].x, circles[i].y, circles[i].r * 2, circles[i].r * 2);
      fill("#FFFFFF");
      textAlign(CENTER, CENTER);
      textSize(22);
      text(circles[i].text, circles[i].x, circles[i].y);
    }

      for (var i = 0; i < numNodes; i++) {
        var obs_s = g.nodes.get(nodes[i]);
        var this_c = getCircle(nodes[i])
        var x1 = this_c.x;
        var y1 = this_c.y
        for(item of Object.keys(obs_s)){
            var nex_c = getCircle(item);
            var x2 = nex_c.x;
            var y2 = nex_c.y
            stroke('rgba(255,255,255,0.4)')
            line(x1,y1,x2,y2)
          noStroke()
          textAlign(CENTER, CENTER);
          textSize(20);
          text(obs_s[item],(x1+x2)/2,(y1+y2)/2)
        }
          
    }
    
  }
  var last_exists;
  $('#find').click(function(){
    var start = $('#start').val().toUpperCase();
    var end =  $('#end').val().toUpperCase();
    if(start == ""){
      alert("Please Provide Start Point")
    }
     if(end == ""){
      alert("Please Provide End Point")
    }

    else{
      start = start.replace(/\s+/g, '')
      end = end.replace(/\s+/g, '')
      //console.log(start,end)
      var fin_path = findShortestPath(new_g, start, end)
      console.log(fin_path);
      if(fin_path.distance === "Infinity"){
        $('#bstrap-a').addClass('show')
        setTimeout(()=>{
          $('#bstrap-a').removeClass('show');
          console.log("executed")
        },5000);
      }
      if(typeof(last_exists) !== "undefined"){
        for(i=0;i<last_exists.path.length - 1 ;){
            var circ1 = getCircle(last_exists.path[i])
            var circ2 = getCircle(last_exists.path[i+1])
            var x1,y1,x2,y2;
            x1 = circ1.x;
            y1 = circ1.y;
            x2 = circ2?.x;
            y2 = circ2?.y;
            stroke('rgb(255,255,255)')
            strokeWeight(2);
            line(x1,y1,x2,y2);
            //console.log(circ1,circ2)
            i+=1;
        }

      }
      for(i=0;i<fin_path.path.length - 1 ;){
          var circ1 = getCircle(fin_path.path[i])
          var circ2 = getCircle(fin_path.path[i+1])
          var x1,y1,x2,y2;
          x1 = circ1.x;
          y1 = circ1.y;
          x2 = circ2?.x;
          y2 = circ2?.y;
          stroke('rgba(0,128,0,0.75)')
          line(x1,y1,x2,y2);
          //console.log(circ1,circ2)
          i+=1;
      }
      last_exists = fin_path;
    }
});
const tl = new gsap.timeline({defaults: {ease: "power1.out"},paused:false});
var state_changed = false
$('#open').click(function(){
  if(!tl.isActive()){
    if(!state_changed ){
      tl.to('.wrapper',{width:'615px',duration:0.5});
      tl.fromTo('.Togglers',{display:'none',opacity:0},{display:'block',opacity:1,duration:1})
      state_changed = true;
      $(this).text('Close');
    }
    else{
      tl.fromTo('.Togglers',{display:'block',opacity:1},{display:'none',opacity:0,duration:1})
      tl.to('.wrapper',{width:'104px',duration:0.5},'-=0.25');
      state_changed = false
      $(this).text('Open');

    }
  }
})
