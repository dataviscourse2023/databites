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

    // Function to remove hover class
    var objectElement = document.getElementById('indiaMap');
    objectElement.addEventListener('load', function () {
        // Get the SVG document within the object
        var svgDoc = objectElement.contentDocument;
        // Get all paths in the SVG
        var paths = svgDoc.querySelectorAll('path');

        // Add a click event listener to each path
        // paths.forEach(function (path) {
        //     path.addEventListener('mousedown', function () {
        //         // Toggle the selection by changing the stroke color
        //         if (path.getAttribute('fill') === 'black') {
        //             // Change to a selected fill color
        //             path.setAttribute('fill', 'red');
        //         } else {
        //             // Change back to the original fill color
        //             path.setAttribute('fill', 'black');
        //         }
        //     });
        // });

        paths.forEach(function (path) {
            path.addEventListener('mouseenter', function () {
                // Change color on hover
                path.setAttribute('fill', 'red');
            });

            path.addEventListener('mouseleave', function () {
                // Change back to the original color on mouse leave
                path.setAttribute('fill', 'black');
            });

            path.addEventListener('click', function () {
                // Open a new page when a path is clicked
                localStorage.setItem('selectedPathIndex', path.getAttribute('d'));
                window.location.href = 'pages/state.html'; // Replace 'new_page.html' with your desired URL
            });
        });
    });

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
});

// Function to redirect to a new page based on the path ID

var paths = document.querySelectorAll('#my-svg path');

    // Add a click event listener to each path
    paths.forEach(function (path) {
      path.addEventListener('click', function () {
        // Toggle the selection by changing the stroke color
        if (path.getAttribute('stroke') === 'black') {
          path.setAttribute('stroke', 'red'); // Change to a selected color
        } else {
          path.setAttribute('stroke', 'black'); // Change back to the original color
        }
      });
    });

    function toggleDarkMode() {
        const body = document.body;
    
        // Toggle the 'dark-mode' class on the body
        body.classList.toggle('dark-mode');
    
        // Save the user's preference in localStorage
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        if (isDarkMode) {
            toggleSvgColor('#ffffff');
        }
        else {
            toggleSvgColor('#000000');
        }
    }

    function toggleSvgColor(color) {
        const svg = document.getElementById('indiaMap');
        svg.contentDocument.querySelectorAll('path').forEach(path => {
            path.style.fill = color;
        });
    }