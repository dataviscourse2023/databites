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

  return uniqueValues;
}

const getStateInfos = () => {
  const infos = [];
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

loadData().then((loadedData) => {
  globalApplicationState.swiggyData = loadedData.swiggyData;
  globalApplicationState.cities = getUniqueValuesByKey("city");
  globalApplicationState.cuisines = getUniqueValuesByKey("cuisine").sort();
  globalApplicationState.states = getUniqueValuesByKey("state")
    .filter((d) => d != "N/A")
    .sort();
  globalApplicationState.infos = getStateInfos();

  console.log("Here is the imported data:", loadedData.swiggyData);
  console.log("Here are the unique cities:", globalApplicationState.cities);
  console.log("Here are the unique cuisines:", globalApplicationState.cuisines);
  console.log("Here are the unique states:", globalApplicationState.states);
  console.log("Here are the unique infos:", globalApplicationState.infos);

  const dataLoadedEvent = new Event("dataLoaded");
  document.dispatchEvent(dataLoadedEvent);
});
