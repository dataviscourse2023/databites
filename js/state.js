
import { globalState } from "./script.js";
document.getElementById("dropdownButton").addEventListener("click", function (event) {
    d3.select("#chart-container").selectAll("*").remove();

    // Check if a dropdown option was clicked
    const data = globalState.data;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    if (event.target.tagName === "A") {
        // Perform an action based on the selected option
        var selectedOption = event.target.innerText;
        console.log(selectedOption);
        if (selectedOption === 'Pie Chart') {
            // create pie chart
            const cuisineGroup = d3.group(data, d => d.cuisine);
            console.log(cuisineGroup);
            const cuisineData = Array.from(cuisineGroup, ([key, value]) => ({ cuisine: key, count: value.length }));

            // Set up the pie chart dimensions
            const width = 300;
            const height = 300;
            const radius = Math.min(width, height) / 2;

            // Set up the SVG container
            const svg = d3.select("#chart-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            // Create a pie chart layout
            const pie = d3.pie().value(d => d.count);

            // Create an arc generator
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            // Generate pie chart elements
            const arcs = svg.selectAll("arc")
                .data(pie(cuisineData))
                .enter()
                .append("g")
                .attr("class", "arc");

            // Draw each arc
            arcs.append("path")
                .attr("d", arc)
                .attr("fill", (d) => colorScale(d.data.cuisine));


        } else if (selectedOption === 'Bar Chart') {
            const cuisineGroup = d3.group(data, d => d.cuisine);
            console.log(cuisineGroup);
            const groupedCuisineData = Array.from(cuisineGroup, ([key, value]) => ({ cuisine: key, count: value.length }));

        
            // Set up the dimensions of the chart
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = 400 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;
        
            // Create SVG container
            const svg = d3.select("#chart-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        
            // Define scales
            const xScale = d3.scaleBand()
                .domain(groupedCuisineData.map(d => d.cuisine))
                .range([0, width])
                .padding(0.1);
        
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(groupedCuisineData, d => d.count)])
                .range([height, 0]);
        
            // Create x-axis
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale));
        
            // Create y-axis
            svg.append("g")
                .call(d3.axisLeft(yScale));
        
            // Create bars
            svg.selectAll(".bar")
                .data(groupedCuisineData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.cuisine))
                .attr("width", xScale.bandwidth())
                .attr("y", d => yScale(d.count))
                .attr("height", d => height - yScale(d.count))
                .attr("fill", (d, i) => colorScale(d.cuisine));
            // create bar chart
        } else if (selectedOption === 'Scatterplot') {
            const cuisineGroup = d3.group(data, d => d.cuisine);
            console.log(cuisineGroup);
            const groupedCuisineData = Array.from(cuisineGroup, ([key, value]) => ({ cuisine: key, count: value.length }));
            // sct plot
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = 400 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;
        
            // Create SVG container
            const svg = d3.select("#chart-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        
            // Define scales
            const xScale = d3.scaleBand()
                .domain(groupedCuisineData.map(d => d.cuisine))
                .range([0, width])
                .padding(0.1);
        
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(groupedCuisineData, d => d.count)])
                .range([height, 0]);
        
            // Create scatterplot points
            svg.selectAll(".point")
                .data(groupedCuisineData)
                .enter()
                .append("circle")
                .attr("class", "point")
                .attr("cx", d => xScale(d.cuisine) + xScale.bandwidth() / 2)
                .attr("cy", d => yScale(d.count))
                .attr("r", 5) // radius of the circle
                .attr("fill", (d, i) => colorScale(d.cuisine));
        
            // Create x-axis
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale));
        
            // Create y-axis
            svg.append("g")
                .call(d3.axisLeft(yScale));
        }

        // You can add more logic or function calls here based on the selected option
    }
});
