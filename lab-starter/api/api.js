// The API container. Nobody on the internet can reach this one directly -
// only the web container can, over Docker's internal network.

const http = require('http');
const fs = require('fs');
const os = require('os');

const PORT = 4000;
const COUNT_FILE = '/data/count.txt';

function readCount() {
  try {
    return Number(fs.readFileSync(COUNT_FILE, 'utf8')) || 0;
  } catch {
    return 0;
  }
}

function addVisit() {
  const next = readCount() + 1;
  try {
    fs.mkdirSync('/data', { recursive: true });
    fs.writeFileSync(COUNT_FILE, String(next));
  } catch (err) {
    console.log('Could not save the count:', err.message);
  }
  return next;
}

const server = http.createServer((req, res) => {
  if (req.url === '/info') {
    const body = {
      message: 'Hello from the api container',
      container: os.hostname(),
      visits: addVisit()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`api listening on port ${PORT}`));
