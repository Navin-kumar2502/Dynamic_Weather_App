const express = require('express');
const requests = require('requests');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8000;

// Read the HTML file
const homeFile = fs.readFileSync('index.html', 'UTF-8');

// Function to replace placeholders with actual values
const replaceVal = (tempVal, orgVal) => {
    let tempe = tempVal.replace("{%tempval%}", orgVal.main.temp);
    tempe = tempe.replace("{%tempmin%}", orgVal.main.temp_min);
    tempe = tempe.replace("{%tempmax%}", orgVal.main.temp_max);
    tempe = tempe.replace("{%location%}", orgVal.name);
    tempe = tempe.replace("{%country%}", orgVal.sys.country);
    tempe = tempe.replace("{%tempstatus%}", orgVal.weather[0].main);
    return tempe;
};

// Function to display error
const displayError = (res, errorMessage) => {
    const errorHTML = `<div style="text-align: center; margin-top: 50px;">
        <h2>${errorMessage}</h2>
        <a href="/">Go back to home</a>
    </div>`;
    res.send(errorHTML);
};

// Route to handle the request
app.get('/', (req, res) => {
    const searchCity = req.query.city || 'Mumbai';
    const apiKey = 'cbac6b09413a5ade3642f3e727740c3b'; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&appid=${apiKey}`;

    requests(apiUrl)
        .on('data', (chunk) => {
            const objdata = JSON.parse(chunk);
            if (objdata.cod === '404') {
                displayError(res, 'City not found. Please enter a valid city name.');
            } else {
                const realTimeData = replaceVal(homeFile, objdata);
                res.send(realTimeData);
            }
        })
        .on('error', (err) => {
            console.error('Error:', err.message);
            displayError(res, 'Internal Server Error. Please try again later.');
        });
});

// Serve static files
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
