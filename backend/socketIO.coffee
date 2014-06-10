# socket = require("socket.io")
# server = require("http").createServer(app)
# io = require("socket.io").listen(server)
# server.listen config.port
# io.sockets.on "connection", (socket) ->
#   console.log "a new connection established"
#   socket.emit "welcome",
#     text: "hello, you ~"

#   socket.on "fileBinary", (data) ->
#     console.log "---------------------------"
#     console.log data
#     return

#   socket.on "ping", (data) ->
#     console.log data
#     socket.emit "pong",
#       text: "yes, i am here"

#     return

#   return

