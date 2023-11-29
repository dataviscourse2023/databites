async function loadData() {
  const swiggyData = await d3.csv("./data/swiggy.csv");
  return { swiggyData };
}

const globalApplicationState = {
  cities: [],
  states: [],
  cuisines: [],
  selectedStates: [],
  infos: [],
  swiggyData: null,
  selectedState: "",
};

function getUniqueValuesByKey(key) {
  const uniqueValues = [];
  const valueSet = new Set();

  for (const obj of globalApplicationState.swiggyData) {
    const value = obj[key];
    if (!valueSet.has(value)) {
      valueSet.add(value);
      uniqueValues.push(value);
    }
  }

  return uniqueValues.sort((a, b) => a.localeCompare(b));
}

const getStateInfos = () => {
  let infos = [];
  const stateRatingSum = {};
  const statePriceSum = {};
  const stateRestaurantCount = {};
  const cuisineInfo = {};

  for (const item of globalApplicationState.swiggyData) {
    const state = item.state;
    const rating = parseFloat(item.rating);
    const cost = parseFloat(item.cost);
    const cuisine = item.cuisine;

    if (!stateRatingSum[state]) {
      stateRatingSum[state] = 0;
      stateRestaurantCount[state] = 0;
      statePriceSum[state] = 0;
    }

    stateRatingSum[state] += rating;
    statePriceSum[state] += cost;
    stateRestaurantCount[state]++;

    if (!cuisineInfo[state]) {
      cuisineInfo[state] = {};
    }

    if (!cuisineInfo[state][cuisine]) {
      cuisineInfo[state][cuisine] = {
        totalRating: 0,
        totalPrice: 0,
        restaurantCount: 0,
      };
    }

    cuisineInfo[state][cuisine].totalRating += rating;
    cuisineInfo[state][cuisine].totalPrice += cost;
    cuisineInfo[state][cuisine].restaurantCount++;
  }

  for (const state of globalApplicationState.states) {
    const averageRating = (
      stateRatingSum[state] / stateRestaurantCount[state]
    ).toFixed(2);
    const averagePrice = (
      statePriceSum[state] / stateRestaurantCount[state]
    ).toFixed(2);

    const cuisineAverages = {};
    for (const cuisine of Object.keys(cuisineInfo[state])) {
      const info = cuisineInfo[state][cuisine];
      cuisineAverages[cuisine] = {
        averageRating: (info.totalRating / info.restaurantCount).toFixed(2),
        averagePrice: (info.totalPrice / info.restaurantCount).toFixed(2),
        restaurantCount: info.restaurantCount,
      };
    }

    const info = {
      state,
      averageRating,
      averagePrice,
      restaurantCount: stateRestaurantCount[state],
      cuisineInfo: cuisineAverages,
    };

    infos.push(info);
  }

  return infos;
};

const setIndiaMapDropdown = () => {
  const stateDropdown = document.getElementById("indiaMapDropdown");
  const selectedStateUI = document
    .querySelector(".map-section")
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
    globalApplicationState.selectedState = stateDropdown.options[0].value;
    selectedStateUI.textContent = stateDropdown.options[0].value;
  }

  stateDropdown.addEventListener("change", function () {
    globalApplicationState.selectedState = stateDropdown.value;
    selectedStateUI.textContent = stateDropdown.value;
    refreshScatterPlot();
    refreshBubbleChart();
  });
};

loadData().then((loadedData) => {
  globalApplicationState.swiggyData = loadedData.swiggyData;
  globalApplicationState.cities = getUniqueValuesByKey("city");
  globalApplicationState.cuisines = getUniqueValuesByKey("cuisine").sort();
  globalApplicationState.states = getUniqueValuesByKey("state")
    .filter((d) => d != "N/A")
    .sort();
  globalApplicationState.infos = getStateInfos();

  setIndiaMapDropdown();

  console.log("Here is the imported data:", loadedData.swiggyData);
  console.log("Here are the unique cities:", globalApplicationState.cities);
  console.log("Here are the unique cuisines:", globalApplicationState.cuisines);
  console.log("Here are the unique states:", globalApplicationState.states);
  console.log("Here are the unique infos:", globalApplicationState.infos);

  const dataLoadedEvent = new Event("dataLoaded");
  document.dispatchEvent(dataLoadedEvent);
});

document.addEventListener("DOMContentLoaded", function () {
  // Your entire code here
  const geoJsonPath = "../states_india.geojson";
  const svg = d3
    .select("#indiaMap")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Load GeoJSON data and render the map
  d3.json(geoJsonPath).then(function (data) {
    const projection = d3
      .geoMercator()
      .fitSize([svg.node().clientWidth, svg.node().clientHeight], data);

    const path = d3.geoPath().projection(projection);

    // svg.selectAll('path')
    //   .data(data.features)
    //   .enter().append('path')
    //   .attr('d', path)
    //   .on('click', function (event, d) {
    //     const stateName = d.properties.st_nm || 'No state selected';
    //     document.getElementById('selectedState').innerText = stateName;
    //   });

    svg
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "lightblue") // Add a fill color for visibility
      .style("stroke", "white") // Add a stroke color
      .on("click", function (event, d) {
        const clickedFeature = typeof d === "number" ? data.features[d] : d;
        console.log("Clicked:", clickedFeature.properties.st_nm);
        const stateName =
          clickedFeature.properties.st_nm || "No state selected";
        document.getElementById("selectedState").innerText = stateName;
      });
  });
});
