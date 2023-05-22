function map() {
  // create projection
  const projection = d3.geoMercator().scale(100);

  // create path
  const path = d3.geoPath().projection(projection);

  // color scheme
  var color = d3
    .scaleQuantize()
    .domain([0, 10000])
    .range(["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"]);

  // set up map svg
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", 900)
    .attr("height", 600)
    .attr("fill", "grey");

  // appending the color legend
  svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(30,300)");

  // appending labels for color legend
  svg
    .append("text")
    .attr("y", 260)
    .attr("x", 50)
    .text("Immigration flow")
    .style("font-family", "Arial")
    .style("fill", "black");

  // color legend
  const legend = d3
    .legendColor()
    .shapeWidth(30)
    .cells([120, 125, 158, 175, 187, 205, 223, 239])
    .orient("vertical")
    .scale(color);

  svg
    .select(".legend")
    .call(legend)
    .style("font-family", "Arial")
    .style("fill", "black")
    .style("font-size", 13);

  var g = svg.append("g").attr("transform", `translate(0,${20})`);

  d3.csv("../../DataVisProject/Data/Chart_2/migration_flow.csv").then(function (
    data
  ) {
    // read json file and bind the data into the path
    d3.json("../../DataVisProject/Data/Chart_2/countries.geo.json").then(
      function (json) {
        // create year-slider
        const slider = document.getElementById("year-slider");
        slider.addEventListener("input", function () {
          const selectedYear = parseInt(this.value);
          // update map in the selected year
          updateMap(selectedYear);
        });

        // show the map
        g.selectAll("path")
          .data(json.features) // take the data from json file
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", function (d) {
            return "country";
          })
          .style("stroke", "black") // show the border of countries
          .style("stroke-width", 0.5)
          // event
          .on("mouseover", function (event, d) {
            // highlight countries
            d3.selectAll(".country")
              .transition()
              .duration(200)
              .style("opacity", 0.4); // fade countries

            d3.select(this) // highlight selected country
              .transition()
              .duration(200)
              .style("opacity", 1);
            d3.select(this)
              .style("opacity", 1)
              .append("title")
              .text(
                "Country Name: " +
                  d.properties.name +
                  "\nImmgiration flow: " +
                  data.find((e) => d.id == e.CODE)[slider.value]
              );
          }) // mouse over trigger
          .on("mouseleave", function (event, d) {
            d3.selectAll(".country")
              .transition()
              .duration(200)
              .style("opacity", 1); // unfade countries
          }); // mouse out trigger
        g.attr("transform", `translate(0,${100})`);

        // initialise the map at the initial year
        updateMap(parseInt(slider.value));

        // update the countries' color when update the slider
        function updateMap(selectedYear) {
          svg.selectAll("path").style("fill", function (d) {
            country = data.find((e) => d.id == e.CODE);
            // change the label
            document.getElementById("year-slider-label").innerHTML =
              selectedYear;
            if (!country) {
              return color(0);
            }
            // return new color
            return color(country[selectedYear]);
          });
        }
      }
    );
  });
}

map();
