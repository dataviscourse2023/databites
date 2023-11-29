let selectedState = "None";

const SetupInfoData = (data) => {
  const box1 = document.getElementById("box1").querySelector(".box-value");
  const box2 = document.getElementById("box2").querySelector(".box-value");
  const box3 = document.getElementById("box3").querySelector(".box-value");

  if (selectedState == "None") {
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
    box1.textContent = `${(totalAvgRating / statesCount).toFixed(2)}`;
    box2.textContent = `${(totalAvgPrice / statesCount).toFixed(2)}`;
    box3.textContent = `${totalRestaurantCount}`;
  } else {
    box1.textContent = `${data.averageRating}`;
    box2.textContent = `${data.averagePrice}`;
    box3.textContent = `${data.restaurantCount}`;
  }
};

let radiusScale, xScale, yScale, scatterPlotSvg;

const initializeScatterPlot = () => {
  const width = window.innerWidth * 0.4;
  const height = window.innerHeight * 0.4;
  const margin = { top: 20, right: 20, bottom: 70, left: 70 };

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

  //const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const xAxis = scatterPlotSvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);

  // Manually add a tick at the value 0 with additional styling
  const zeroTick = xAxis
    .append("g")
    .attr("class", "tick")
    .attr("opacity", 1)
    .attr("transform", "translate(0,0)");

  zeroTick.append("line").attr("stroke", "currentColor").attr("y2", 6);

  zeroTick
    .append("text")
    .attr("fill", "currentColor")
    .attr("y", 9)
    .attr("dy", "0.71em")
    .style("font-size", "10px")
    .style("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("0");

  xAxis.call((g) =>
    g.append("g").attr("class", "tick").call(d3.axisBottom(xScale))
  );

  scatterPlotSvg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .text(xLabel);

  scatterPlotSvg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  scatterPlotSvg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-40, ${height / 2})rotate(-90)`)
    .text(yLabel);
};

const initializeData = (data) => {
  const margin = { top: 20, right: 20, bottom: 70, left: 70 };

  const priceMin = d3.min(data, (d) => parseFloat(d.averagePrice));
  const priceMax = d3.max(data, (d) => parseFloat(d.averagePrice));

  const ratingMin = d3.min(data, (d) => parseFloat(d.averageRating));
  const ratingMax = d3.max(data, (d) => parseFloat(d.averageRating));

  const restaurantCountMin = d3.min(data, (d) => parseFloat(d.restaurantCount));
  const restaurantCountMax = d3.max(data, (d) => parseFloat(d.restaurantCount));

  xScale = d3
    .scaleLinear()
    .domain([priceMin - 10, priceMax + 10])
    .range([0, width]);

  yScale = d3
    .scaleLinear()
    .domain([ratingMin - 0.1, ratingMax + 0.1])
    .range([height - margin.top - 3, 0]);

  radiusScale = d3
    .scaleSqrt()
    .domain([restaurantCountMin, restaurantCountMax])
    .range([5, 20]);

  initializeScatterPlot();
};

const createScatterPlot = () => {
  console.log("ScatterPlot loaded");
  testingData();
};

const renderScatterPlot = () => {
  if (scatterPlotSvg) {
    scatterPlotSvg.selectAll("*").remove();
  }

  const data = globalApplicationState.infos.sort(
    (a, b) => b.restaurantCount - a.restaurantCount
  );

  SetupInfoData(data);
  initializeData(data);

  scatterPlotSvg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", (d) => radiusScale(parseFloat(d.restaurantCount)))
    .attr("cx", (d) => xScale(parseFloat(d.averagePrice)))
    .attr("cy", (d) => yScale(parseFloat(d.averageRating)))
    .attr("fill", "#007AFF")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
    })
    .append("title")
    .text(
      (d) =>
        `State: ${d.state}\nTotal Restaurants: ${d.restaurantCount}\nAverageRating: ${d.averageRating}\nAveragePrice: ${d.averagePrice}`
    );
};

const renderSelectedStatecScatterPlot = () => {
  if (scatterPlotSvg) {
    scatterPlotSvg.selectAll("*").remove();
  }

  const selectedData = globalApplicationState.infos.find(
    (d) => d.state == selectedState
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
  initializeData(scatterData);

  scatterPlotSvg
    .selectAll(".dot")
    .data(scatterData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", (d) => radiusScale(d.restaurantCount))
    .attr("cx", (d) => xScale(d.averagePrice))
    .attr("cy", (d) => yScale(d.averageRating))
    .attr("fill", "#007AFF")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
    })
    .append("title")
    .text(
      (d) =>
        `cuisine: ${d.cuisine}\nAvg. Price: ${d.averagePrice}\nAvg. Rating: ${d.averageRating}\nRestaurants: ${d.restaurantCount}`
    );
};

document.addEventListener("dataLoaded", createScatterPlot);

const selectedStateFromMap = (state) => {
  selectedState = state;

  const selectedStateUI = document
    .querySelector(".bottom-section")
    .querySelector("#selectedState");
  selectedStateUI.textContent = selectedState;

  if (selectedState == "None") {
    renderScatterPlot();
  } else {
    renderSelectedStatecScatterPlot();
  }
};

// MAP STATE SELECTION
// const testingData = () => {
//   selectedStateFromMap("None");
// };

// DROPDOWN STATE SELECTION

const testingData = () => {
  const stateDropdown = document.getElementById("indiaMapDropdown");
  const selectedStateUI = document
    .querySelector(".bottom-section")
    .querySelector("#selectedState");

  let option = document.createElement("option");
  option.value = "None";
  option.textContent = "None";
  stateDropdown.appendChild(option);

  for (const state of globalApplicationState.states) {
    option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateDropdown.appendChild(option);
  }

  if (stateDropdown.options.length > 0) {
    selectedState = stateDropdown.options[0].value;
    selectedStateUI.textContent = selectedState;
  }

  renderScatterPlot();

  stateDropdown.addEventListener("change", function () {
    selectedState = stateDropdown.value;
    selectedStateUI.textContent = selectedState;
    if (selectedState == "None") {
      renderScatterPlot();
    } else {
      renderSelectedStatecScatterPlot();
    }
  });
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
