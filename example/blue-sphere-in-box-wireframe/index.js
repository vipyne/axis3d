'use strict'

import {
  DirectionalLight,
  OrientationInput,
  LambertMaterial,
  SphereGeometry,
  BoxGeometry,
  TouchInput,
  MouseInput,
  Context,
  Camera,
  Frame,
  Mesh,
} from 'axis3d'

import {
  OrbitCameraController
} from '../../extras/controller'

import quat from 'gl-quat'

const ctx = Context()

const camera = Camera(ctx, {position: [0, 0, 5]})
const frame = Frame(ctx)

// inputs
const orientation =  OrientationInput(ctx)
const mouse = MouseInput(ctx)
const touch = TouchInput(ctx)

const orbitCamera = OrbitCameraController(ctx, {
  camera: camera,
  inputs: {orientation, touch, mouse},
})

const BlueSphereInBoxWireframe = (ctx) => {
  const material = LambertMaterial(ctx)
  const sphere = Mesh(ctx, { geometry: SphereGeometry({radius: 1}) })
  const box = Mesh(ctx, { geometry: BoxGeometry() })
  return (state, block) => {
    material({ color: [0.8, 0.8, 0.8, 1] }, () => {
      state = Array.isArray(state) ? state : [state]
      for (let s of state) { Object.assign(s, {wireframe: true}) }
      box(state, ({}, args = {}) => {
        material({ ...args, color: [0.2, 0.2, 0.8, 1] }, () => {
          sphere({ scale: [0.5, 0.5, 0.5] })
        })
      })
    })
  }
}

const light = DirectionalLight(ctx)
const draw = BlueSphereInBoxWireframe(ctx)

frame(({time}) => {
  orbitCamera({ }, () => {
    light({position: [10, 20, 20]})
    // batch
    draw([
      {position: [0, 0, 0]},
      {position: [-2, 0, 0]},
      {position: [2, 0, 0]},
      {position: [0, 2, Math.cos(time)],
       color: [0.8, 0.6, Math.cos(0.5*time), 1]}
    ])
  })
})
