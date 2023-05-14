// // Data for the bubble map
// const data = [
//   { country: "United States of America", population: 328.2, year: 2000 },
//   { country: "China", population: 1262, year: 2000 },
//   { country: "India", population: 1053.2, year: 2000 },
//   // Add more data for different years
// ];

// create projection
const projection = d3.geoMercator().translate([400, 200]).scale(200);

// create path
const path = d3.geoPath().projection(projection);

// color scheme
var mapColor = d3
  .scaleQuantize()
  .domain([0, 1000])
  .range(["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"]);

// set up map svg
const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", 800)
  .attr("height", 400)
  .attr("fill", "grey");

d3.csv("../../DataVisProject/Data/Chart_2/migration_flow.csv").then(function (
  data
) {
  console.log(data);
  // read json file and bind the data into the path
  d3.json("../../DataVisProject/Data/Chart_2/countries.geo.json").then(
    function (json) {
      // show the map
      svg
        .selectAll("path")
        .data(json.features) // take the data from json file
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "black") // show the border of countries
        .style("stroke-width", 0.5);

      // create year-slider
      const slider = document.getElementById("year-slider");
      slider.addEventListener("input", function () {
        const selectedYear = parseInt(this.value);
        // update map in the selected year
        updateMap(selectedYear);
      });

      // initialise the map at the initial year
      updateMap(parseInt(slider.value));

      // update the countries' color when update the slider
      function updateMap(selectedYear) {
        svg.selectAll("path").style("fill", function (d) {
          country = data.find((e) => d.id == e.CODE);
          // change the label
          document.getElementById("year-slider-label").innerHTML = selectedYear;
          if (!country) {
            return mapColor(0);
          }
          // return new color
          return mapColor(country[selectedYear]);
        });
      }
    }
  );
});
