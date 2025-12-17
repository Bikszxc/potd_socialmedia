const fs = require('fs');
const path = require('path');
const http = require('http');

// CONFIG
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, 'profiles/pzserver/Lua/POTD_Log.txt'); // Adjust for actual server path
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.PZ_API_KEY || 'thisisatest';

console.log(`Starting POTD Bridge...`);
console.log(`Watching: ${LOG_FILE_PATH}`);
console.log(`Target: ${API_URL}`);

// Ensure file exists or create it to avoid errors
if (!fs.existsSync(LOG_FILE_PATH)) {
    try {
        const dir = path.dirname(LOG_FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(LOG_FILE_PATH, "");
        console.log("Created empty log file.");
    } catch (e) {
        console.error("Error creating log file:", e);
    }
}

// TAIL LOGIC
let currentSize = fs.statSync(LOG_FILE_PATH).size;

fs.watchFile(LOG_FILE_PATH, { interval: 1000 }, (curr, prev) => {
    if (curr.size > prev.size) {
        const stream = fs.createReadStream(LOG_FILE_PATH, {
            start: prev.size,
            end: curr.size
        });

        stream.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            lines.forEach(line => processLine(line.trim()));
        });

        currentSize = curr.size;
    } else if (curr.size < prev.size) {
        // File truncated/rotated
        currentSize = curr.size;
        console.log("Log file truncated.");
    }
});

function processLine(line) {
    if (!line) return;

    // Format: TYPE|PAYLOAD
    // Types: AUTH, STATS

    if (line.startsWith("AUTH|")) {
        const parts = line.split("|");
        if (parts.length >= 3) {
            const username = parts[1];
            const code = parts[2];
            console.log(`[AUTH] Syncing code for ${username}`);
            sendToApi('/api/pz/add-code', { username, code });
        }
    } else if (line.startsWith("STATS|")) {
        const payload = line.substring(6); // Remove "STATS|"
        try {
            const data = JSON.parse(payload);
            console.log(`[STATS] Syncing stats for ${data.username}`);
            sendToApi('/api/pz/update-stats', {
                username: data.username,
                charName: data.charName,
                stats: data.stats /* { zombiesKilled, ... } */
            });
        } catch (e) {
            console.error("Failed to parse stats JSON:", e);
        }
    }
}

function sendToApi(endpoint, data) {
    const postData = JSON.stringify(data);

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    const req = http.request(options, (res) => {
        if (res.statusCode !== 200) {
            console.error(`[API] Error ${res.statusCode} on ${endpoint}`);
            // res.setEncoding('utf8');
            // res.on('data', (chunk) => console.log(chunk));
        }
    });

    req.on('error', (e) => {
        console.error(`[API] Request failed: ${e.message}`);
    });

    req.write(postData);
    req.end();
}
