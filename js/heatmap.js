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
      })
      .append("title")
      .text((d) => `${d.properties.st_nm}`);

    // Legend

    const legendWidth = 200;
    const legendHeight = 20;

    const legendPadding = 25; // Padding between legend and map

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${
          svg.node().clientWidth - legendWidth - legendPadding * 2
        }, ${legendPadding})`
      );

    const legendScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          globalApplicationState.infos.map((info) => info.restaurantCount)
        ),
      ])
      .range([0, legendWidth]);

    // Create a gradient for the legend
    const gradient = legend
      .append("linearGradient")
      .attr("id", "legend_Gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data(legendScale.ticks(6))
      .enter()
      .append("stop")
      .attr("offset", (d) => legendScale(d) / legendWidth)
      .attr("stop-color", colorScale);

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#legend_Gradient)");

    // Add legend axis
    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(d3.axisBottom(legendScale).ticks(6))
      .select(".domain")
      .remove();

    // Add "Ratings" text
    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Restaurant Count");
  });

  document.getElementById("resetButton").addEventListener("click", function () {
    document.getElementById("infoTitle").textContent =
      "Informations about restaurants in India";
    globalApplicationState.selectedState = "None";
    selectedStateUI.textContent = "None";
    refreshScatterPlot();
    refreshBubbleChart();
    refreshPieChart();
  });
};

document.addEventListener("dataLoaded", createHeatMap);
