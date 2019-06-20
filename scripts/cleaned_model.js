//import * as d3 from 'd3';
var Model = /** @class */ (function () {
    function Model(controller) {
        var _this = this;
        d3.json("scripts/Eurovis2019Network.json").then(function (network) {
            d3.json("scripts/Eurovis2019Tweets.json").then(function (tweets) {
                var data = _this.grabTwitterData(network, tweets);
                _this.matrix = [];
                _this.nodes = data.nodes;
                _this.idMap = {};
                _this.nodes.forEach(function (node, index) {
                    console.log(index);
                    node.index = index;
                    _this.idMap[node.id] = index;
                });
                console.log(_this.nodes);
                _this.nodes = _this.nodes.sort(function (a, b) { return a.screen_name.localeCompare(b.screen_name); });
                _this.edges = data.links;
                console.log(_this.edges);
                _this.controller = controller;
                _this.processData();
                _this.order = _this.changeOrder('name');
                console.log(_this.order, d3.range(_this.nodes.length), "Data");
                _this.controller.updateData(_this.nodes, _this.edges, _this.matrix);
            });
        });
    }
    Model.prototype.grabTwitterData = function (graph, tweets) {
        var toRemove = [];
        console.log(graph, tweets);
        var newGraph = { 'nodes': [], 'links': [] };
        //create edges from tweets.
        tweets = tweets.tweets;
        tweets.map(function (tweet) {
            //if a tweet mentions a person, create a 'mentions' edge between the tweeter, and the mentioned person.
            tweet.entities.user_mentions.map(function (mention) {
                var source = graph.nodes.find(function (n) { return n.id === tweet.user.id; });
                var target = graph.nodes.find(function (n) { return n.id === mention.id; });
                if (source && target) {
                    var link = { 'source': source.id, 'target': target.id, 'type': 'mentions' };
                    newGraph.links.push(link);
                    if (!newGraph.nodes.find(function (n) { return n === source; })) {
                        newGraph.nodes.push(source);
                    }
                    if (!newGraph.nodes.find(function (n) { return n === target; })) {
                        newGraph.nodes.push(target);
                    }
                }
                // console.log('link',link)
            });
            //if a tweet retweets another retweet, create a 'retweeted' edge between the re-tweeter and the original tweeter.
            if (tweet.retweeted_status) {
                var source_1 = graph.nodes.find(function (n) { return n.id === tweet.user.id; });
                var target_1 = graph.nodes.find(function (n) { return n.id === tweet.retweeted_status.user.id; });
                if (source_1 && target_1) {
                    var link = { 'source': source_1.id, 'target': target_1.id, 'type': 'retweet' };
                    newGraph.links.push(link);
                    if (!newGraph.nodes.find(function (n) { return n === source_1; })) {
                        newGraph.nodes.push(source_1);
                    }
                    if (!newGraph.nodes.find(function (n) { return n === target_1; })) {
                        newGraph.nodes.push(target_1);
                    }
                }
            }
            //if a tweet is a reply to another tweet, create an edge between the original tweeter and the author of the current tweet.
            if (tweet.in_reply_to_user_id_str) {
                var source_2 = graph.nodes.find(function (n) { return n.id === tweet.user.id; });
                var target_2 = graph.nodes.find(function (n) { return n.id === tweet.in_reply_to_user_id; });
                if (source_2 && target_2) {
                    var link = { 'source': source_2.id, 'target': target_2.id, 'type': 'reply' };
                    newGraph.links.push(link);
                    if (!newGraph.nodes.find(function (n) { return n === source_2; })) {
                        newGraph.nodes.push(source_2);
                    }
                    if (!newGraph.nodes.find(function (n) { return n === target_2; })) {
                        newGraph.nodes.push(target_2);
                    }
                }
            }
        });
        return newGraph;
    };
    /**
     *   Determines the order of the current nodes
     * @param  type A string corresponding to the attribute name to sort by.
     * @return      A numerical range in corrected order.
     */
    Model.prototype.changeOrder = function (type) {
        var _this = this;
        var order;
        if (type == 'name') {
            order = d3.range(this.nodes.length).sort(function (a, b) { return d3.ascending(_this.nodes[a].screen_name, _this.nodes[b].screen_name); });
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
        // generate a hashmap of id's?
        // Set up node data
        this.nodes.forEach(function (node, i) {
            node.index = i;
            node.count = 0;
            /* Numeric Conversion */
            node.followers_count = +node.followers_count;
            node.query_tweet_count = +node.query_tweet_count;
            node.friends_count = +node.friends_count;
            node.statuses_count = +node.statuses_count;
            node.favourites_count = +node.favourites_count;
            node.count_followers_in_query = +node.count_followers_in_query;
            node.id = +node.id;
            /* matrix used for edge attributes, otherwise should we hide */
            _this.matrix[i] = d3.range(_this.nodes.length).map(function (j) { return { x: j, y: i, z: 0 }; });
        });
        console.log(this.matrix);
        // Convert links to matrix; count character occurrences.
        this.edges.forEach(function (link) {
            console.log(link);
            /* could be used for varying edge types */
            _this.matrix[_this.idMap[link.source]][_this.idMap[link.target]].z += 1;
            //this.matrix[this.idMap[link.target]][this.idMap[link.source]].z += 1;
            //matrix[link.source][link.source].z += link.value;
            //matrix[link.target][link.target].z += link.value;
            _this.matrix[_this.idMap[link.source]].count += 1;
            //this.matrix[this.idMap[link.target]].count += 1;
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
    /*
    private edgeSVGWidth: number;
    private edgeSVGHeight: number;
    private edgeSVGMargin: any;
    private edgeSVG: any;
  
    private xScale: d3.ScaleBand<string>;
    private edgeValueScale: d3.ScaleLinear<number,number>;
    private colorScale: d3.ScaleOrdinal<any,any>;
    private orders: any;
  */
    function View(controller) {
        this.controller = controller;
        // set up load
        this.renderLoading();
        // Add scroll handler to containers
        d3.selectAll('.container').on('mousewheel', scrollHandler);
        function scrollHandler() {
            // determine which didn't scroll and update it's scroll.
            var scrollHeight = d3.select(this).node().scrollTop;
            if (d3.select(this).attr('id') == "attributes") {
                // scroll topology
                var element = d3.select('#topology').node();
                element.scrollTop = scrollHeight;
            }
            else {
                // scroll attributes
                var element = d3.select('#attributes').node();
                element.scrollTop = scrollHeight;
            }
        }
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
        this.renderView();
        //this.renderEdges();
    };
    /**
     * Initializes the adjacency matrix and row views with placeholder visualizations
     * @return [description]
     */
    View.prototype.renderView = function () {
        this.viewWidth = 1000;
        //this.viewHeight =
        this.margins = { left: 45, top: 55, right: 10, bottom: 10 };
        this.initalizeEdges();
        this.initalizeAttributes();
        var that = this;
        d3.select("#order").on("change", function () {
            that.sort(this.value);
        });
    };
    /**
     * [highlightNodes description]
     * @param  name         [description]
     * @param  verticleNode [description]
     * @return              [description]
     */
    View.prototype.highlightNodes = function (name, verticleNode) {
        console.log(name);
        var selector = verticleNode ? ".highlightRow" : ".highlightRow";
        d3.selectAll(selector)
            .filter(function (d) { return d.name == name; })
            .classed('hovered', true);
    };
    /**
     * Initalizes the edges view, renders SVG
     * @return None
     */
    View.prototype.initalizeEdges = function () {
        var _this = this;
        this.edgeWidth = 600 - this.margins.left - this.margins.right;
        this.edgeHeight = 600 - this.margins.top - this.margins.bottom;
        // Float edges so put edges and attr on same place
        d3.select('#topology').style('float', 'left');
        this.edges = d3.select('#topology').append("svg")
            .attr("width", this.edgeWidth + this.margins.left + this.margins.right)
            .attr("height", this.edgeHeight + this.margins.top + this.margins.bottom)
            .append("g")
            .attr('id', 'edgeMargin')
            .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
        this.verticalScale = d3.scaleBand().range([0, this.edgeWidth]).domain(d3.range(this.nodes.length));
        // Draw Highlight Rows
        this.edges.selectAll('.highlightRow')
            .data(this.nodes)
            .enter()
            .append('rect')
            .classed('highlightRow', true)
            .attr('x', 0)
            .attr('y', function (d, i) { return _this.verticalScale(i); })
            .attr('width', this.edgeWidth + this.margins.right)
            .attr('height', this.verticalScale.bandwidth())
            .attr('fill', "#fff")
            .on('mouseover', function () {
            d3.select(this)
                .classed('hovered', true);
        })
            .on('mouseout', function () {
            d3.select(this)
                .classed('hovered', false);
        });
        // Draw each row (translating the y coordinate)
        this.edgeRows = this.edges.selectAll(".row")
            .data(this.matrix)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
            return "translate(0," + _this.verticalScale(i) + ")";
        });
        var squares = this.edgeRows.selectAll(".cell")
            .data(function (d) { console.log(d); return d.filter(function (item) { return item.z > 0; }); })
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function (d) { return _this.verticalScale(d.x); })
            .attr("width", this.verticalScale.bandwidth())
            .attr("height", this.verticalScale.bandwidth())
            /*.style("fill-opacity", d => opacityScale(d.z)).style("fill", d => {
              return nodes[d.x].group == nodes[d.y].group ? colorScale(nodes[d.x].group) : "grey";
            }) */
            .on("mouseover", mouseoverCell)
            .on("mouseout", mouseoutCell);
        var that = this;
        function mouseoverCell(p) {
            console.log(p);
            d3.event.preventDefault();
            // Highlight attribute rows on hovered edge
            var rowIndex, colIndex;
            d3.selectAll(".row text").classed("active", function (d, i) {
                if (i == p.y) {
                    rowIndex = i; //+ that.nodes.length;
                }
                return i == p.y;
            });
            d3.selectAll(".column text").classed("active", function (d, i) {
                if (i == p.x) {
                    colIndex = i; //+ that.nodes.length;
                }
                return i == p.x;
            });
            // determine the updated
            console.log(that.order, that.order[rowIndex], rowIndex, colIndex);
            rowIndex = that.order[rowIndex] + that.nodes.length;
            colIndex = that.order[colIndex] + that.nodes.length;
            d3.selectAll('.highlightRow')
                .filter(function (d, i) { return i === rowIndex || i == colIndex || i === rowIndex - that.nodes.length; })
                .classed('hovered', true);
            that.tooltip.transition().duration(200).style("opacity", .9);
            var matrix = this.getScreenCTM()
                .translate(+this.getAttribute("x"), +this.getAttribute("y"));
            that.tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            that.tooltip.html("DATA")
                .style("left", (window.pageXOffset + matrix.e - 20) + "px")
                .style("top", (window.pageYOffset + matrix.f - 20) + "px");
        }
        function mouseoutCell() {
            d3.selectAll("text").classed("active", false);
            that.tooltip.transition().duration(250).style("opacity", 0);
            d3.selectAll('.highlightRow')
                .classed('hovered', false);
        }
        this.order = this.controller.getOrder();
        console.log("Here", this.order);
        this.edgeColumns = this.edges.selectAll(".column")
            .data(this.matrix)
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function (d, i) {
            return "translate(" + _this.verticalScale(i) + ")rotate(-90)";
        });
        this.edgeRows.append("text")
            .attr("class", "label")
            .attr("x", -5)
            .attr("y", this.verticalScale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .style("font-size", 8 + "px")
            .text(function (d, i) { return _this.nodes[i].abbr; });
        this.edgeColumns.append("text")
            .attr("class", "label")
            .attr("y", 100)
            .attr("y", this.verticalScale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .style("font-size", 8 + "px")
            .text(function (d, i) { return _this.nodes[i].abbr; });
        this.edgeRows.append("line")
            .attr("x2", this.edgeWidth + this.margins.right);
        this.edgeColumns.append("line")
            .attr("x1", -this.edgeWidth);
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    };
    /**
     * [sort description]
     * @return [description]
     */
    View.prototype.sort = function (order) {
        var _this = this;
        this.order = this.controller.changeOrder(order);
        console.log(this.order);
        this.verticalScale.domain(this.order);
        console.log(d3.selectAll(".row"));
        d3.selectAll(".row")
            .transition()
            .duration(500)
            .delay(function (d, i) { return _this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(0," + _this.verticalScale(i) + ")"; })
            .selectAll(".cell")
            .delay(function (d) { console.log(d); return _this.verticalScale(d.x) * 4; })
            .attr("x", function (d) { return _this.verticalScale(d.x); });
        console.log(this.attributes, this.attributeRows);
        this.attributeRows
            .transition()
            .duration(500)
            .delay(function (d, i) { return _this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(0," + _this.verticalScale(i) + ")"; });
        /*d3.selectAll('.highlightRow')
          .transition()
          .duration(500)
          .delay((d, i) => { return this.verticalScale(i) * 4; })
          .attr('fill',(d,i)=>{console.log(d);return i%2 == 0 ? "#aaa" : "#bbb"})*/
        var t = this.edges.transition().duration(500);
        t.selectAll(".column")
            .delay(function (d, i) { return _this.verticalScale(i) * 4; })
            .attr("transform", function (d, i) { return "translate(" + _this.verticalScale(i) + ")rotate(-90)"; });
    };
    /**
     * [initalizeAttributes description]
     * @return [description]
     */
    View.prototype.initalizeAttributes = function () {
        var _this = this;
        this.attributeWidth = 375 - this.margins.left - this.margins.right;
        this.attributeHeight = 600 - this.margins.top - this.margins.bottom;
        this.attributes = d3.select('#attributes').append("svg")
            .attr("width", this.attributeWidth + this.margins.left + this.margins.right)
            .attr("height", this.attributeHeight + this.margins.top + this.margins.bottom)
            .append("g")
            .attr('id', 'edgeMargin')
            .attr("transform", "translate(" + 0 + "," + this.margins.top + ")");
        // add zebras and highlight rows
        this.attributes.selectAll('.highlightRow')
            .data(this.nodes)
            .enter()
            .append('rect')
            .classed('highlightRow', true)
            .attr('x', 0)
            .attr('y', function (d, i) { return _this.verticalScale(i); })
            .attr('width', this.attributeWidth)
            .attr('height', this.verticalScale.bandwidth())
            .attr('fill', function (d, i) { return i % 2 == 0 ? "#fff" : "#eee"; })
            .on('mouseover', function () {
            d3.select(this)
                .classed('hovered', true);
        })
            .on('mouseout', function () {
            d3.select(this)
                .classed('hovered', false);
        });
        var barMargin = { top: 2, bottom: 1, left: 5, right: 5 };
        var barHeight = 10 - barMargin.top - barMargin.bottom;
        // Draw each row (translating the y coordinate)
        this.attributeRows = this.attributes.selectAll(".row")
            .data(this.nodes)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
            return "translate(0," + _this.verticalScale(i) + ")";
        });
        this.attributeRows.append("line")
            .attr("x1", 0)
            .attr("x2", this.attributeWidth)
            .attr('stroke', '2px')
            .attr('stroke-opacity', 0.3);
        var columns = [
            "followers_count",
            "query_tweet_count",
            "friends_count",
            "statuses_count",
            "listed_count",
            "favourites_count",
            "count_followers_in_query",
            "screen_name",
            "influential",
            "original"
        ];
        var formatCurrency = d3.format("$,.0f"), formatNumber = d3.format(",.0f");
        this.barWidthScale = d3.scaleLinear()
            .domain([0, 1400])
            .range([0, 140]);
        this.columnScale = d3.scaleOrdinal().domain(columns);
        // Calculate Column Scale
        var columnRange = [];
        var xRange = 0;
        columns.forEach(function (c) {
            columnRange.push(xRange);
            var value = _this.barWidthScale(d3.max(_this.nodes, function (d) { return d[c]; }));
            if (value < 100) {
                value = 100;
            }
            xRange += value;
        });
        console.log(columnRange);
        this.columnScale.range(columnRange);
        /* Create data columns data */
        columns.forEach(function (c) {
            console.log(c);
            var columnPosition = _this.columnScale(c);
            console.log(columnPosition);
            _this.attributeRows
                .append("rect")
                .attr("class", "glyph")
                .attr('height', barHeight)
                .attr('width', 10) // width changed later on transition
                .attr('x', columnPosition + barMargin.left)
                .attr('y', barMargin.top) // as y is set by translate
                .attr('fill', '#8B8B8B')
                .transition()
                .duration(2000)
                .attr('width', function (d, i) { console.log(d, _this.barWidthScale(d[c])); return _this.barWidthScale(d[c]) - barMargin.right - barMargin.left; });
            _this.attributeRows
                .append("div")
                .attr("class", "glyphLabel")
                .text(function (d, i) {
                return (i ? formatNumber : formatCurrency)(d);
            });
        });
        // Add Verticle Dividers
        this.attributes.selectAll('.column')
            .data(columns)
            .enter()
            .append('line')
            .style('stroke', '1px')
            .attr('x1', function (d) { return _this.columnScale(d); })
            .attr("y1", -20)
            .attr('x2', function (d) { return _this.columnScale(d); })
            .attr("y2", this.attributeHeight + this.margins.bottom)
            .attr('stroke-opacity', 0.4);
        // Add headers
        var columnHeaders = this.attributes.append('g')
            .classed('column-headers', true);
        this.columnNames = {
            "familyBefore": "Family (B)",
            "familyAfter": "Family (A)",
            "individualBefore": "Individual (B)",
            "individualAfter": "Individual (A)"
        };
        console.log(columnHeaders);
        columnHeaders.selectAll('.header')
            .data(columns)
            .enter()
            .append('text')
            .classed('header', true)
            .attr('y', -30)
            .attr('x', function (d) { return _this.columnScale(d) + barMargin.left; })
            .style('font-size', '16px')
            .attr('text-anchor', 'left')
            .text(function (d, i) {
            console.log(d);
            return _this.columnNames[d];
        });
        //
        columnHeaders.selectAll('.legend');
        console.log(this.attributeRows);
        // Append g's for table headers
        // For any data row, add
        /*.on("click", clicked)
        .select(".g-table-column")
        .classed("g-table-column-" + (sortOrder === d3.ascending ? "ascending" : "descending"), function(d) {
          return d === sortKey;
        });*/
        function type(d) {
            d.familyBefore = +d.familyBefore;
            d.familyAfter = +d.familyAfter;
            d.individualBefore = +d.individualBefore;
            d.individualAfter = +d.individualAfter;
            return d;
        }
    };
    View.prototype.clicked = function (key) {
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
    /**
     * Obtains the order from the model and returns it to the view.
     * @return [description]
     */
    Controller.prototype.changeOrder = function (order) {
        return this.model.changeOrder(order);
    };
    return Controller;
}());
var control = new Controller();
//window.controller = control;
