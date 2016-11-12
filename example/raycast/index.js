'use strict'

/**
 * Module dependencies.
 */

import { Quaternion } from 'axis3d/math'
import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Sphere from 'axis3d/mesh/sphere'
import Mouse from 'axis3d/input/mouse'
import Plane from 'axis3d/mesh/plane'
import Frame from 'axis3d/frame'
import quat from 'gl-quat'
import Box from 'axis3d/mesh/box'
import Ray from 'axis3d/ray'
import raf from 'raf'

const ctx = Context()

const rotation = new Quaternion()
const camera = Camera(ctx)
const frame = Frame(ctx)
const mouse = Mouse(ctx)
const ray = Ray(ctx, {camera})

const objects = Array(5).fill(0).map((_, i) => {
  if (i % 2) {
    return Box(ctx)({
      position: [i, -i, i],
      color: [0, 1, 0, 1],
    })
  } else {
    return Sphere(ctx, {radius: 1})({
      position: [-i, i, -i],
      color: [0, 1, 0, 1],
    })
  }
})

Object.assign(window, {
  camera,
  frame,
  mouse,
  ray,
  ctx,
})

frame(({time}) => {
  const position = [0, 0, 10]
  quat.setAxisAngle(rotation, [0, 1, 0], 0.5*time)
  camera({ rotation, position }, () => {
    let hit = false
    for (let object of objects) {
      if (ray(mouse, object)) {
        console.log('hit')
        object({
          scale: [1.1, 1.1, 1.1],
          color: [0.2, 0.5, 0.5, 1]
        })
        break
      }
    }

    for (let object of objects) {
      object({
        scale: [1, 1, 1],
        color: [0, 1, 0, 1],
      })
    }
  })
})
