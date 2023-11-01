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

const createScatterPlot = () => {
  testingData();
  console.log("ScatterPlot loaded");

  const data = globalApplicationState.infos.sort(
    (a, b) => b.restaurantCount - a.restaurantCount
  );

  SetupInfoData(data);

  const margin = { top: 20, right: 20, bottom: 70, left: 70 };
  const width = window.innerWidth * 0.4;
  const height = window.innerHeight * 0.4;

  const xLabel = "Average Price";
  const yLabel = "Average Rating";

  // Calculate the minimum and maximum values for average price and rating
  const priceMin = d3.min(data, (d) => parseFloat(d.averagePrice));
  const priceMax = d3.max(data, (d) => parseFloat(d.averagePrice));

  const ratingMin = d3.min(data, (d) => parseFloat(d.averageRating));
  const ratingMax = d3.max(data, (d) => parseFloat(d.averageRating));

  const restaurantCountMin = d3.min(data, (d) => parseFloat(d.restaurantCount));
  const restaurantCountMax = d3.max(data, (d) => parseFloat(d.restaurantCount));

  const xScale = d3
    .scaleLinear()
    .domain([priceMin - 10, priceMax + 10])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([ratingMin - 0.1, ratingMax + 0.1])
    .range([height, 0]);

  const radiusScale = d3
    .scaleSqrt()
    .domain([restaurantCountMin, restaurantCountMax])
    .range([5, 20]);

  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .text(xLabel);

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-40, ${height / 2})rotate(-90)`)
    .text(yLabel);

  svg
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

const createSelectedStateScatterPlot = () => {
  const selectedData = globalApplicationState.infos.find(
    (d) => d.state == selectedState
  );

  SetupInfoData(selectedData);

  const margin = { top: 20, right: 20, bottom: 70, left: 70 };
  const width = window.innerWidth * 0.4;
  const height = window.innerHeight * 0.4;

  const xLabel = "Average Price";
  const yLabel = "Average Rating";

  const data = selectedData.cuisineInfo;
  const scatterData = Object.keys(data).map((cuisine) => ({
    cuisine,
    averagePrice: parseFloat(data[cuisine].averagePrice),
    averageRating: parseFloat(data[cuisine].averageRating),
    restaurantCount: parseFloat(data[cuisine].restaurantCount),
  }));

  scatterData.sort((a, b) => b.restaurantCount - a.restaurantCount);

  const priceMin = d3.min(scatterData, (d) => d.averagePrice);
  const priceMax = d3.max(scatterData, (d) => d.averagePrice);

  const ratingMin = d3.min(scatterData, (d) => d.averageRating);
  const ratingMax = d3.max(scatterData, (d) => d.averageRating);

  const restaurantCountMin = d3.min(scatterData, (d) => d.restaurantCount);
  const restaurantCountMax = d3.max(scatterData, (d) => d.restaurantCount);

  const xScale = d3
    .scaleLinear()
    .domain([priceMin - 10, priceMax + 10])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([ratingMin - 0.1, ratingMax + 0.1])
    .range([height, 0]);

  const radiusScale = d3
    .scaleSqrt()
    .domain([restaurantCountMin, restaurantCountMax])
    .range([5, 20]);

  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .text(xLabel);

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-40, ${height / 2})rotate(-90)`)
    .text(yLabel);

  svg
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

const testingData = () => {
  const stateDropdown = document.getElementById("indiaMapDropdown");

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

  stateDropdown.addEventListener("change", function () {
    selectedState = stateDropdown.value;
    if (selectedState == "None") {
      createScatterPlot();
    } else {
      createSelectedStateScatterPlot();
    }
  });
};

/*
const RenderLegends = () => {
  const numStates = data.length;

  const legendColumn1 = svg
    .append("g")
    .attr("class", "legend-column")
    .attr("transform", `translate(${width - 150},${10})`);

  const legendColumn2 = svg
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
