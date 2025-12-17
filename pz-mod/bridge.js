const fs = require('fs');
const path = require('path');
const http = require('http');

// CONFIG
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, 'profiles/pzserver/Lua/POTD_Log.txt'); // Adjust for actual server path
const API_URL = process.env.API_URL || 'http://66.118.234.45:3000';
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

// TAIL LOGIC (ROBUST POLLING)
const { spawn } = require('child_process');

// TAIL LOGIC (NATIVE TAIL - LINUX ONLY)
// We use 'tail -F' (capital F) to follow by name and retry if file is recreated/truncated
const tail = spawn('tail', ['-F', '-n', '0', LOG_FILE_PATH]);

tail.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) processLine(cleanLine);
    });
});

tail.stderr.on('data', (data) => {
    console.error(`[TAIL ERROR]: ${data}`);
});

console.log("Tail process started.");

function processLine(line) {
    if (!line) return;

    // Format: TYPE|PAYLOAD
    // Types: AUTH, STATS

    if (line.startsWith("AUTH|")) {
        const parts = line.split("|");
        if (parts.length >= 3) {
            const username = parts[1].trim();
            const code = parts[2].trim(); // CRITICAL: Trim \r or \n
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

    // Parse the full API URL configured at top
    const baseUrl = new URL(API_URL); // e.g. http://66.118.234.45:3000

    const options = {
        hostname: baseUrl.hostname,
        port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
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
        } else {
            console.log(`[API] Success (200) on ${endpoint}`);
        }
    });

    req.on('error', (e) => {
        console.error(`[API] Request failed: ${e.message}`);
    });

    req.write(postData);
    req.end();
}
