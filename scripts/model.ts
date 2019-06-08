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

  constructor() {
    d3.json("data.json").then((data: any) => {
      this.matrix = [];
      this.nodes = data.nodes;
      this.edges = data.links;

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

      this.order = this.changeOrder('name');
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


let greeter = new Model();
