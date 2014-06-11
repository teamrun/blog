ExifImage = require('exif').ExifImage

v = '../fixture/vertical.jpg'
h = '../fixture/horizontal.jpg'
wrongFile = 'efgaslg.jpg'

try
  new ExifImage( {image: v}, (err, data) ->
    console.log if err then err else data

    # console.log data.exif.MakerNote.toString('utf-8')
  )
catch err
  console.log "catched err: #{err}"