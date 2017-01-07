'use strict'

import * as types from './types'

import {
  incrementStat
} from '../stats'

import {
  Object3DCommand
} from '../object3d'

import {
  MeshCommand
} from '../mesh'

import {
  FlatMaterialCommand
} from '../material/flat'

let LIGHT_COMMAND_COUNTER = 0

module.exports = exports = (...args) => new LightCommand(...args)
export class LightCommand extends Object3DCommand {
  constructor(ctx, initialState = {}) {
    incrementStat('Light')

    const {regl} = ctx
    const id = LIGHT_COMMAND_COUNTER ++

    const {
      intensity: initialIntensity = 10,
      position: initialPosition = [0, 0, 0],
      ambient: initialAmbient = 0.1,
      visible: initialVisible = true,
      radius: initialRadius = 50,
      color: initialColor = [1, 1, 1, 1],
      type: initialType = types[0],
    } = initialState

    const context = {}
    const material = new FlatMaterialCommand(ctx)
    const injectContext = regl({ context })

    super(ctx, {
      ...initialState,
      transform: false,
      update(state, block) {
        const noop = () => void 0

        if ('function' == typeof state) {
          block = state
          state = {}
        }

        const {position} = ctx.reglContext
        const {
          intensity,
          ambient,
          visible,
          radius,
          color,
          type,
        } = state

        const typeName =
          Object.keys(types).find((k) => (type || initialType) == types[k])

        let w = 0
        if ((type || initialType) == types.DirectionalLight) {
          w = 1
        } else if ((type || initialType) == types.PointLight) {
          w = 0
        }

        const light = {
          intensity: intensity || initialIntensity,
          position: [...(position || initialPosition), w],
          ambient: ambient || initialAmbient,
          visible: visible || initialVisible,
          radius: radius || initialRadius,
          color: color || initialColor,
          type: type || initialType,
          typeName,
        }

        state = state || {}
        block = block || noop
        state = {}
        ctx.reglContext.lights.push(light)

        const update = initialState.update || (({} = {}, f) => f())

        material(state, () => {
          injectContext(state, (...args) => {
            update(state, () => {
              block(...args)
            })
          })
        })
      }
    })
  }
}
