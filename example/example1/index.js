'use strict';

import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Box from 'axis3d/mesh/box'
import Frame from 'axis3d/frame'
import quat from 'gl-quat'

const ctx = Context()

// set camera -5 on z-axis for small zoom out
const camera = Camera(ctx, {position: [0, 0, -5]})
const frame = Frame(ctx)

const rotation = [0, 0, 0, 1]

const box = Box(ctx)
const box2 = Box(ctx)

// window.camera = camera

frame(({time}) => {

  camera(() => {
    // call box
    box()
    //change rotation, on x & y axis, not z, 
    quat.setAxisAngle(rotation, [0, 1, 0], 0.5*(time))
    box2({rotation, position: [2, 0, 2]})
  })
})