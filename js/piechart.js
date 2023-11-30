const createPieChart = () => {
  console.log("Pie Chart Loaded");

  const renderPieChart = (selectedState) => {
    const pieChartContainer = d3.select("#pieChart");
    // Clear previous chart content
    pieChartContainer.selectAll("*").remove();

    if (selectedState === "None") {
      // If selectedState is "None", append a paragraph element with the specified text
      pieChartContainer
        .append("p")
        .text("No Data")
        .style("color", "red")
        .style("font-weight", "bold");
      return; // Exit the function
    }

    const cuisinesCountObject =
      globalApplicationState.cuisineRestaurantCount.find(
        (state) => state.state === selectedState
      ).cuisines;

    // Convert cuisinesCountObject to an array of objects
    const cuisinesArray = Object.entries(cuisinesCountObject).map(
      ([cuisine, count]) => ({
        cuisine,
        count,
      })
    );

    // Sort the array based on count in descending order
    cuisinesArray.sort((a, b) => b.count - a.count);

    // Take the top 10 cuisines and aggregate the rest into "Others"
    const top10Cuisines = cuisinesArray.slice(0, 9);
    const othersCount = cuisinesArray
      .slice(9)
      .reduce((sum, cuisine) => sum + cuisine.count, 0);

    // Add "Others" to the top 10 list
    if (othersCount > 0) {
      top10Cuisines.push({ cuisine: "Others", count: othersCount });
    }

    console.log(top10Cuisines);

    const width = 400;
    const height = 400;
    const radius = 200;

    const svg = pieChartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.count);

    const path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const pieData = pie(top10Cuisines);

    const arc = svg.selectAll("arc").data(pieData).enter().append("g");

    const arcPath = arc
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => color(d.data.cuisine))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 0);
      });

    arcPath
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return path(interpolate(t));
        };
      });

    // Add hover effect and title to each arc
    arcPath.append("title").text((d) => `Restaurant Count: ${d.data.count}`);

    arc
      .append("text")
      .attr("transform", (d) => {
        const centroid = path.centroid(d);
        const x = centroid[0];
        const y = centroid[1];
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        // Mirror the text on the left side
        if (x < 0) {
          angle += 180;
        }
        return `translate(${x},${y}) rotate(${angle})`;
      })
      .attr("dy", "0.35em")
      .style("text-anchor", (d) => (path.centroid(d)[0] < 0 ? "end" : "start"))
      .text((d) => d.data.cuisine)
      .style("opacity", 0) // Set initial opacity to 0
      .transition()
      .duration(1000)
      .delay(500) // Delay the text animation for a smoother effect
      .style("opacity", 1); // Fade in the text
  };

  return { renderPieChart };
};

let pieChart;

const refreshPieChart = () => {
  pieChart.renderPieChart(globalApplicationState.selectedState);
};

document.addEventListener("dataLoaded", () => {
  pieChart = createPieChart();
  pieChart.renderPieChart(globalApplicationState.selectedState);
});
