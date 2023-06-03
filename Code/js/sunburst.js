function sunburst() {
  // partition
  partition = (data) =>
    d3.partition().size([2 * Math.PI, radius * radius])(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );

  // color scheme
  color = d3.scaleOrdinal(d3.schemeTableau10);

  width = 620;
  radius = width / 2;

  // create arc
  arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1);

  // create arc with mouse events
  mousearc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius(radius);

  d3.json("../../Data/Chart_2/visa2021.json").then(function (data) {
    const root = partition(data);
    const svg = d3.select("#sunburst").append("svg");

    // nodes of the svg
    const element = svg.node();
    element.value = { sequence: [], percentage: 0.0 };

    svg
      .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
      .style("width", `${width}px`);

    var initLabelValue = [
      "Total overseas migrants",
      "100%",
      "of total overseas migrants",
    ];
    // labels
    const label = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "#888");

    label
      .append("tspan")
      .attr("class", "nodename")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "-1.5em")
      .attr("font-size", "1.1em")
      .text(initLabelValue[0]);

    label
      .append("tspan")
      .attr("class", "percentage")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "-0.1em")
      .attr("font-size", "1.1em")
      .text(initLabelValue[1]);

    label
      .append("tspan")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "1.2em")
      .attr("font-size", "1.1em")
      .text(initLabelValue[2]);

    // create path
    const path = svg
      .append("g")
      .selectAll("path")
      .data(
        root.descendants().filter((d) => {
          // filter out small nodes
          return d.depth && d.x1 - d.x0 > 0.001;
        })
      )
      .join("path")
      .attr("fill", (d) => {
        if (d.depth === 1) {
          // for top-level nodes, assign a color from the color scheme directly
          d.data.color = color(d.data.name);
        } else {
          // for leaves, assign a color based on the parent node's color
          d.data.color = d3.interpolateRgb(d.parent.data.color, "white")(0.2);
        }
        return d.data.color;
      })
      .attr("d", arc);

    // handle events
    svg
      .append("g")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      // mouse leave
      .on("mouseleave", () => {
        path.attr("fill-opacity", 1);
        // update view value
        element.value = { sequence: [], percentage: 0.0 };
        element.dispatchEvent(new CustomEvent("input"));

        // return labels to initial vlaues
        label.select(".percentage").text(initLabelValue[1]);

        label.select(".nodename").text(initLabelValue[0]);
      })
      .selectAll("path")
      .data(
        root.descendants().filter((d) => {
          // filter out small nodes
          return d.depth && d.x1 - d.x0 > 0.001;
        })
      )
      .join("path")
      .attr("d", mousearc)
      .on("mouseenter", (event, d) => {
        // get ancestors of the current segment eliminating root
        const sequence = d.ancestors().reverse().slice(1);
        // highlight ancestors
        path.attr("fill-opacity", (node) =>
          sequence.indexOf(node) >= 0 ? 1.0 : 0.3
        );
        const percentage = ((100 * d.value) / root.value).toPrecision(3);
        // show labels
        label
          .style("visibility", null)
          .select(".percentage")
          .text(d.value + " migrants (" + percentage + "%)");

        label.select(".nodename").text(d.data.name);
        // update value
        element.value = { sequence, percentage };
        element.dispatchEvent(new CustomEvent("input"));

      });
  });
}

sunburst();
