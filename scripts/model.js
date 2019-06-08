//import * as d3 from 'd3';
var Model = /** @class */ (function () {
    function Model() {
        var _this = this;
        d3.json("data.json").then(function (data) {
          console.log(data);
            _this.matrix = [];
            _this.nodes = data.nodes;
            _this.edges = data.links;
            // Set up node data
            _this.nodes.forEach(function (node, i) {
                node.index = i;
                node.count = 0;
                /* Numeric Conversion */
                node.familyBefore = +node.familyBefore;
                node.familyAfter = +node.familyAfter;
                node.individualBefore = +node.individualBefore;
                node.individualAfter = +node.individualAfter;
                /* */
                _this.matrix[i] = d3.range(_this.nodes.length).map(function (j) { return { x: j, y: i, z: 0 }; });
            });
            // Convert links to matrix; count character occurrences.
            _this.edges.forEach(function (link) {
                /* could be used for varying edge types */
                //this.matrix[link.source][link.target].z += link.value;
                //this.matrix[link.target][link.source].z += link.value;
                //matrix[link.source][link.source].z += link.value;
                //matrix[link.target][link.target].z += link.value;
                _this.matrix[link.source].count += link.value;
                _this.matrix[link.target].count += link.value;
            });
            _this.order = _this.changeOrder('name');
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
var greeter = new Model();
