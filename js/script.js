async function loadData() {
  const swiggyData = await d3.csv("./data/swiggy.csv");
  return { swiggyData };
}

const globalApplicationState = {
  cities: [],
  states: [],
  cuisines: [],
  selectedStates: [],
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

loadData().then((loadedData) => {
  globalApplicationState.swiggyData = loadedData.swiggyData;
  globalApplicationState.cities = getUniqueValuesByKey("city");
  globalApplicationState.cuisines = getUniqueValuesByKey("cuisine").sort();
  globalApplicationState.states = getUniqueValuesByKey("state")
    .filter((d) => d != "N/A")
    .sort();

  console.log("Here is the imported data:", loadedData.swiggyData);
  console.log("Here are the unique cities:", globalApplicationState.cities);
  console.log("Here are the unique cuisines:", globalApplicationState.cuisines);
  console.log("Here are the unique states:", globalApplicationState.states);

  const dataLoadedEvent = new Event("dataLoaded");
  document.dispatchEvent(dataLoadedEvent);

  /*
  const worldMap = new MapVis(globalApplicationState);
  const lineChart = new LineChart(globalApplicationState);

  globalApplicationState.worldMap = worldMap;
  globalApplicationState.lineChart = lineChart;
  */
});
