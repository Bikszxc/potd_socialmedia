if not POTD then POTD = {} end
POTD.AccountLinking = {}
POTD.AccountLinking.Codes = {}

-- Function to generate a random code
local function generateCode()
    local charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    local code = ""
    for i = 1, 6 do
        local rand = ZombRand(1, #charset + 1)
        code = code .. string.sub(charset, rand, rand)
    end
    return code
end

local function onClientCommand(module, command, player, args)
    if module == "POTD" and command == "LinkAccount" then
        local username = player:getUsername()
        local code = generateCode()
        
        -- Store code (in memory for now, persistent storage would be better later)
        POTD.AccountLinking.Codes[username] = code
        print("POTD: Generated link code for " .. username .. ": " .. code)

        -- Log to file for Bridge
        local file = getFileWriter("POTD_Log.txt", true, false)
        if file then
            file:write("AUTH|" .. username .. "|" .. code .. "\r\n")
            file:close()
        end
        
        -- Send code back to client
        local args = { code = code }
        sendServerCommand(player, "POTD", "ReceiveLinkCode", args)
    end
end

Events.OnClientCommand.Add(onClientCommand)
