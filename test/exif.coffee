ExifImage = require('exif').ExifImage

v = './fixture/vertical.jpg'
h = './fixture/horizontal.jpg'
wrongFile = 'efgaslg.jpg'

try
  new ExifImage( {image: wrongFile}, (err, data) ->
    console.log if err then err else data
  )
catch err
  console.log "catched err: #{err}"