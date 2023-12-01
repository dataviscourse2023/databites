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
  cuisineRestaurantCount: [],
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
  const statesFromIndiaMap = document.getElementById("indiaMapDropdown");
  const selectedStateUI = document
    .querySelector(".map-section")
    .querySelector("#selectedState");

  let option = document.createElement("option");
  option.value = "None";
  option.textContent = "None";
  statesFromIndiaMap.appendChild(option);

  for (const state of globalApplicationState.states) {
    option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    statesFromIndiaMap.appendChild(option);
  }

  if (statesFromIndiaMap.options.length > 0) {
    globalApplicationState.selectedState = statesFromIndiaMap.options[0].value;
    selectedStateUI.textContent = statesFromIndiaMap.options[0].value;
  }

  // const mapFeatures = d3.select("#indiaMap").selectAll(".map-feature");
  // console.log(mapFeatures);
  // mapFeatures.on("click", function(event, feature) {
  //   if (statesFromIndiaMap.value == "None") {
  //     document.getElementById("infoTitle").textContent =
  //       "Informations about restaurants in India";
  //   } else {
  //     document.getElementById(
  //       "infoTitle"
  //     ).textContent = `Informations about restaurants in ${statesFromIndiaMap.value}`;
  //   }
  //   globalApplicationState.selectedState = statesFromIndiaMap.value;
  //   selectedStateUI.textContent = statesFromIndiaMap.value;
  //   refreshScatterPlot();
  //   refreshBubbleChart();
  //   console.log("Refreshing pie chart");
  //   refreshPieChart();
  // }); 
  d3.select("#indiaMap").on("click", ".map-feature", function (event, feature) {
    if (statesFromIndiaMap.value == "None") {
      document.getElementById("infoTitle").textContent =
        "Informations about restaurants in India";
    } else {
      document.getElementById(
        "infoTitle"
      ).textContent = `Informations about restaurants in ${statesFromIndiaMap.value}`;
    }
    globalApplicationState.selectedState = statesFromIndiaMap.value;
    selectedStateUI.textContent = statesFromIndiaMap.value;
    refreshScatterPlot();
    refreshBubbleChart();
    console.log("Refreshing pie chart");
    refreshPieChart();
  });
};

const GetRestaurantsCount = () => {
  const countData = {};
  const countArray = [];

  globalApplicationState.swiggyData.forEach((restaurant) => {
    const { cuisine, state } = restaurant;

    if (!countData[state]) {
      countData[state] = { cuisines: {}, totalCuisines: 0 };
    }

    if (!countData[state].cuisines[cuisine]) {
      countData[state].cuisines[cuisine] = 0;
    }

    countData[state].cuisines[cuisine]++;
    countData[state].totalCuisines++;
  });

  for (const state in countData) {
    const cuisines = countData[state].cuisines;
    const totalCuisines = countData[state].totalCuisines;

    countArray.push({ state, cuisines, totalCuisines });
  }

  return countArray;
};

loadData().then((loadedData) => {
  globalApplicationState.swiggyData = loadedData.swiggyData;
  globalApplicationState.cities = getUniqueValuesByKey("city");
  globalApplicationState.cuisines = getUniqueValuesByKey("cuisine").sort();
  globalApplicationState.states = getUniqueValuesByKey("state")
    .filter((d) => d != "N/A")
    .sort();
  globalApplicationState.infos = getStateInfos();
  globalApplicationState.cuisineRestaurantCount = GetRestaurantsCount();

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
  const geoJsonPath = "../states_india.geojson";
  const svg = d3
    .select("#indiaMap")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Load GeoJSON data and render the map
  d3.json(geoJsonPath).then(function (data) {
    console.log(globalApplicationState.infos); // Move the console.log here

    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, d3.max(globalApplicationState.infos.map(info => info.restaurantCount))]);

    const projection = d3
      .geoMercator()
      .fitSize([svg.node().clientWidth, svg.node().clientHeight], data);
    const path = d3.geoPath().projection(projection);

    function getTotalRestaurantsForState(state) {
      const stateInfo = globalApplicationState.infos.find(info => info.state === state);
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
      .style("fill", d => colorScale(getTotalRestaurantsForState(d.properties.st_nm)))
      .style("stroke", "#fff")
      .on("click", function (event, d) {
        const clickedFeature = typeof d === "number" ? data.features[d] : d;
        console.log("Clicked:", clickedFeature.properties.st_nm);
        const stateName = clickedFeature.properties.st_nm || "No state selected";
        document.getElementById("selectedState").innerText = stateName;
      });
  });
});

