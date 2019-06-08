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
            console.log(_this.order);
            _this.controller.updateData(_this.nodes, _this.edges, _this.matrix);
        });
    }
    /**
     *   Determines the order of the current nodes
     * @param  type A string corresponding to the attribute name to sort by.
     * @return      A numerical range in corrected order.
     */
    Model.prototype.changeOrder = function (type) {
        var _this = this;
        var order;
        if (type == 'name') {
            order = d3.range(this.nodes.length).sort(function (a, b) { return d3.ascending(_this.nodes[a].name, _this.nodes[b].name); });
        }
        else {
            order = d3.range(this.nodes.length).sort(function (a, b) { return _this.nodes[b][type] - _this.nodes[a][type]; });
        }
        return order;
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
        this.initalizeEdges();
    }
    /**
     * Takes in the data, hides the loading screen, and
     * initalizes visualization.
     * @param  data [description]
     * @return      [description]
     */
    View.prototype.loadData = function (nodes, edges, matrix) {
        this.nodes = nodes;
        this.edges = edges;
        this.matrix = matrix;
        this.hideLoading();
        console.log('view data', nodes, edges, matrix);
        this.renderEdges();
    };
    /**
     * Initalizes the edges view, renders SVG
     * @return None
     */
    View.prototype.initalizeEdges = function () {
        // Set up attributes
        this.edgeSVGMargin = { top: 90, right: 0, bottom: 10, left: 90 };
        this.edgeSVGWidth = 750;
        this.edgeSVGHeight = 750;
        // append SVG
        this.edgeSVG = d3.select("body").append("svg")
            .attr("width", this.edgeSVGWidth + this.edgeSVGMargin.left + this.edgeSVGMargin.right)
            .attr("height", this.edgeSVGHeight + this.edgeSVGMargin.top + this.edgeSVGMargin.bottom)
            //.style("margin-right", - this.margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + this.edgeSVGMargin.left + "," + this.edgeSVGMargin.top + ")");
    };
    View.prototype.renderEdges = function () {
        var _this = this;
        // Set up scales
        this.xScale = d3.scaleBand().range([0, this.edgeSVGWidth]);
        this.edgeValueScale = d3.scaleLinear().domain([0, 4]).clamp(true);
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.orders = this.controller.getOrder();
        console.log(this.orders);
        this.xScale.domain(this.orders);
        this.edgeSVG.append("rect")
            .attr("class", "background")
            .attr("width", this.edgeSVGWidth)
            .attr("height", this.edgeSVGHeight);
        var row = this.edgeSVG.selectAll(".row")
            .data(this.matrix)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) { return "translate(0," + _this.xScale(i) + ")"; })
            .each(rowSelect);
        row.append("line")
            .attr("x2", this.edgeSVGWidth);
        row.append("text")
            .attr("x", -6)
            .attr("y", this.xScale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function (d, i) { return _this.nodes[i].abbr; });
        var column = this.edgeSVG.selectAll(".column")
            .data(this.matrix)
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function (d, i) { return "translate(" + _this.xScale(i) + ")rotate(-90)"; });
        column.append("line")
            .attr("x1", -this.edgeSVGWidth);
        column.append("text")
            .attr("x", 6)
            .attr("y", this.xScale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .text(function (d, i) { return _this.nodes[i].abbr; });
        function rowSelect(row) {
            var _this = this;
            var cell = d3.select(this).selectAll(".cell")
                .data(row.filter(function (d) { return d.z; }))
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function (d) { return _this.xScale(d.x); })
                .attr("width", this.xScale.bandwidth())
                .attr("height", this.xScale.bandwidth())
                .style("fill-opacity", function (d) { return _this.edgeValueScale(d.z); })
                .style("fill", function (d) { return _this.nodes[d.x].group == _this.nodes[d.y].group ? _this.colorScale(_this.nodes[d.x].group) : null; })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        }
        function mouseover(p) {
            d3.selectAll(".row text").classed("active", function (d, i) { return i == p.y; });
            d3.selectAll(".column text").classed("active", function (d, i) { return i == p.x; });
        }
        function mouseout() {
            d3.selectAll("text").classed("active", false);
        }
        /* Changes order */
        /*d3.select("#order").on("change", function() {
          clearTimeout(timeout);
          order(this.value);
        });
    
        function order(value) {
          x.domain(orders[value]);
          var t = svg.transition().duration(2500);
          t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
            .delay(function(d) { return x(d.x) * 4; })
            .attr("x", function(d) { return x(d.x); });
          t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
        }
        var timeout = setTimeout(function() {
          order("group");
          d3.select("#order").property("selectedIndex", 2).node().focus();
        }, 5000);
        */
    };
    View.prototype.renderAttributes = function () {
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
     * Passes the processed edge and node data to the view.
     * @return None
     */
    Controller.prototype.updateData = function (nodes, edges, matrix) {
        this.view.loadData(nodes, edges, matrix);
    };
    /**
     * Obtains the order from the model and returns it to the view.
     * @return [description]
     */
    Controller.prototype.getOrder = function () {
        return this.model.getOrder();
    };
    return Controller;
}());
var control = new Controller();
