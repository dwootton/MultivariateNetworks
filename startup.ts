import * as d3 from 'd3';

var margin = {top: 90, right: 0, bottom: 10, left: 90},
    width = 750,
    height = 750;
var x = d3.scaleBand<number>().range([0, width]),
    z = d3.scaleLinear().domain([0, 4]).clamp(true),
    c = d3.scaleOrdinal(d3.schemeCategory10);
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-right", -margin.left + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    /*
      nodes:{index: number,count:number},
      links:{source:{}}}*/
d3.json("data.json").then(function(data : any ) {
  var matrix = [],
      nodes = data.nodes,
      n = nodes.length;
  console.log(data);
  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    node.count = 0;
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
  });
  // Convert links to matrix; count character occurrences.
  data.links.forEach(function(link) {
    matrix[link.source][link.target].z += link.value;
    matrix[link.target][link.source].z += link.value;
    //matrix[link.source][link.source].z += link.value;
    //matrix[link.target][link.target].z += link.value;
    nodes[link.source].count += link.value;
    nodes[link.target].count += link.value;
  });
  // Precompute the orders.
  var orders : any = {
    name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
    count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
    group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
  };

  // The default sort order.
  x.domain(orders.name);
  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);
  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(rowSelect);
  row.append("line")
      .attr("x2", width);
  row.append("text")
      .attr("x", -6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].abbr; });
  var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
  column.append("line")
      .attr("x1", -width);
  column.append("text")
      .attr("x", 6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].abbr; });
  function rowSelect(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d: any) { return x(d.x); })
        .attr("width", x.bandwidth())
        .attr("height", x.bandwidth())
        .style("fill-opacity", function(d: any) { return z(d.z); })
        .style("fill", function(d: any) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
  }

  function mouseover(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
  }

  function mouseout() {
    d3.selectAll("text").classed("active", false);
  }

  d3.select("#order").on("change", function() {
    clearTimeout(timeout);
    order("name");//d3.select("#order").node().value);
  });

  function order(value) {
    x.domain(orders[value]);
    var t = svg.transition().duration(2500);
    t.selectAll(".row")
        .delay(function(d: any, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .selectAll(".cell")
        .delay(function(d: any) { return x(d.x.toString()) * 4; })
        .attr("x", function(d: any) { return x(d.x); });
    t.selectAll(".column")
        .delay(function(d: any, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
  }

  var timeout = setTimeout(function() {
    order("group");
    (<HTMLElement> d3.select("#order").property("selectedIndex", 2).node()).focus();
  }, 5000);
});
