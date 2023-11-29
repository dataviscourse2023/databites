//custom event fired from script.js

let selectedValue;
let top10RestaturantsData;

document.addEventListener("dataLoaded", function () {
  console.log("top10restaurants  loaded");
  const stateDropdown = document.getElementById("indiaMapDropdown");

  if (stateDropdown.options.length > 0) {
    selectedValue = stateDropdown.options[0].value;
  }

  renderTop10Restaurants(); // To render first time

  stateDropdown.addEventListener("change", function () {
    selectedValue = stateDropdown.value;
    renderTop10Restaurants();
  });
});

function renderTop10Restaurants() {
  top10RestaturantsData = GetTop10Restaturants().map((restaurant) => {
    return {
      name: restaurant.name,
      rating: restaurant.rating,
      ratingCount: restaurant.rating_count,
      city: restaurant.city,
      cuisine: restaurant.cuisine,
    };
  });
  console.log(top10RestaturantsData);

  //LoadSelectedState(); //TODO: Aadithya
  //PlotTop10Restaurants(); //TODO: Aadithya
}

const GetTop10Restaturants = () => {
  const selectedStateRestaurants = globalApplicationState.swiggyData.filter(
    (restaurant) => {
      return restaurant.state === selectedValue;
    }
  );

  // priority queue
  const top10Restaurants = [];
  const top10Ratings = new Array(10).fill(-1);

  selectedStateRestaurants.forEach((restaurant) => {
    const rating = restaurant.rating;

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

  return top10Restaurants;
};

// dummy data generator
/*
const dummyData = [];

const states = ["Tamil Nadu", "Andhra Pradesh", "Kerala"];
const cuisines = ["Indian", "Chinese", "Italian", "Sweets"];

for (let i = 0; i < 30; i++) {
  const randomState = states[Math.floor(Math.random() * states.length)];
  const randomRating = Math.floor(Math.random() * 10) + 1;
  const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

  const restaurant = {
    state: randomState,
    rating: randomRating,
    cuisine: randomCuisine,
  };

  dummyData.push(restaurant);
}

console.log(dummyData);
*/
