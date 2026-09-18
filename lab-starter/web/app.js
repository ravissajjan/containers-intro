// The web container. It talks to the api container using the name "api" -
// Docker turns that name into an IP address for us.

const http = require('http');
const fs = require('fs');
const os = require('os');

const PORT = 3000;
const API_URL = process.env.API_URL || 'http://api:4000/info';

async function askApi() {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (err) {
    return { error: 'Could not reach the api container: ' + err.message };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  if (req.url === '/api') {
    const info = await askApi();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(info));
  }

  const page = fs
    .readFileSync(__dirname + '/index.html', 'utf8')
    .replace('__CONTAINER__', os.hostname());
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(page);
});

server.listen(PORT, () => console.log(`web listening on port ${PORT}`));
