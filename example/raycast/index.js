'use strict'

/**
 * Module dependencies.
 */

import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Sphere from 'axis3d/mesh/sphere'
import Mouse from 'axis3d/input/mouse'
import Plane from 'axis3d/mesh/plane'
import Frame from 'axis3d/frame'
import Box from 'axis3d/mesh/box'
import raf from 'raf'

const ctx = Context()

const camera = Camera(ctx)
const sphere = Sphere(ctx)
const frame = Frame(ctx)
const mouse = Mouse(ctx)
const box = Box(ctx)

Object.assign(window, {
  camera,
  sphere,
  frame,
  mouse,
  box,
  ctx,
})

frame(() => {
  camera({position: [0, 0, 5]}, () => {
    sphere({position: [-2, 0, 0]})
    box({position: [+2, 0, 0]})
  })
})
