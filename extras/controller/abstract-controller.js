'use strict'

/**
 * Module dependencies.
 */

import { Quaternion } from 'axis3d/math'
import { Command } from 'axis3d/command'

export class AbstractControllerCommand extends Command {
  constructor(ctx, {
    orientation: initialOrientation = null,
    rotation = {},
    update = (_, f = () => void 0) => f(),
  } = {}) {

    const orientation = new Quaternion(...(initialOrientation || []))

    // controller update function
    super((state, block) => {
      if ('function' == typeof state) {
        block = state
        state = {}
      }

      state = state || {}
      block = block || function() {}

      update({
        ...state,
        orientation,
      }, () => {
        block({ ...ctx.reglContext })
      })
    })
  }
}
