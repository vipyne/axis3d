'use strict'

import { OrbitCameraController } from '../../extras/controller'
import VignetteBackground from '../../extras/backgrounds/vignette'

import {
  DirectionalLight,
  LambertMaterial,
  FlatMaterial,

  AmbientLight,
  PointLight,

  SphereGeometry,
  BoxGeometry,

  OrientationInput,
  TouchInput,
  MouseInput,

  Context,
  Camera,
  Frame,
  Mesh,
} from 'axis3d'

import Bunny from 'bunny'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

for (let p of Bunny.positions) {
  p[1] = p[1] - 4
}

const ctx = Context({clear: {color: [0, 0, 0, 1], depth: true}})

const background = VignetteBackground(ctx)
const material = LambertMaterial(ctx)
const camera = Camera(ctx, { position: [0, 0, 15] })
const frame = Frame(ctx)
const bunny = Mesh(ctx, { geometry: Bunny })

const directional = DirectionalLight(ctx)
const ambient = AmbientLight(ctx)

const rotation = [0, 0, 0, 1]
const angle = [0, 0, 0, 1]

// inputs
const orientation =  OrientationInput(ctx)
const mouse = MouseInput(ctx)
const touch = TouchInput(ctx)

const orbitCamera = OrbitCameraController(ctx, {
  camera: camera,
  inputs: {orientation, touch, mouse},
})

const box = (() => {
  const geometry = BoxGeometry()
  const material = LambertMaterial(ctx)
  const mesh = Mesh(ctx, {geometry})
  const wire = Mesh(ctx, {geometry})
  return (state = {}, block) => {
    mesh(state, (...args) => {
      material({blending: true, color: [1, 1, 1, 1.0], opacity: 0.8}, () => {
        wire({
          wireframe: true,
          wireframeThickness: 0.03,
          scale: [1.01, 1.01, 1.01]
        })
      })
    })
  }
})()

const point = (() => {
  //const material = LambertMaterial(ctx)
  const material = FlatMaterial(ctx)
  const geometry = SphereGeometry({radius: 0.05, segments: 1})
  const sphere = Mesh(ctx, {geometry})
  const light = PointLight(ctx)
  return (state = {}, block) => {
    material(Array.isArray(state) ? {} : state, ({time}) => {
      const power = 4 - (2 + Math.cos(time))
      //scale: [power, power, power]
      sphere(state, () => {
        light(state)
      })
    })
  }
})()

let position = [0, 1, 0]
window.position = position

frame(({time}) => {
  // point lights position
  position = [-5, -5, -5]
  vec3.transformQuat(
    position,
    position,
    quat.setAxisAngle([], [1, 0, 0], 0.5*time))

  vec3.transformQuat(
    position,
    position,
    quat.setAxisAngle([], [0, 1, 0], 0.5*time))

  vec3.transformQuat(
    position,
    position,
    quat.setAxisAngle([], [0, 0, 1], 0.5*time))

  orbitCamera({}, () => {
    background({reduction: 15 + 8*(1 - (0.5 + Math.cos(time))), noise: 0.1})

    // lights
    ambient({color: [0.5, 0.5, 0.5, 1]})
    directional({
      position: [
        20,
        -30 + 10*(1 - (0.5 + Math.cos(time))),
        20
      ]
    })

    point([{position, color: [0.1, 0.1, 0.8, 1]},
    //point(
      {position: vec3.negate([], position), color: [0.8, 0.1, 0.8, 1]}])

    material({ color: [0.6, 0.6, 0.8, 1] }, () => {
      quat.setAxisAngle(angle, [0, 1, 0], 0.5*time)
      quat.slerp(rotation, rotation, angle, 0.01)
      bunny({rotation: rotation, wireframe: true, position: [-5, 1, 0]})
    })

    material({color: [0.1, 0.5, 0.5, 1]}, () => {
      const x = quat.setAxisAngle([], [1, 0, 0], 0.5*time)
      const z = quat.setAxisAngle([], [0, 0, 1], 0.5*time)
      quat.slerp(rotation, rotation, quat.multiply([], x, z), 0.01)
      box({rotation, scale: [3, 3, 3], position: [5, 0, 0]})
    })
  })
})
