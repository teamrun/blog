fs = require 'fs'
path = require 'path'
gm = require 'gm'
imageMagick = gm.subClass({ imageMagick: true });

v = './fixture/vertical.jpg'
h = './fixture/horizontal.jpg'
imgArr = [ v, h ]

# for img in imgArr
#   out = "#{path.basename(img, path.extname(img))}_out#{path.extname(img)}";
#   gm( path.join(__dirname, img) )
#     .resize(400)
#     .write( out, (err) ->
#       console.log(if err then "#{out} err: #{err}" else "#{out} done")
#     );


# n = 0
# # for n in [100..195] by 5
# gm './vertical_out.jpg'
#   .blur 19,10
#   .write "./vertical_out_blur_#{n}.jpg", (err) ->
#     console.log if err then "err: #{err}" else "done"

gm(v)
  .identify (err, data) ->
    console.log err
    console.log data