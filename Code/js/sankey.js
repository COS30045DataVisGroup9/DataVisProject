function sankey() {
  var w = 1450;
  var h = 800;
  var padding = 30;

  // import the color schemes
  const schemeCategory10 = d3.schemeTableau10;
  const schemeTableau10 = d3.schemeAccent;

  // combine the colors into a new array
  const combinedColors = schemeCategory10.concat(schemeTableau10);
  var color = d3
    .scaleOrdinal(d3.schemeTableau10)
    .domain(d3.range(combinedColors.length))
    .range(combinedColors);

  // generate the gradient id for the sankey link
  const createGradientId = (link) => {
    return `gradient-${link.source.node}-${link.target.node}`;
  };

  // create svg
  var svg = d3
    .select("#sankey")
    .append("svg")
    .attr("width", w) // set up width
    .attr("height", h) // set up height
    .attr("style", "border: 1px solid;");

  var g = svg
    .append("g")
    .attr("transform", "translate(" + padding + "," + padding + ")");

  // zoom effect
  svg.call(
    d3
      .zoom()
      .scaleExtent([1, 300])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
  );

  // sankey properties
  var sankey = d3
    .sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([w - padding * 2, h - padding * 2]);

  // get sankey json data
  d3.json("../../Data/Chart_3/sankey.json").then((data) => {
    // convert negative values to positive values
    data.links.forEach((link) => {
      link.sign = Math.sign(link.value);
      link.value = Math.abs(parseInt(link.value));
    });
    graph = sankey(data);

    // create link
    var link = g
      .append("g")
      .attr("fill", "none")
      .selectAll("link")
      .data(graph.links) // get the links data
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", (d) => (d.color = color(d.source.name)))
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => d.width)
      .on("mouseover", function (event, d) {
        const tooltipText = [
          "Country: " + d.source.name,
          "State: " + d.target.name,
          "Net Overseas Migration: " + d.value * d.sign,
        ].join("<br/>");
        ShowSankeyTooltip(event, tooltipText); // show tooltip
      })
      .on("mouseleave", function (event, d) {
        HideSankeyTooltip(); // hide the sankey tooltip
      });

    // create gradient color for link
    link.each(function (d, i) {
      const gradientId = createGradientId(d);

      // create gradient
      const gradient = svg
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d.source.x1)
        .attr("x2", d.target.x0);

      // color at the source
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(d.source.name));

      // color ar the target
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color(d.target.name));

      d3.select(this)
        .attr("stroke", `url(#${gradientId})`)
        .classed("link-gradient", true);
    });

    // create node
    var node = g
      .append("g")
      .selectAll(".node")
      .data(graph.nodes) // data for nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag() // drag event
          .subject((d) => d)
          .on("start", () => this.parentNode.appendChild(this))
          .on("drag", movenode)
      );

    // create the figures for the nodes
    node
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", function (d) {
        d.rectHeight = d.y1 - d.y0;   // height of the node
        return d.y1 - d.y0;
      })
      .attr("width", sankey.nodeWidth()) // width of the node
      .style("fill", (d) => (d.color = color(d.name)))
      .attr("stroke", "#000")
      .append("title");

    // create node titles
    node
      .append("text")
      .attr("x", (d) => d.x0 - 5)
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.3em") // size of the title
      .attr("text-anchor", "end") // position the text
      .text((d) => d.name)
      .filter((d) => d.x0 < w / 2)
      .attr("x", (d) => d.x1 + 5)
      .attr("text-anchor", "start");

    // moving nodes
    function movenode(d) {
      d3.select(this)
        .select("rect")
        .attr("y", function (m) {
          m.y0 = Math.max(0, Math.min(m.y0 + d.dy, h - (m.y1 - m.y0)));
          m.y1 = m.y0 + m.rectHeight;

          return m.y0;
        });

      d3.select(this)
        .select("text")
        .attr("y", (m) => (m.y0 + m.y1) / 2);

      sankey.update(graph);
      link.attr("d", d3.sankeyLinkHorizontal());
    }
  });
}

// show the tooltip
function ShowSankeyTooltip(event, text) {
  var tooltip = d3.select("#sankey_tooltip");
  var [x, y] = d3.pointer(event);
  console.log(tooltip);
  tooltip.transition().duration(200).style("opacity", 1);
  tooltip
    .html(text)
    .style("left", x + "px")
    .style("top", y + "px");
}

// hide the tooltip
function HideSankeyTooltip() {
  var tooltip = d3.select("#sankey_tooltip");
  tooltip.transition().duration(200).style("opacity", 0);
}

sankey();
