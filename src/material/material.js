'use strict'

import injectDefines from 'glsl-inject-defines'
import glslify from 'glslify'
import vec4 from 'gl-vec4'

import * as types from './types'

import {
  TextureCommand
} from '../texture'

import {
  incrementStat
} from '../stats'

import {
  Command
} from '../command'

const kDefaultFragmentShader =
  glslify(__dirname + '/../glsl/material/fragments/main.glsl')

module.exports = exports = (...args) => new MaterialCommand(...args)
export class MaterialCommand extends Command {
  constructor(ctx, initialState = {}) {
    incrementStat('Material')

    let {
      transparent = false,
      blending = {},
      opacity = 1.0,
      culling = {},
      shader = kDefaultFragmentShader,
      color = [100/255, 110/255, 255/255, 1],
      depth = {},
      type = types.Material,
      map = null
    } = initialState

    const {regl} = ctx

    const initialMap = map || new TextureCommand(ctx)
    const initialColor = color
    const initialOpacity = opacity

    const initialBlending = {
      equation: 'add',
      enable: (
        ('boolean' == typeof blending && blending) ||
        ('boolean' == typeof transparent && transparent)
      ),
      color: [0, 0, 0, 1],
      func: {src: 'src alpha', dst: 'one minus src alpha'},
      ...blending,
    }

    const initialCulling = {
      enable: false,
      face: 'back',
      ...culling
    }

    const initialDepth = {
      enable: true,
      range: [0, 1],
      mask: true,
      func: 'less',
      test: true,
      ...depth,
    }

    const uniforms = {
      'material.opacity': ({}, {opacity = initialOpacity} = {}) => opacity,
      'material.color': ({}, {color = initialColor} = {}) => color,
      'material.type': () => type || types.Material,

      'map.resolution': ({textureResolution}) => textureResolution || [0, 0],
      'map.data': ({texture}, {map = initialMap} = {}) => texture || map,

      ...initialState.uniforms
    }

    const typeName = Object.keys(types).find((key) => type == types[key])
    const shaderDefines = {
      [`use${typeName}`]: 1, // `useLambertMaterial', etc
      MATERIAL_TYPE: typeName, // `LambertMaterial', etc

      ...initialState.shaderDefines
    }

    for (let key in types) {
      shaderDefines[`${key}Type`] = types[key]
    }

    for (let key in shaderDefines) {
      shader = `#define ${key} ${shaderDefines[key]}\n`+shader
    }

    const injectContext = regl({
      uniforms,
      frag: shader,
      blend: {
        equation: () => blending.equation,
        enable: ({}, {transparent = blending.enable} = {}) => transparent,
        color: () => blending.color,
        func: () => blending.func,
      },

      cull: {
        enable: () => culling.enable,
        face: () => culling.face,
      },

      depth: {
        enable: () => depth.enable,
        range: () => depth.range,
        mask: () => depth.mask,
        func: () => depth.func,
      },
    })

    // configurable
    blending = { ...initialBlending }
    culling = { ...initialCulling }
    opacity = initialOpacity
    depth = { ...initialDepth }
    color = [ ...initialColor ]
    map = initialMap

    super((state, block) => {
      const noop = () => void 0

      if ('function' == typeof state) {
        block = state
        state = {}
      }

      state = state || {}
      block = block || noop

      blending = { ...initialBlending }
      culling = { ...initialCulling }
      depth = { ...initialDepth }
      color = [ ...initialColor ]
      map = initialMap

      if ('blending' in state) {
        if (true === state.blending) {
          blending.enable = true
        } else if (false === state.blending) {
          blending.enable = false
        } else {
          Object.assign(blending, state.blending)
        }
      }

      if ('culling' in state) {
        if (true === state.culling) {
          culling.enable = true
        } else if (false === state.culling) {
          culling.enable = false
        } else {
          Object.assign(culling, state.culling)
        }
      }

      if ('depth' in state) {
        if (true === state.depth) {
          depth.enable = true
        } else if (false === state.depth) {
          depth.enable = false
        } else {
          Object.assign(depth, state.depth)
        }
      }

      if ('color' in state) {
        vec4.copy(color, state.color)
      }

      if ('map' in state) {
        map = state.map
      }

      if ('function' == typeof map) {
        map(({textureResolution}) => {
          injectContext(state, block)
        })
      } else {
        injectContext(state, block)
      }
    })
  }
}
