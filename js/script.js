let data = [];

function LoadData() {
  const dataFile = "swiggy"; //d3.select("#dataset").property("value");

  d3.csv(`data/${dataFile}.csv`)
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
    })
    .catch((e) => {
      console.log(e);
      alert("Error!");
    });
}
