'use strict'

/**
 * Module dependencies.
 */

import {
  Quaternion,
  Vector
} from './math'

import {
  incrementStat
} from './stats'

import {
  Command
} from './command'

import {
  define
} from './utils'

import mat4 from 'gl-mat4'
import vec4 from 'gl-vec4'
import vec3 from 'gl-vec3'
import vec2 from 'gl-vec2'
import quat from 'gl-quat'

let OBJECT_COMMAND_COUNTER = 0

module.exports = exports = (...args) => new Object3DCommand(...args)
export class Object3DCommand extends Command {
  //
  // Returns the next object ID
  //
  static id() {
    return OBJECT_COMMAND_COUNTER ++
  }

  constructor(ctx, opts = {}) {
    incrementStat('Object3D')
    const update = opts.update || function () {}
    const type = opts.type || 'object'
    const id = opts.id || Object3DCommand.id()

    // 3d
    const rotation = new Quaternion(...(opts.rotation || []))
    const position = new Vector(...(opts.position || [0, 0, 0]))
    const scale = new Vector(...(opts.scale || [1, 1, 1]))

    // initial state
    const initial = {
      rotation: [...rotation],
      position: [...position],
      scale: [...scale],
    }

    const transform = mat4.identity([])
    const local = mat4.identity([])

    // regl context
    const injectContext = ctx.regl({
      context: {
        id: () => id,
        scale: () => scale,
        position: () => position,
        rotation: () => rotation,
        transform: ({transform: parentTransform}, state = {}, fo) => {
          const wantsTransform = false !== opts.transform

          if (!wantsTransform) {
            return undefined
          }

          updateState(state || {})

          // M = T * R * S
          mat4.translate(local, local, position)
          mat4.multiply(local, local, mat4.fromQuat([], rotation))
          mat4.scale(local, local, scale)

          // M' = Mp * M
          if (parentTransform) {
            mat4.multiply(transform, parentTransform, local)
          } else {
            mat4.copy(transform, local)
          }

          return transform
        },
      }
    })

    //
    // Updates state and internal matrices.
    //
    const updateState = (state = {}) => {
      mat4.identity(local)
      mat4.identity(transform)
      vec3.copy(scale, initial.scale)
      vec3.copy(position, initial.position)
      quat.copy(rotation, initial.rotation)

      if (state.scale) {
        if (state.scale.length && 3 == state.scale.length) {
          vec3.copy(scale, state.scale)
        } else {
          Object.assign(scale, state.scale)
        }
      }

      if (state.position) {
        if (state.position.length && 3 == state.position.length) {
          vec3.copy(position, state.position)
        } else {
          Object.assign(position, state.position)
        }
      }

      if (state.rotation) {
        if (state.rotation.length && 4 == state.rotation.length) {
          quat.copy(rotation, state.rotation)
        } else {
          Object.assign(rotation, state.rotation)
        }
      }
    }

    // calls current target render function
    super((state = {}, block = () => void 0) => {
      if ('function' == typeof state) {
        block = state
        state = {}
      }

      state = state || {}
      block = block || function() {}

      updateState(state)
      // inject context suitable for
      // all Object3DCommand instances
      injectContext(state, () => {
        update({ ...state }, block)
      })
    })

    //
    // Public read only properties
    //
    define(this, 'id', { get() { return id } })
  }
}
