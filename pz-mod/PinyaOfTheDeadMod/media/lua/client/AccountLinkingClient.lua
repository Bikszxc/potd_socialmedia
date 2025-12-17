if not POTD then POTD = {} end

-- Handle responses from Server
local function onServerCommand(module, command, args)
    if module == "POTD" and command == "ReceiveLinkCode" then
        local code = args.code
        -- Display the code to the user
        local playerDetails = getPlayer():getDescriptor()
        local playerName = playerDetails:getForename() .. " " .. playerDetails:getSurname()
        
        -- Use a modal dialog
        local modal = ISModalDialog:new(0,0, 350, 150, "Pinya of The Dead Linking Code:\n\n" .. code .. "\n\nEnter this code on the website to link your account.", true, nil, nil)
        modal:initialise()
        modal:addToUIManager()
    end
end

Events.OnServerCommand.Add(onServerCommand)

-- Function to trigger linking (could be bound to a key or button later)
function POTD.RequestLink()
    local player = getPlayer()
    if player then
        sendClientCommand(player, "POTD", "LinkAccount", {})
    end
end

-- Hook into Context Menu (Right click on player)
local function onFillWorldObjectContextMenu(player, context, worldObjects, test)
    local playerObj = getSpecificPlayer(player)
    if not playerObj then return end
    
    context:addOption("Link Account (POTD)", worldObjects, function() POTD.RequestLink() end)
end

Events.OnFillWorldObjectContextMenu.Add(onFillWorldObjectContextMenu)
