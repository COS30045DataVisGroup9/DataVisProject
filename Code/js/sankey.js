function sankey() {
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  // create svg
  var svg = d3
    .select("#sankey")
    .append("svg")
    .attr("width", 900)
    .attr("height", 500);

  var g = svg.append("g").attr("transform", "translate(20, 50)");

  // sankey properties
  var sankey = d3.sankey().nodeWidth(36).nodePadding(40).size([800, 400]);

  // get sankey json data
  d3.json("../../DataVisProject/Data/Chart_3/sankey.json").then(function (
    data
  ) {
    graph = sankey(data);
    // create link
    var link = g
      .append("g")
      .selectAll("link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .style("fill", function (d) {
        return (d.color = color(d.source.name.replace(/ .*/, "")));
      })
      .style("opacity", 0.1)
      .attr("stroke-width", function (d) {
        return d.width;
      });

    // create link tooltip
    link.append("title").text(function (d) {
      return d.value;
    });

    // create node
    var node = g
      .append("g")
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .subject(function (d) {
            return d;
          })
          .on("start", function () {
            this.parentNode.appendChild(this);
          })
          .on("drag", movenode)
      );

    // create the figures for the nodes
    node
      .append("rect")
      .attr("x", function (d) {
        console.log(d)
        return d.x0;
      })
      .attr("y", function (d) {
        return d.y0;
      })
      .attr("height", function (d) {
        d.rectHeight = d.y1 - d.y0;
        return d.rectHeight;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function (d) {
        return (d.color = color(d.name.replace(/ .*/, "")));
      })
      .append("title")
      .text(function (d) {
        return d.name;
      });

    // create node titles
    node
      .append("text")
      .attr("x", function (d) {
        return d.x0 - 6;
      })
      .attr("y", function (d) {
        return (d.y1 + d.y0) / 2;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(function (d) {
        return d.name;
      })
      .filter(function (d) {
        return d.x0 < width / 2;
      })
      .attr("x", function (d) {
        return d.x1 + 6;
      })
      .attr("text-anchor", "start");

    // moving nodes
    function movenode(d) {
      d3.select(this)
        .select("rect")
        .attr("y", function (m) {
          m.y0 = Math.max(0, Math.min(m.y0 + d.dy, 500 - (m.y1 - m.y0)));
          m.y1 = m.y0 + m.rectHeight;

          return m.y0;
        });

      d3.select(this)
        .select("text")
        .attr("y", function (m) {
          return (m.y0 + m.y1) / 2;
        });

      sankey.update(graph);
      link.attr("d", d3.sankeyLinkHorizontal());
    }
  });
}

sankey();
