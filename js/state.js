
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the stored SVG path data from localStorage
    var selectedPathData = localStorage.getItem('selectedPathData');

    if (selectedPathData) {
        // Create a new SVG element with the selected path
        var newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        newSvg.setAttribute('width', '100%');
        newSvg.setAttribute('height', '100%');

        var newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        newPath.setAttribute('d', selectedPathData);
        newPath.setAttribute('fill', 'black'); // Set the desired fill color

        newSvg.appendChild(newPath);

        // Append the new SVG to the container
        document.querySelector('.selected-state-map').appendChild(newSvg);
    } else {
        // Handle the case where no path data is stored
        console.log('No path data stored.');
    }
});

