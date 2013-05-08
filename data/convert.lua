#!/bin/env lua

local json = require ("dkjson")

local file = nil
local data = assert(loadfile("aav.lua"))()
local output = json.encode(atroxArenaViewerData, {indent = true})

file = io.open("data.json", "w")
file:write(output)
file:close()
