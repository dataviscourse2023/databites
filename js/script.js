// main.js

let data = [];

function LoadData() {
  const dataFile = "swiggy";

  return d3.csv(`../data/${dataFile}.csv`)
    .then((dataOutput) => {
      data = dataOutput.map((d) => ({
        id: d.id,
        name: d.name,
        city: d.city,
        rating: d.rating,
        rating_count: d.rating_count,
        cost: d.cost,
        cuisine: d.cuisine,
        lic_no: d.lic_no,
        link: d.link,
        address: d.address,
        menu: d.menu,
      }));

      console.log(data);

      return data;  // Return the data to the caller
    })
    .catch((e) => {
      console.log(e);
      alert("Error!");
    });
}

const globalState = {
  data: []
};

document.addEventListener("DOMContentLoaded", function () {
  // Call LoadData and wait for the promise to resolve
  LoadData().then((data) => {
    globalState.data = data;
    // Now, globalState.data is populated with the data from LoadData
  });
});

export { globalState };  // Export globalState at the top level of the module
