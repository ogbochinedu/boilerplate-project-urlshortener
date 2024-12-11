require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const url = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URL mappings
let urlDatabase = {};
let idCounter = 1;

// Helper function to validate a URL
function isValidUrl(inputUrl) {
    try {
        const parsedUrl = new URL(inputUrl);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

// POST route to create a shortened URL
app.post('/api/shorturl', (req, res) => {
  console.log(req,"request..")
    const originalUrl = req.body.url;

    // Validate the URL format
    if (!isValidUrl(originalUrl)) {
        return res.json({ error: 'invalid url' });
    }

    // Check DNS validity
    const hostname = new URL(originalUrl).hostname;
    dns.lookup(hostname, (err) => {
        if (err) {
            return res.json({ error: 'invalid url' });
        }

        // Save the URL and generate a short URL
        const shortUrl = idCounter++;
        urlDatabase[shortUrl] = originalUrl;

        res.json({
            original_url: originalUrl,
            short_url: shortUrl
        });
    });
});

// GET route to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
    const shortUrl = parseInt(req.params.short_url);

    // Check if the short URL exists
    const originalUrl = urlDatabase[shortUrl];
    if (!originalUrl) {
        return res.json({ error: 'No short URL found for the given input' });
    }

    // Redirect to the original URL
    res.redirect(originalUrl);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
