'use strict';

import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Plane from 'axis3d/mesh/plane'
import Box from 'axis3d/mesh/box'
import Sphere from 'axis3d/mesh/sphere'
import Frame from 'axis3d/frame'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

const ctx = Context()
const camera = Camera(ctx, {position: [0, 0, -20]})
const frame = Frame(ctx)

const centroid = Box(ctx)
const rotation = [0, 0, 0, 1]

const nodesNum = 40
const nodes = []

window.camera = camera
window.centroid = centroid

for (let i = 0; i < nodesNum; i++) {
  // even
  if (0 == i % 2) {
    nodes.push(Sphere(ctx, {
      color: [0, (i * 16)/255, 0, 1]
    }))
  } else {
    nodes.push(Box(ctx, {
      color: [0, 0, (i * 16)/255, 1]
    }))
  }
}

frame(({time}) => {
  //  change rotation, on x & y axis, not z, 
  quat.setAxisAngle(rotation, [1, 1, 0], 0.5*Math.sin(time))

  camera(() => {
    centroid({color: [0, 1, time % 255, 1,], scale: [0.25, 0.25, 0.25], rotation}, () => {
      for (let i = 0; i < nodesNum; i++) {
        const node = nodes[i]
        const nodeRotation = [0, 0, 0, 1]
        let position = []
        const t = time
        const r = t/2-Math.sin(2*t)/4

        if (0 == i % 2) {
          position = [i*Math.cos(i), -i*Math.sin(i), i*Math.cos(i)]
          vec3.rotateX(position, position, centroid.position, r)
          vec3.rotateY(position, position, centroid.position, r)
          vec3.rotateZ(position, position, centroid.position, r)
        } else {
          position = [-i*Math.cos(i), i*Math.sin(i), -i*Math.cos(i)]
          vec3.rotateX(position, position, centroid.position, -r)
          vec3.rotateY(position, position, centroid.position, -r)
          vec3.rotateZ(position, position, centroid.position, -r)
        }

        quat.setAxisAngle(nodeRotation, [1, 0, 0], time)

        
        node({rotation: nodeRotation, position: position})
      }
    })
  })
})