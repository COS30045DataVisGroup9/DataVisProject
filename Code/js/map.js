function map() {
  var w = 800;
  var h = 600;

  // create projection
  const projection = d3
    .geoMercator()
    .translate([w / 2, h / 2])
    .scale(120);

  // create path
  const path = d3.geoPath().projection(projection);

  // color scheme
  const color = d3
    .scaleThreshold()
    .domain([0, 1000, 10000, 20000, 30000, 40000, 50000, 80000])
    .range([
      "#5f5f5f",
      "#d6e2e7",
      "#adc5ce",
      "#99b6c2",
      "#84a7b6",
      "#5b8a9d",
      "#477c91",
      "#326d85",
    ]);

  // set up map svg
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("style", "border: 1px solid;")
    .attr("fill", "grey");

  var g = svg.append("g").attr("transform", `translate(0,80)`);

  // appending the color legend
  svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20, 350)");

  // color legend
  const legend = d3
    .legendColor()
    .shapeWidth(30)
    .cells([-1, 0, 1000, 10000, 20000, 30000, 40000, 50000, 80000])
    // providing labels for the legend
    .labels([
      "Missing data",
      "< 1000",
      "1000 to 10000",
      "10000 to 20000",
      "20000 to 30000",
      "30000 to 40000",
      "40000 to 50000",
      "> 50000",
    ])
    .orient("vertical")
    .scale(color);

  svg
    .select(".legend")
    .call(legend)
    .style("fill", "black")
    .style("font-size", 12);

  // zoom function
  svg.call(
    d3
      .zoom()
      .scaleExtent([1, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
  );

  // inject data to the map
  d3.csv("../../Data/Chart_1/migration_flow.csv").then(function (data) {
    // read json file and bind the data into the path
    d3.json("../../Data/Chart_1/countries.geo.json").then(function (json) {
      // create year-slider
      const slider = document.getElementById("year-slider");
      slider.addEventListener("input", function () {
        // update map in the selected year
        updateMap(parseInt(this.value));
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

          // initiate tooltip title
          var tooltipTitle =
            "Country Name: " + d.properties.name + "\nImmigration flow: ";

          // check if the country exist
          var country = data.find((e) => d.id == e.CODE);
          if (country != undefined) {
            // update title
            tooltipTitle += country[slider.value];
          } else {
            tooltipTitle += "Missing data"; // title for data missing
          }

          // check if title does not exist
          if (d3.select(this).select("title").empty()) {
            d3.select(this)
              .append("title") // append new title
              .text(tooltipTitle);
          } else {
            d3.select(this)
              .select("title") // select existing title
              .text(tooltipTitle);
          }
          lineChart(d, data);
        }) // mouse over event
        .on("mouseleave", function (event, d) {
          d3.selectAll(".country")
            .transition()
            .duration(200)
            .style("opacity", 1); // unfade countries
          HideLineChart();
        }); // mouse out event

      // initialise the map at the initial year
      updateMap(parseInt(slider.value));

      // update the countries' color when update the slider
      function updateMap(selectedYear) {
        svg.selectAll("path").style("fill", function (d) {
          const country = findCountry(d, data);
          // change the label
          document.getElementById("year-slider-label").innerHTML = selectedYear;
          if (!country) {
            return color(-1);
          }
          // return new color
          return color(country[selectedYear]);
        });
      }
    });
  });
}

function lineChart(d, data) {
  // show the line chart
  ShowLineChart();

  // remove svg
  d3.selectAll("#line_graph > *").remove();

  // change the headings
  document.getElementById("line_chart_country").innerHTML = d.properties.name;

  // set up the dataset
  const country = findCountry(d, data);
  if (country) {
    // clear existing data
    document.getElementById("line_graph").innerHTML = "";
    const dataset = Object.entries(country)
      .filter(([key]) => !isNaN(key)) // filter all values that's not number
      .map(([year, value]) => [year, parseInt(value)]); // change data to int

    // axis label
    const xAxisLabel = "Year";
    const yAxisLabel = "Immigration Flow";

    // convert year string to date
    const parseTime = d3.timeParse("%Y");

    // set padding, width and height for line graph
    var padding = 60;
    var w = 600;
    var h = 400;

    // create svg for line chart
    var svg = d3
      .select("#line_graph")
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "none");

    // create x scale
    var xScale = d3
      .scaleTime() // scale time for the year
      .domain([
        d3.min(dataset, function (d) {
          return parseTime(d[0]);
        }),
        d3.max(dataset, function (d) {
          return parseTime(d[0]);
        }),
      ])
      .range([padding, w - padding]);

    // create y scale
    var yScale = d3
      .scaleLinear() // scale immigration flow value
      .domain([
        0,
        d3.max(dataset, function (d) {
          return parseInt(d[1]);
        }),
      ])
      .range([h - padding, padding])
      .nice();
    // create x axis
    var xAxis = d3.axisBottom().scale(xScale);

    // create y axis
    var yAxis = d3.axisLeft().scale(yScale).ticks(5);

    svg
      .append("g")
      .attr("class", "xAxis") // x axis has class xAxis
      .attr("transform", "translate(0, " + (h - padding) + ")") // add some padding
      .call(xAxis); // call x axis

    svg
      .append("g")
      .attr("class", "yAxis") // y axis has class yAxis
      .attr("transform", "translate(" + padding + ", 0)") // add some padding
      .call(yAxis); // call y axis

    // create x axis label
    d3.select(".xAxis")
      .append("text")
      .attr("x", w / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xAxisLabel);

    // create y axis label
    d3.select(".yAxis")
      .append("text")
      .attr("y", padding - 10)
      .attr("x", -20)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(yAxisLabel);

    // create line
    var line = d3
      .line()
      .x(function (d) {
        return xScale(parseTime(d[0]));
      })
      .y(function (d) {
        return yScale(d[1]);
      });

    // create path
    svg
      .append("path")
      .datum(dataset) // attach each data in the dataset to a path
      .attr("class", "line") // path has class line
      .attr("d", line)
      .style("stroke", "#000")
      .style("stroke-width", "1.5px");

    // create area
    var area = d3
      .area()
      .x(function (d) {
        return xScale(parseTime(d[0]));
      }) // value of date
      .y0(function () {
        return yScale.range()[0];
      }) // the min value of yScale
      .y1(function (d) {
        return yScale(d[1]);
      }); // the value of yScale that matches immigration flow value

    svg
      .append("path")
      .datum(dataset) // attach each data in the dataset to a path
      .attr("class", "area") // path has class area
      .attr("d", area)
      .style("fill", "#b69384");
  } else {
    // no data appear because of missing data
    document.getElementById("line_graph").innerHTML = "Missing data";
  }
}

function ShowLineChart() {
  //Display the additional graph
  var chart = document.getElementById("line_chart");
  chart.style.display = "block";
}

function HideLineChart() {
  //Hide the additional graph
  var chart = document.getElementById("line_chart");
  chart.style.display = "none";
}

function findCountry(d, data) {
  return data.find((e) => d.id == e.CODE);
}

map();
