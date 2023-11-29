const createBubbleChart = () => {
  console.log("Bubble Chart Loaded");

  const GetTop10Restaurants = (selectedState) => {
    const selectedStateRestaurants = globalApplicationState.swiggyData.filter(
      (restaurant) => {
        return restaurant.state === selectedState;
      }
    );

    // priority queue
    let top10Restaurants = [];
    const top10Ratings = new Array(10).fill(-1);

    selectedStateRestaurants.forEach((restaurant) => {
      const rating = parseFloat(restaurant.rating);

      if (rating > top10Ratings[0]) {
        top10Restaurants[0] = restaurant;
        top10Ratings[0] = rating;

        let index = 0;
        while (index < 9 && top10Ratings[index] > top10Ratings[index + 1]) {
          [top10Ratings[index], top10Ratings[index + 1]] = [
            top10Ratings[index + 1],
            top10Ratings[index],
          ];
          [top10Restaurants[index], top10Restaurants[index + 1]] = [
            top10Restaurants[index + 1],
            top10Restaurants[index],
          ];
          index++;
        }
      }
    });

    top10Restaurants = top10Restaurants.map((restaurant) => {
      return {
        restaurantName: restaurant.name,
        rating: parseFloat(restaurant.rating),
        url: restaurant.link,
        cost: parseFloat(restaurant.cost),
        cuisine: restaurant.cuisine,
        city: restaurant.city,
      };
    });
    return top10Restaurants;
  };

  const renderBubbleChart = (selectedState) => {
    const top10Restaurants = GetTop10Restaurants(selectedState);
    console.log(`Top 10 restaurants from ${selectedState}`);
    console.log(top10Restaurants);

    // Define a color scale for cuisines
    const cuisineColorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Assuming you have a container element with the id 'bubbleChart'
    const bubbleChartContainer = d3.select("#bubbleChart");

    // Clear previous chart content
    bubbleChartContainer.selectAll("*").remove();

    // Define chart dimensions
    const width = 600;
    const height = 400;

    // Create an SVG element
    const svg = bubbleChartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Assuming each restaurant has properties 'rating', 'restaurantName', and 'cuisine'
    const radiusScale = d3
      .scaleSqrt()
      .domain([
        d3.min(top10Restaurants, (d) => d.rating),
        d3.max(top10Restaurants, (d) => d.rating),
      ])
      .range([25, 40]);

    // Create a force simulation
    const simulation = d3
      .forceSimulation(top10Restaurants)
      .force(
        "center",
        d3.forceCenter(width / 2 - 50, height / 2) // Center the simulation in the middle of the SVG
      )
      .force(
        "collision",
        d3.forceCollide().radius((d) => radiusScale(d.rating)) // Adjust the collision radius as needed
      )
      .on("tick", ticked);

    // Creating circles for each restaurant
    const bubbles = svg
      .selectAll("circle")
      .data(top10Restaurants)
      .enter()
      .append("circle")
      .attr("r", (d) => radiusScale(d.rating))
      .attr("fill", (d) => cuisineColorScale(d.cuisine))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 0);
      });

    // Adding ratings as labels
    svg
      .selectAll("text")
      .data(top10Restaurants)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .text((d) => d.rating);

    svg
      .selectAll("circle")
      .append("title")
      .text(
        (d) =>
          `Restaurant: ${d.restaurantName}\nRating: ${d.rating}\nCuisine: ${d.cuisine}`
      );

    // Create legend
    const legend = svg
      .selectAll(".legend")
      .data(cuisineColorScale.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(10, ${i * 20 + 10})`); // Adjust the translation

    // Add colored rectangles to legend
    legend
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", cuisineColorScale);

    // Add text to legend
    legend
      .append("text")
      .attr("transform", "translate(24, 15)") // Adjust the translation
      .style("text-anchor", "start")
      .text((d) => d);

    function ticked() {
      bubbles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      // Update labels as well
      svg
        .selectAll("text")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y);
    }
  };

  return { renderBubbleChart };
};

let bubbleChart;

const refreshBubbleChart = () => {
  bubbleChart.renderBubbleChart(globalApplicationState.selectedState);
};

document.addEventListener("dataLoaded", () => {
  bubbleChart = createBubbleChart();
  bubbleChart.renderBubbleChart(globalApplicationState.selectedState);
});
