//import * as d3 from 'd3';
var Model = /** @class */ (function () {
    function Model(controller) {
        var _this = this;
        d3.json("data.json").then(function (data) {
            _this.matrix = [];
            _this.nodes = data.nodes;
            _this.edges = data.links;
            _this.controller = controller;
            _this.processData();
            _this.order = _this.changeOrder('name');
            _this.controller.updateData(_this.nodes, _this.edges);
        });
    }
    /**
     *   Determines the order of the current nodes
     * @param  type A string corresponding to the attribute name to sort by.
     * @return      A numerical range in corrected order.
     */
    Model.prototype.changeOrder = function (type) {
        var _this = this;
        if (type == 'name') {
            this.order = d3.range(this.nodes.length).sort(function (a, b) { return d3.ascending(_this.nodes[a].name, _this.nodes[b].name); });
        }
        else {
            this.order = d3.range(this.nodes.length).sort(function (a, b) { return _this.nodes[b][type] - _this.nodes[a][type]; });
        }
    };
    /**
     * [processData description]
     * @return [description]
     */
    Model.prototype.processData = function () {
        var _this = this;
        // Set up node data
        this.nodes.forEach(function (node, i) {
            node.index = i;
            node.count = 0;
            /* Numeric Conversion */
            node.familyBefore = +node.familyBefore;
            node.familyAfter = +node.familyAfter;
            node.individualBefore = +node.individualBefore;
            node.individualAfter = +node.individualAfter;
            /* matrix used for edge attributes, otherwise should we hide */
            _this.matrix[i] = d3.range(_this.nodes.length).map(function (j) { return { x: j, y: i, z: 0 }; });
        });
        // Convert links to matrix; count character occurrences.
        this.edges.forEach(function (link) {
            /* could be used for varying edge types */
            //this.matrix[link.source][link.target].z += link.value;
            //this.matrix[link.target][link.source].z += link.value;
            //matrix[link.source][link.source].z += link.value;
            //matrix[link.target][link.target].z += link.value;
            _this.matrix[link.source].count += link.value;
            _this.matrix[link.target].count += link.value;
        });
    };
    Model.prototype.getOrder = function () {
        return this.order;
    };
    /**
     * Returns the node data.
     * @return Node data in JSON Array
     */
    Model.prototype.getNodes = function () {
        return this.nodes;
    };
    /**
     * Returns the edge data.
     * @return Edge data in JSON Array
     */
    Model.prototype.getEdges = function () {
        return this.edges;
    };
    return Model;
}());
// Work on importing class file
var View = /** @class */ (function () {
    function View(controller) {
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
    View.prototype.loadData = function (nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.hideLoading();
        console.log('view data', nodes, edges);
    };
    /**
     * Changes the current view to be a loading screen.
     * @return None
     */
    View.prototype.renderLoading = function () {
        d3.select('#overlay')
            .style('opacity', 0)
            .style('display', 'block')
            .transition()
            .duration(1000)
            .style('opacity', 1);
    };
    /**
     * Changes the current view to hide the loading screen
     * @return None
     */
    View.prototype.hideLoading = function () {
        if (d3.select('#overlay').attr('display') != "none") {
            d3.select('#overlay')
                .transition()
                .duration(1000)
                .style('opacity', 0)
                .delay(1000)
                .style('display', 'none');
        }
    };
    return View;
}());
// Work on importing class file
var Controller = /** @class */ (function () {
    function Controller() {
        this.view = new View(this); // initalize view,
        this.model = new Model(this); // start reading in data
    }
    /**
     * Updates the data
     * @return [description]
     */
    Controller.prototype.updateData = function (nodes, edges) {
        this.view.loadData(nodes, edges);
    };
    return Controller;
}());
var control = new Controller();
