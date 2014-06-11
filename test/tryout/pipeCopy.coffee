fs = require 'fs'

v = '../fixture/vertical.jpg'
h = '../fixture/horizontal.jpg'

size = 0

read = fs.createReadStream v
write = fs.createWriteStream './out.jpg'

read.pipe( write )
read.on 'data', (data) ->
  # console.log data.length
  size += data.length

read.on 'close', () ->
  console.log 'done'
  console.log size/1024/1024