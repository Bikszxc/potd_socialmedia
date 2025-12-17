if not POTD then POTD = {} end
POTD.Sync = {}

function POTD.Sync.ProcessCommands()
    local reader = getFileReader("POTD_Input.txt", false)
    if not reader then return end

    local lines = {}
    local line = reader:readLine()
    while line do
        table.insert(lines, line)
        line = reader:readLine()
    end
    reader:close()

    if #lines == 0 then return end

    -- Clear file immediately to avoid processing duplicates (Basic approach)
    local writer = getFileWriter("POTD_Input.txt", true, false)
    if writer then
        writer:write("") -- Overwrite with empty
        writer:close()
    end

    print("POTD: Processing " .. #lines .. " commands...")

    for _, cmdLine in ipairs(lines) do
        -- Format: TYPE|PAYLOAD
        -- Lua pattern matching handles split simple 
        local sep = string.find(cmdLine, "|")
        if sep then
            local cmdType = string.sub(cmdLine, 1, sep - 1)
            local payloadStr = string.sub(cmdLine, sep + 1)
            
            -- Simple robust JSON parsing hack (or use a library if available)
            -- Assuming payload is strict JSON like {"username":"foo","faction":"bar"}
            
            if cmdType == "ADD_MEMBER" then
                -- Extract manually or via Regex to avoid JSON library dependency fail
                -- Payload: {"username":"User","faction":"FactionName"}
                
                -- Helper to extract value
                local function extract(json, key)
                    local pattern = '"' .. key .. '":"(.-)"'
                    local _, _, value = string.find(json, pattern)
                    return value
                end
                
                local username = extract(payloadStr, "username")
                local factionName = extract(payloadStr, "faction")
                
                if username and factionName then
                    local faction = Faction.getFaction(factionName)
                    if faction then
                        print("POTD: Adding " .. username .. " to " .. factionName)
                        -- Internal PZ method to add member
                        faction:addMember(username)
                        faction:syncFaction()
                    else
                        print("POTD: Faction " .. factionName .. " not found!")
                    end
                end
            end
        end
    end
end

-- Check every 1 minute (in-game time or real time? Events.EveryOneMinute is real time usually or in-game?)
-- Actually Events.OnTick is too fast. 
-- Let's use vanilla Events.EveryTenMinutes as fall back, or construct a timer.
-- For responsiveness, real-time timer is best.

local timer = 0
local function OnTick()
    timer = timer + 1
    if timer >= 300 then -- 300 ticks @ 60fps = 5 seconds? No, update rate is 60. 300/60 = 5s.
        timer = 0
        POTD.Sync.ProcessCommands()
    end
end

-- Only run on Server
if isServer() then
    Events.OnTick.Add(OnTick)
end
