if not POTD then POTD = {} end
POTD.Stats = {}

-- Helper to write to log
function POTD.Stats.Log(message)
    local file = getFileWriter("POTD_Log.txt", true, false)
    if file then
        file:write(message .. "\r\n")
        file:close()
    end
end

function POTD.Stats.Collect()
    local players = getOnlinePlayers()
    if players then
        for i = 0, players:size() - 1 do
            local player = players:get(i)
            local username = player:getUsername()
            
            -- Prepare Stats Object
            local stats = {
                username = username,
                charName = player:getDescriptor():getForename() .. " " .. player:getDescriptor():getSurname(),
                zombiesKilled = player:getZombieKills(),
                hoursSurvived = player:getHoursSurvived(),
                profession = player:getDescriptor():getProfession(),
                traits = {} -- Populate below
            }
            
            -- Traits
            local traits = player:getTraits()
            for j = 0, traits:size() - 1 do
                table.insert(stats.traits, traits:get(j))
            end
            
            -- Convert to JSON
            -- PZ Lua doesn't have a built-in JSON library exposed by default easily, 
            -- so we construct it manually since it's simple structure.
            -- Be careful with string escaping if names have quotes.
            
            local json = "{"
            json = json .. '"username":"' .. stats.username .. '",'
            json = json .. '"charName":"' .. stats.charName .. '",'
            json = json .. '"stats":{'
            json = json .. '"zombiesKilled":' .. stats.zombiesKilled .. ','
            json = json .. '"hoursSurvived":' .. stats.hoursSurvived .. ','
            json = json .. '"profession":"' .. stats.profession .. '",'
            
            json = json .. '"traits":['
            for k, v in ipairs(stats.traits) do
                json = json .. '"' .. v .. '"'
                if k < #stats.traits then json = json .. ',' end
            end
            json = json .. ']'
            
            json = json .. '}}'
            
            -- Log it
            POTD.Stats.Log("STATS|" .. json)
        end
    end
end

-- Run every 10 in-game minutes? Or real time?
-- Events.EveryTenMinutes is in-game. That might be too frequent for API calls if time speed is high.
-- Events.EveryHours is better.
Events.EveryHours.Add(POTD.Stats.Collect)

-- Also on Player Death?
function POTD.Stats.OnPlayerDeath(player)
    -- Force a collection for this player?
    -- For now rely on periodic updates, but ideally we capture death immediately.
end
