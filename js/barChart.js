const createBarChart = () => {
  console.log("Barchart loaded");

  const barColor = "#C0392B";
  const svgWidth = window.innerWidth * 0.6;
  const svgHeight = window.innerHeight * 0.6;
  const margin = { top: 20, right: 20, bottom: 150, left: 150 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const cuisineDropdown = document.getElementById("cuisineDropdown");
  const selectedCuisine = document.getElementById("selectedCuisine");

  let option = document.createElement("option");
  option.value = "None";
  option.textContent = "None";
  cuisineDropdown.appendChild(option);

  // option = document.createElement("option");
  // option.value = "All";
  // option.textContent = "All";
  // cuisineDropdown.appendChild(option);

  for (const cuisine of globalApplicationState.cuisines) {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineDropdown.appendChild(option);
  }

  if (cuisineDropdown.options.length > 0) {
    selectedValue = cuisineDropdown.options[0].value;
    selectedCuisine.textContent = selectedValue;
  }

  const countArray = globalApplicationState.cuisineRestaurantCount;

  console.log(countArray);

  const initializeBarChart = (data) => {
    svg = d3
      .select("#barchart")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map((d) => d.state));

    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 100)
      .style("text-anchor", "middle")
      .text("States");

    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", margin.left - 75)
      .style("text-anchor", "middle")
      .text("Number of Restaurants");

    svg.selectAll(".x-axis-label, .y-axis-label").attr("class", "axis-label");

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
  };

  const renderTotalBarChart = (data) => {
    // d3.select(".legends").selectAll("*").remove();

    y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, (d) => d.totalCuisines)]);

    g.select(".y-axis").remove();
    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    const bars = g.selectAll(".bar").data(data);

    bars.exit().transition().duration(500).attr("height", 0).remove();

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.state))
      .attr("width", x.bandwidth())
      .attr("fill", barColor)
      .attr("stroke", "#36454F")
      .attr("stroke-width", 2)
      .merge(bars)
      .transition()
      .duration(500)
      .attr("y", (d) => y(d.totalCuisines))
      .attr("height", (d) => height - y(d.totalCuisines));

    svg
      .selectAll(".bar")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#36454F").attr("stroke-width", 2);
      })
      .append("title")
      .text((d) => `Total Restaurants: ${d.totalCuisines}`);
  };

  const renderSelectedBarChart = (data, selectedCuisine) => {
    data.map((d) => {
      if (!(selectedCuisine in d.cuisines)) {
        d.cuisines[selectedCuisine] = 0;
      }
      return d;
    });

    //d3.select(".legends").selectAll("*").remove();

    y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, (d) => d.cuisines[selectedCuisine])]);

    g.select(".y-axis").remove();
    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    const bars = g.selectAll(".bar").data(data);

    bars.exit().transition().duration(500).attr("height", 0).remove();

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.state))
      .attr("width", x.bandwidth())
      .attr("fill", barColor)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .merge(bars)
      .transition()
      .duration(500)
      .attr("y", (d) => y(d.cuisines[selectedCuisine]))
      .attr("height", (d) => height - y(d.cuisines[selectedCuisine]));

    svg
      .selectAll(".bar")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 1);
      })
      .select("title")
      .text(
        (d) =>
          `Cuisine: ${selectedCuisine}\n Total Restaurants: ${d.cuisines[selectedCuisine]}`
      );
  };

  /*
  const renderStackedBarChart = (data) => {
    const stackdata = data.map((item) => {
      return {
        state: item.state,
        cuisines: Object.keys(item.cuisines).map((cuisine) => ({
          name: cuisine,
          count: item.cuisines[cuisine],
        })),
        totalCuisines: item.totalCuisines,
      };
    });

    stackdata.forEach((d) => {
      let y0 = 0;
      d.cuisines = d.cuisines.map((cuisine) => {
        const y1 = y0 + cuisine.count;
        return { name: cuisine.name, count: cuisine.count, y0, y1 };
      });
    });

    console.log(stackdata);

    const cuisineNames = stackdata[0].cuisines.map((cuisine) => cuisine.name);

    const colorScale = d3
      .scaleOrdinal()
      .domain(cuisineNames)
      .range(d3.schemeCategory10);

    d3.select(".legends").selectAll("*").remove();

    cuisineNames.forEach((cuisine) => {
      const legendItem = d3.select(".legends").append("div");

      legendItem.style("display", "flex").style("align-items", "center");
      legendItem
        .append("div")
        .style("background-color", colorScale(cuisine))
        .attr("class", "legend-color")
        .style("width", "20px")
        .style("height", "20px")
        .style("margin-right", "5px");

      legendItem.append("span").text(cuisine);
    });

    y = d3
      .scaleLinear()
      .domain([0, d3.max(stackdata, (d) => d3.max(d.cuisines, (c) => c.y1))])
      .nice()
      .range([height, 0]);

    g.select(".y-axis").remove();
    g.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    g.selectAll(".bar").remove();
    const bars = g
      .selectAll(".bar")
      .data(stackdata)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", (d) => `translate(${x(d.state)},0)`);

    bars
      .selectAll("rect")
      .data((d) => d.cuisines)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.y1))
      .attr("height", (d) => y(d.y0) - y(d.y1))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => colorScale(d.name))
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");
      })
      .append("title")
      .text((d) => `Cuisine: ${d.name}\n Total Restaurants: ${d.count}`);
  };
  */
  initializeBarChart(countArray);
  renderTotalBarChart(countArray);

  cuisineDropdown.addEventListener("change", function () {
    const selectedValue = cuisineDropdown.value;
    selectedCuisine.textContent = selectedValue;

    // if (selectedValue === "All") renderStackedBarChart(countArray);
    if (selectedValue === "None") renderTotalBarChart(countArray);
    else renderSelectedBarChart(countArray, selectedValue);
  });
};

document.addEventListener("dataLoaded", createBarChart);
