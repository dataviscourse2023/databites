document.addEventListener('DOMContentLoaded', function() {
    // Get the current hour
    var currentHour = new Date().getHours();

    // Get the greeting element
    var greetingElement = document.getElementById('greeting');

    // Update the greeting based on the time of day
    if (currentHour >= 5 && currentHour < 12) {
        greetingElement.textContent = 'Hello, good morning!';
    } else if (currentHour >= 12 && currentHour < 18) {
        greetingElement.textContent = 'Hello, good afternoon!';
    } else {
        greetingElement.textContent = 'Hello, good evening!';
    }

    var timeElement = document.getElementById('time');

    // Update the time every second
    setInterval(function() {
        // Get the current local time
        var currentTime = new Date();

        // Format the time as HH:MM:SS
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();

        // Add leading zeros for single-digit minutes and seconds
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        // Display the formatted time
        timeElement.textContent = 'Current time: ' + hours + ':' + minutes + ':' + seconds;
    }, 1000);

    function hoverMap() {
        document.getElementById('indiaMap').classList.add('hover');
    }

    // Function to remove hover class
    function unhoverMap() {
        document.getElementById('indiaMap').classList.remove('hover');
    }

    // Attach hover events to the map container
    var mapContainer = document.querySelector('.map-container');

    mapContainer.addEventListener('mouseover', hoverMap);
    mapContainer.addEventListener('mouseout', unhoverMap);
});