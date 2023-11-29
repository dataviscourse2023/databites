const loadMatrixChartData = () => {
  const data = globalApplicationState.infos.sort((a, b) =>
    a.state.localeCompare(b.state)
  );

  const cuisines = [
    ...new Set(data.flatMap((item) => Object.keys(item.cuisineInfo))),
  ].sort((a, b) => a.localeCompare(b));
  console.log(cuisines);

  const states = data.map((item) => item.state);
  console.log(states);

  const ratingsArray = Array.from({ length: states.length }, () =>
    Array(cuisines.length).fill(0)
  );

  data.forEach((stateData, i) => {
    const stateIndex = states.indexOf(stateData.state);
    Object.entries(stateData.cuisineInfo).forEach(([cuisine, info]) => {
      const cuisineIndex = cuisines.indexOf(cuisine);
      ratingsArray[stateIndex][cuisineIndex] = parseFloat(info.averageRating);
    });
  });

  console.log(ratingsArray);

  const rows = globalApplicationState.states;
  const columns = globalApplicationState.cuisines;

  return { rows, columns, ratingsArray };
};

const createMatrixChart = () => {
  console.log("Matrix chart loaded");

  const { rows, columns, ratingsArray } = loadMatrixChartData();

  // Set up the SVG container
  const width = 800;
  const height = 600;
  const margin = { top: 100, right: 300, bottom: 0, left: 150 }; // Increased margin

  const svg = d3
    .select("#matrixchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define color scale
  const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 5]); // Assuming ratings are on a scale of 0 to 5

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Create heatmap
  svg
    .selectAll("rect")
    .data(ratingsArray)
    .enter()
    .selectAll("rect")
    .data((d, i) => d.map((value, j) => ({ row: i, column: j, value })))
    .enter()
    .append("rect")
    .attr("x", (d) => d.column * (width / columns.length))
    .attr("y", (d) => d.row * (height / rows.length))
    .attr("width", width / columns.length - 2)
    .attr("height", height / rows.length - 2)
    .style("fill", (d) => colorScale(d.value))
    .style("cursor", "pointer")
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 0);
    })
    .append("title")
    .text(
      (d) =>
        `cuisine: ${columns[d.column]}\nstate: ${rows[d.row]}\nAvg. Rating: ${
          d.value
        }\n`
    );

  // Add grid lines
  const xGrid = svg.append("g").attr("class", "x-grid").style("stroke", "#ccc");
  const yGrid = svg.append("g").attr("class", "y-grid").style("stroke", "#ccc");

  xGrid
    .selectAll("line")
    .data(columns)
    .enter()
    .append("line")
    .attr("x1", (d, i) => i * (width / columns.length))
    .attr("y1", 0)
    .attr("x2", (d, i) => i * (width / columns.length))
    .attr("y2", height);

  yGrid
    .selectAll("line")
    .data(rows)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", (d, i) => i * (height / rows.length))
    .attr("x2", width)
    .attr("y2", (d, i) => i * (height / rows.length));

  // Add row labels (states)
  svg
    .selectAll(".rowLabel")
    .data(rows)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", -margin.left / 5)
    .attr(
      "y",
      (d, i) => i * (height / rows.length) + height / (2 * rows.length) + 5
    )
    .attr("text-anchor", "end")
    .style("font-size", "12px");

  // Add column labels (cuisines)
  svg
    .selectAll(".colLabel")
    .data(columns)
    .enter()
    .append("text")
    .text((d) => d)
    .attr(
      "x",
      (d, i) => i * (width / columns.length) + width / (2 * columns.length) - 40
    )
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "start")
    .attr(
      "transform",
      (d, i) =>
        `rotate(-90, ${
          i * (width / columns.length) + width / (2 * columns.length)
        }, ${-margin.top / 2})`
    )
    .style("font-size", "12px");

  // Add legend
  const legendWidth = 200;
  const legendHeight = 20;

  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width + margin.right - 50 - legendWidth}, ${
        height - legendHeight * 2
      })`
    );

  const legendScale = d3.scaleLinear().domain([0, 5]).range([0, legendWidth]);

  // Add gradient color to legend
  const gradient = legend
    .append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  gradient
    .selectAll("stop")
    .data(legendScale.ticks(6))
    .enter()
    .append("stop")
    .attr("offset", (d) => legendScale(d) / legendWidth)
    .attr("stop-color", colorScale);

  // Add rectangle for the gradient
  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legendGradient)");

  // Add legend axis
  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendScale).ticks(6))
    .select(".domain")
    .remove();

  // Add "Ratings" text
  legend
    .append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Ratings");
};

document.addEventListener("dataLoaded", createMatrixChart);
