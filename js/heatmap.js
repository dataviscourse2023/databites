const createHeatMap = () => {
  const geoJsonPath = "../states_india.geojson";
  const svg = d3
    .select("#indiaMap")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  const selectedStateUI = document
    .querySelector(".map-section")
    .querySelector("#selectedState");

  globalApplicationState.selectedState = "None";

  // Load GeoJSON data and render the map
  d3.json(geoJsonPath).then(function (data) {
    console.log(globalApplicationState.infos); // Move the console.log here

    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([
        0,
        d3.max(
          globalApplicationState.infos.map((info) => info.restaurantCount)
        ),
      ]);

    const projection = d3
      .geoMercator()
      .fitSize([svg.node().clientWidth, svg.node().clientHeight], data);
    const path = d3.geoPath().projection(projection);

    function getTotalRestaurantsForState(state) {
      const stateInfo = globalApplicationState.infos.find(
        (info) => info.state === state
      );
      if (stateInfo) {
        var count = stateInfo.restaurantCount;
        return count;
      }
      return 0;
    }

    svg
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "map-feature")
      .style("fill", (d) =>
        colorScale(getTotalRestaurantsForState(d.properties.st_nm))
      )

      .style("stroke", "black")
      .attr("stroke-width", 0.2)
      .on("mouseover", function (d) {
        // Change the state border to black on hover
        const selectedData = globalApplicationState.cuisineRestaurantCount.find(
          (state) => state.state === d.properties.st_nm
        );

        if (selectedData === undefined) {
          return;
        }
        d3.select(this)
          .style("cursor", "pointer")
          .style("stroke", "black")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        // Reset the border color on mouseout
        d3.select(this).style("stroke", "black").attr("stroke-width", 0.2);
      })
      .on("click", function (d) {
        // Print the name of the state on click
        const selectedData = globalApplicationState.cuisineRestaurantCount.find(
          (state) => state.state === d.properties.st_nm
        );

        if (selectedData === undefined) {
          return;
        }

        console.log("Clicked State:", d.properties.st_nm);
        if (d.properties.st_nm == "None") {
          document.getElementById("infoTitle").textContent =
            "Informations about restaurants in India";
          globalApplicationState.selectedState = "None";
          selectedStateUI.textContent = "None";
          refreshScatterPlot();
          refreshBubbleChart();
          refreshPieChart();
        } else {
          document.getElementById(
            "infoTitle"
          ).textContent = `Informations about restaurants in ${d.properties.st_nm}`;
          globalApplicationState.selectedState = d.properties.st_nm;
          selectedStateUI.textContent = d.properties.st_nm;
          refreshScatterPlot();
          refreshBubbleChart();
          refreshPieChart();
        }
      });
  });
};

document.addEventListener("dataLoaded", createHeatMap);
