const fs = require('fs');
const path = require('path');
const http = require('http');

// CONFIG
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, 'profiles/pzserver/Lua/POTD_Log.txt');
const INPUT_FILE_PATH = process.env.INPUT_FILE_PATH || path.join(__dirname, 'profiles/pzserver/Lua/POTD_Input.txt');
const API_URL = process.env.API_URL || 'http://66.118.234.45:3000';
const API_KEY = process.env.PZ_API_KEY || 'thisisatest';

console.log(`Starting POTD Bridge...`);
console.log(`Watching: ${LOG_FILE_PATH}`);
console.log(`Writing to: ${INPUT_FILE_PATH}`);
console.log(`Target: ${API_URL}`);

// Ensure input file exists
if (!fs.existsSync(INPUT_FILE_PATH)) {
    try {
        const dir = path.dirname(INPUT_FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(INPUT_FILE_PATH, "");
    } catch (e) {
        console.error("Error creating input file:", e);
    }
}

// ... Log file creation ...

// COMMAND POLLING LOOP
setInterval(() => {
    pollCommands();
}, 10000); // Check every 10 seconds

function pollCommands() {
    const baseUrl = new URL(API_URL);
    const options = {
        hostname: baseUrl.hostname,
        port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
        path: '/api/pz/pending-commands',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    };

    const req = http.request(options, (res) => {
        if (res.statusCode !== 200) return;

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const commands = JSON.parse(data);
                if (Array.isArray(commands) && commands.length > 0) {
                    console.log(`[CMD] Received ${commands.length} commands.`);
                    processCommands(commands);
                }
            } catch (e) {
                console.error("Failed to parse commands:", e);
            }
        });
    });

    req.on('error', (e) => { /* Only log critical network fails if needed */ });
    req.end();
}

function processCommands(commands) {
    const idsToAck = [];
    const linesToWrite = [];

    commands.forEach(cmd => {
        // Format for Lua: CMD|TYPE|PAYLOAD\n
        // e.g. CMD|ADD_MEMBER|{"username":"SafeGuard","faction":"The Saviors"}
        // Actually, let's keep it simple: TYPE|PAYLOAD
        linesToWrite.push(`${cmd.type}|${cmd.payload}`);
        idsToAck.push(cmd.id);
    });

    if (linesToWrite.length > 0) {
        try {
            // Append to file
            const content = linesToWrite.join('\n') + '\n';
            fs.appendFileSync(INPUT_FILE_PATH, content);
            console.log(`[CMD] Wrote ${linesToWrite.length} commands to input file.`);

            // ACK
            sendToApi('/api/pz/pending-commands', { commandIds: idsToAck });
        } catch (e) {
            console.error("Failed to write to input file:", e);
        }
    }
}

// ... TAIL LOGIC ... (keep existing)
const { spawn } = require('child_process');
const tail = spawn('tail', ['-F', '-n', '0', LOG_FILE_PATH]);

tail.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) processLine(cleanLine);
    });
});
// ... 

function processLine(line) {
    if (!line) return;

    if (line.startsWith("AUTH|")) {
        const parts = line.split("|");
        if (parts.length >= 3) {
            const username = parts[1].trim();
            const code = parts[2].trim();
            console.log(`[AUTH] Syncing code for ${username}`);
            sendToApi('/api/pz/add-code', { username, code });
        }
    } else if (line.startsWith("STATS|")) {
        const payload = line.substring(6);
        try {
            const data = JSON.parse(payload);
            // console.log(`[STATS] Syncing stats for ${data.username}`); // Reduce spam
            sendToApi('/api/pz/update-stats', {
                username: data.username,
                charName: data.charName,
                stats: data.stats,
                faction: data.faction, // NEW field
                isLeader: data.isLeader // NEW field
            });
        } catch (e) {
            console.error("Failed to parse stats JSON:", e);
        }
    }
}

function sendToApi(endpoint, data) {
    // ... (Keep existing implementation)
    const postData = JSON.stringify(data);
    const baseUrl = new URL(API_URL);
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
        } else {
            // console.log(`[API] Success (200) on ${endpoint}`); 
            // Silence success logs to keep console clean for polling
        }
    });

    req.on('error', (e) => { console.error(`[API] Request failed: ${e.message}`); });
    req.write(postData);
    req.end();
}
