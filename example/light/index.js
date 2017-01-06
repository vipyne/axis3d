'use strict'

import {
  DirectionalLight,
  LambertMaterial,
  AmbientLight,
  Context,
  Camera,
  Frame,
  Mesh,
} from 'axis3d'

import Bunny from 'bunny'
import quat from 'gl-quat'

for (let p of Bunny.positions) {
  p[1] = p[1] - 4
}

const ctx = Context()

const material = LambertMaterial(ctx)
const camera = Camera(ctx, { position: [0, 0, 16] })
const frame = Frame(ctx)
const bunny = Mesh(ctx, { geometry: Bunny })

const directional = DirectionalLight(ctx)
const ambient = AmbientLight(ctx)

const rotation = [0, 0, 0, 1]
const angle = [0, 0, 0, 1]

frame(({time}) => {
  camera({},() => {
    ambient({color: [1, 1, 1, 1]}, () => {
      directional({position: [20, 20, 20]}, () => {
        material({ color: [0.6, 0.6, 0.8, 1] }, () => {
          quat.setAxisAngle(angle, [0, 1, 0], 0.5*time)
          quat.slerp(rotation, rotation, angle, 0.01)
          bunny({rotation: rotation, wireframe: true, })
        })
      })
    })
  })
})
