const createScatterPlot = () => {
  console.log("ScatterPlot loaded");

  const width = window.innerWidth * 0.4;
  const height = window.innerHeight * 0.4;
  const margin = { top: 50, right: 20, bottom: 70, left: 70 };
  let scatterPlotSvg,
    priceMin,
    priceMax,
    ratingMin,
    ratingMax,
    restaurantCountMin,
    restaurantCountMax,
    xScale,
    yScale,
    radiusScale;

  const SetupInfoData = (data) => {
    const box1 = document.getElementById("box1").querySelector(".box-value");
    const box2 = document.getElementById("box2").querySelector(".box-value");
    const box3 = document.getElementById("box3").querySelector(".box-value");

    if (globalApplicationState.selectedState == "None") {
      const totalAvgRating = data.reduce(
        (total, item) => total + parseFloat(item.averageRating),
        0
      );
      const totalAvgPrice = data.reduce(
        (total, item) => total + parseFloat(item.averagePrice),
        0
      );
      const totalRestaurantCount = data.reduce(
        (total, item) => total + parseFloat(item.restaurantCount),
        0
      );
      const statesCount = globalApplicationState.states.length;
      box1.textContent = `${(totalAvgRating / statesCount).toFixed(2)} / 5.00`;
      box2.textContent = `₹${(totalAvgPrice / statesCount).toFixed(2)}`;
      box3.textContent = `${totalRestaurantCount}`;
    } else {
      box1.textContent = `${data.averageRating} / 5.00`;
      box2.textContent = `₹${data.averagePrice}`;
      box3.textContent = `${data.restaurantCount}`;
    }
  };

  const initializeScatterPlot = (data) => {
    priceMin = d3.min(data, (d) => parseFloat(d.averagePrice));
    priceMax = d3.max(data, (d) => parseFloat(d.averagePrice));

    ratingMin = d3.min(data, (d) => parseFloat(d.averageRating));
    ratingMax = d3.max(data, (d) => parseFloat(d.averageRating));

    restaurantCountMin = d3.min(data, (d) => parseFloat(d.restaurantCount));
    restaurantCountMax = d3.max(data, (d) => parseFloat(d.restaurantCount));

    xScale = d3
      .scaleLinear()
      .domain([priceMin - 10, priceMax + 10])
      .range([0, width])
      .nice(10);

    yScale = d3
      .scaleLinear()
      .domain([ratingMin - 0.1, ratingMax + 0.1])
      .range([height, 0])
      .nice(10);

    radiusScale = d3
      .scaleSqrt()
      .domain([restaurantCountMin, restaurantCountMax])
      .range([5, 20]);

    const xLabel = "Average Price";
    const yLabel = "Average Rating";

    if (!scatterPlotSvg)
      scatterPlotSvg = d3
        .select("#scatterPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    scatterPlotSvg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    scatterPlotSvg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    scatterPlotSvg
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 30)
      .text(xLabel);

    scatterPlotSvg
      .append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(-40, ${height / 2})rotate(-90)`)
      .text(yLabel);
  };

  const renderScatterPlot = () => {
    if (scatterPlotSvg) {
      scatterPlotSvg.selectAll("*").remove();
    }

    const data = globalApplicationState.infos.sort(
      (a, b) => b.restaurantCount - a.restaurantCount
    );

    SetupInfoData(data);
    initializeScatterPlot(data);

    scatterPlotSvg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 0) // Initial radius for entering elements
      .attr("cx", (d) => xScale(d.averagePrice))
      .attr("cy", (d) => yScale(d.averageRating))
      .attr("fill", "#D35400")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .merge(scatterPlotSvg.selectAll(".dot")) // Merge enter and existing elements
      .transition() // Add transition
      .duration(1000) // Set the duration of the transition
      .attr("r", (d) => radiusScale(d.restaurantCount));

    scatterPlotSvg
      .selectAll(".dot")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("stroke", "#36454F").attr("stroke-width", 1);
      })
      .append("title")
      .text(
        (d) =>
          `State: ${d.state}\nAvg. Price: ${d.averagePrice}\nAvg. Rating: ${d.averageRating}\nRestaurants: ${d.restaurantCount}`
      );

    // Add legend
    const legendGroup = scatterPlotSvg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 250},${-25})`);

    // Add box around legend
    const legendBox = legendGroup
      .append("rect")
      .attr("width", 265)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Add circle to represent dot size
    legendGroup
      .append("circle")
      .attr("r", radiusScale(restaurantCountMax / 3))
      .attr("cx", 15)
      .attr("cy", 25)
      .attr("fill", "#D35400")
      .attr("stroke", "#36454F")
      .attr("stroke-width", 1);

    // Add text label
    legendGroup
      .append("text")
      .attr("x", 30)
      .attr("y", 30)
      .style("font-size", "12px")
      .text(`Size is based on\nNumber of Restaurants`);
  };

  const renderSelectedStateScatterPlot = () => {
    if (scatterPlotSvg) {
      scatterPlotSvg.selectAll("*").remove();
    }

    const selectedData = globalApplicationState.infos.find(
      (d) => d.state == globalApplicationState.selectedState
    );

    const data = selectedData.cuisineInfo;
    const scatterData = Object.keys(data).map((cuisine) => ({
      cuisine,
      averagePrice: parseFloat(data[cuisine].averagePrice),
      averageRating: parseFloat(data[cuisine].averageRating),
      restaurantCount: parseFloat(data[cuisine].restaurantCount),
    }));
    scatterData.sort((a, b) => b.restaurantCount - a.restaurantCount);

    SetupInfoData(selectedData);
    initializeScatterPlot(scatterData);

    scatterPlotSvg
      .selectAll(".dot")
      .data(scatterData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 0) // Initial radius for entering elements
      .attr("cx", (d) => xScale(d.averagePrice))
      .attr("cy", (d) => yScale(d.averageRating))
      .attr("fill", "#D35400")
      .attr("stroke", "#36454F")
      .attr("stroke-width", 1)
      .merge(scatterPlotSvg.selectAll(".dot")) // Merge enter and existing elements
      .transition() // Add transition
      .duration(1000) // Set the duration of the transition
      .attr("r", (d) => radiusScale(d.restaurantCount));

    scatterPlotSvg
      .selectAll(".dot")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("stroke", "#36454F").attr("stroke-width", 1);
      })
      .append("title")
      .text(
        (d) =>
          `cuisine: ${d.cuisine}\nAvg. Price: ${d.averagePrice}\nAvg. Rating: ${d.averageRating}\nRestaurants: ${d.restaurantCount}`
      );

    // Add legend
    const legendGroup = scatterPlotSvg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 250},${-25})`);

    // Add box around legend
    const legendBox = legendGroup
      .append("rect")
      .attr("width", 265)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Add circle to represent dot size
    legendGroup
      .append("circle")
      .attr("r", radiusScale(restaurantCountMax / 3))
      .attr("cx", 15)
      .attr("cy", 25)
      .attr("fill", "#D35400")
      .attr("stroke", "36454F")
      .attr("stroke-width", 1);

    // Add text label
    legendGroup
      .append("text")
      .attr("x", 30)
      .attr("y", 30)
      .style("font-size", "12px")
      .text(`Size is based on\nNumber of Restaurants`);
  };

  return { renderScatterPlot, renderSelectedStateScatterPlot };
};

let scatterPlot;

document.addEventListener("dataLoaded", () => {
  scatterPlot = createScatterPlot();
  scatterPlot.renderScatterPlot();
});

const refreshScatterPlot = () => {
  if (globalApplicationState.selectedState == "None") {
    scatterPlot.renderScatterPlot();
  } else {
    scatterPlot.renderSelectedStateScatterPlot();
  }
};

/*
const RenderLegends = () => {
  const numStates = data.length;

  const legendColumn1 = scatterPlotSvg
    .append("g")
    .attr("class", "legend-column")
    .attr("transform", `translate(${width - 150},${10})`);

  const legendColumn2 = scatterPlotSvg
    .append("g")
    .attr("class", "legend-column")
    .attr("transform", `translate(${width - 70},${10})`); 

  colorScale.domain().forEach((state, index) => {
    if (index < numStates / 2) {
      // Render in column 1
      legendColumn1
        .append("rect")
        .attr("x", -100)
        .attr("y", 200 + index * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale(state));

      legendColumn1
        .append("text")
        .attr("x", -75)
        .attr("y", 200 + index * 20 + 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(state);
    } else {
      // Render in column 2
      const adjustedIndex = index - numStates / 2;
      legendColumn2
        .append("rect")
        .attr("x", -25)
        .attr("y", 200 + adjustedIndex * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale(state));

      legendColumn2
        .append("text")
        .attr("x", 0)
        .attr("y", 200 + adjustedIndex * 20 + 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(state);
    }
  });
};
*/
