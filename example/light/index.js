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
  return (state = {}, block) => {
    mesh(state, ({}, args) => {
      material({blending: true, color: [1, 1, 1, 1.0], opacity: 1}, () => {
        mesh({
          wireframe: true,
          wireframeThickness: 0.01,
          scale: [1.00125, 1.00125, 1.00125]
        })
      })
    })
  }
})()

const sphere = (() => {
  const geometry = SphereGeometry()
  const material = LambertMaterial(ctx)
  const mesh = Mesh(ctx, {geometry})
  return (state = {}, block) => {
    mesh(state, ({}, args) => {
      material({blending: true, color: [1, 1, 1, 1.0], opacity: 1}, () => {
        mesh({
          wireframe: true,
          wireframeThickness: 0.01,
          scale: [1.00125, 1.00125, 1.00125]
        })
      })
    })
  }
})()

const bunny = (() => {
  const mesh = Mesh(ctx, {geometry: Bunny})
  return (state = {}, block) => {
    mesh(state, ({}, args) => {
      material({blending: true, color: [1, 1, 1, 1.0], opacity: 1}, () => {
        mesh({
          wireframe: true,
          wireframethickness: 0.01,
          scale: [1.00125, 1.00125, 1.00125]
        })
      })
    })
  }
})()

const point = (() => {
  //const material = LambertMaterial(ctx)
  const material = FlatMaterial(ctx)
  const geometry = SphereGeometry({radius: 0.05, segments: 2})
  const sphere = Mesh(ctx, {geometry})
  const light = PointLight(ctx)
  return (state = {}, block) => {
    const power = 2 - (1 + Math.cos(ctx.regl.now()))
    if (Array.isArray(state)) {
      for (let s of state) {
        s.scale = [power, power, power]
        s.radius = 1.5*power
      }
    } else {
      state.scale = [power, power, power]
      state.radius = 1.5*power
    }

    material(state, ({}, args = {}) => {
      sphere(args, () => {
        light(args)
      })
    })
  }
})()

frame(({time}) => {
  // point lights position
  const position = [-5, -5, -5]
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
    //ambient({color: [0.5, 0.5, 0.5, 1]})
    directional({
      position: [
        0,
        //-30 + 10*(1 - (0.5 + Math.cos(time))),
        -50,
        0
      ]
    })

    point([
      {
        visible: true,
        color: [0.1, 0.1, 0.8, 1],
        position,
      }, {
        visible: true,
        color: [0.8, 0.1, 0.8, 1],
        position: vec3.negate([], position),
      },
      {
        visible: true,
        color: [0.2, 0.8, 0.2, 1],
        position:
          vec3.transformQuat(
            [],
            vec3.add([], vec3.negate([], position), [2, 2, 2]),
            quat.setAxisAngle([], [0, 0, 1], 0.5*time)),
      },
    ])

    material({ color: [0.6, 0.6, 0.8, 1] }, () => {
      quat.setAxisAngle(angle, [0, 1, 0], 0.5*time)
      quat.slerp(rotation, rotation, angle, 0.01)
      sphere({rotation: rotation, wireframe: false, position: [-5, 1, 0]})
    })

    //material({ color: [0.6, 0.6, 0.8, 1] }, () => {
      //quat.setAxisAngle(angle, [0, 1, 0], 0.5*time)
      //quat.slerp(rotation, rotation, angle, 0.01)
      //bunny({rotation: rotation, wireframe: false, position: [-5, 1, 0]})
    //})

    material({color: [0.1, 0.5, 0.5, 1], opacity: 1}, () => {
      const x = quat.setAxisAngle([], [1, 0, 0], 0.5*time)
      const z = quat.setAxisAngle([], [0, 0, 1], 0.5*time)
      quat.slerp(rotation, rotation, quat.multiply([], x, z), 0.01)
      box({rotation, scale: [3, 3, 3], position: [5, 0, 0]})
    })
  })
})
