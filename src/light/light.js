'use strict'

import * as types from './types'

import {
  incrementStat
} from '../stats'

import {
  Object3DCommand
} from '../object3d'

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
      ambient: initialAmbient = 0.01,
      visible: initialVisible = true,
      radius: initialRadius = 60,
      color: initialColor = [1, 1, 1, 1],
      type: initialType = types[0],
    } = initialState

    const context = {
      [`lights[${id}]`]({ position }, {
        intensity,
        ambient,
        visible,
        radius,
        color,
        type,
      } = {}) {
        const typeName =
          Object.keys(types).find((k) => (type || initialType) == types[k])
        let w = 0
        if ((type || initialType) == types.DirectionalLight) {
          w = 1
        }
        return {
          intensity: intensity || initialIntensity,
          position: [...(position || initialPosition), w],
          ambient: ambient || initialAmbient,
          visible: visible || initialVisible,
          radius: radius || initialRadius,
          color: color || initialColor,
          type: type || initialType,
          typeName,
        }
      }
    }

    const injectContext = regl({
      context
    })

    super(ctx, {
      ...initialState,
      transform: false,
      update(state, block) {
        const noop = () => void 0

        if ('function' == typeof state) {
          block = state
          state = {}
        }

        state = state || {}
        block = block || noop

        injectContext(state, block)
      }
    })
  }
}
