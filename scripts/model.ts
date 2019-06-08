//import * as d3 from 'd3';

class Model {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private data: any;
  private matrix: any;
  private nodes: any;
  private edges: any;
  private order: any;
  private controller: any;

  constructor(controller : any) {
    d3.json("data.json").then((data: any) => {
      this.matrix = [];
      this.nodes = data.nodes;
      this.edges = data.links;
      this.controller = controller;

      this.processData();

      this.order = this.changeOrder('name');
      this.controller.updateData(this.nodes,this.edges);
    })
  }

  /**
   *   Determines the order of the current nodes
   * @param  type A string corresponding to the attribute name to sort by.
   * @return      A numerical range in corrected order.
   */
  changeOrder(type: string) {
    if (type == 'name') {
      this.order = d3.range(this.nodes.length).sort((a, b) => { return d3.ascending(this.nodes[a].name, this.nodes[b].name); })
    }
    else {
      this.order = d3.range(this.nodes.length).sort((a, b) => { return this.nodes[b][type] - this.nodes[a][type]; })
    }
  }

  /**
   * [processData description]
   * @return [description]
   */
  processData(){
    // Set up node data
    this.nodes.forEach((node, i) => {
      node.index = i;
      node.count = 0;

      /* Numeric Conversion */
      node.familyBefore = +node.familyBefore;
      node.familyAfter = +node.familyAfter;
      node.individualBefore = +node.individualBefore;
      node.individualAfter = +node.individualAfter;

      /* matrix used for edge attributes, otherwise should we hide */
      this.matrix[i] = d3.range(this.nodes.length).map(function(j) { return { x: j, y: i, z: 0 }; });
    });

    // Convert links to matrix; count character occurrences.
    this.edges.forEach((link) => {
      /* could be used for varying edge types */
      //this.matrix[link.source][link.target].z += link.value;
      //this.matrix[link.target][link.source].z += link.value;
      //matrix[link.source][link.source].z += link.value;
      //matrix[link.target][link.target].z += link.value;
      this.matrix[link.source].count += link.value;
      this.matrix[link.target].count += link.value;
    });
  }

  getOrder(){
    return this.order;
  }

  /**
   * Returns the node data.
   * @return Node data in JSON Array
   */
  getNodes() {
    return this.nodes;
  }

  /**
   * Returns the edge data.
   * @return Edge data in JSON Array
   */
  getEdges() {
    return this.edges;
  }

}

// Work on importing class file
class View {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private controller: any;
  private nodes: any;
  private edges: any;


  constructor(controller) {
    this.controller = controller;

    // set up load
    this.renderLoading();
  }

  /**
   * Takes in the data, hides the loading screen, and
   * initalizes visualization.
   * @param  data [description]
   * @return      [description]
   */
  loadData(nodes : any, edges : any) {
    this.nodes = nodes
    this.edges = edges;
    this.hideLoading();
    console.log('view data',nodes, edges);

  }

  /**
   * Changes the current view to be a loading screen.
   * @return None
   */
  renderLoading(){
    d3.select('#overlay')
      .style('opacity',0)
      .style('display','block')
      .transition()
        .duration(1000)
        .style('opacity',1);
  }

  /**
   * Changes the current view to hide the loading screen
   * @return None
   */
  hideLoading(){
    if(d3.select('#overlay').attr('display') != "none"){
      d3.select('#overlay')
        .transition()
          .duration(1000)
          .style('opacity',0)
          .delay(1000)
          .style('display','none');
    }
  }

}

// Work on importing class file
class Controller {
  /*
  The Model handels the loading, sorting, and ordering of the data.
   */
  private view: any;
  private model : any;


  constructor() {
    this.view = new View(this); // initalize view,
    this.model = new Model(this); // start reading in data
  }

  /**
   * Updates the data
   * @return [description]
   */
  updateData(nodes : any, edges : any) {
    this.view.loadData(nodes,edges);
  }

  // Add handlers to the view?

}

let control = new Controller();
