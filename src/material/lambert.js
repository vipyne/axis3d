'use strict'

import * as lightTypes from '../light/types'
import coalesce from 'defined'

import {
  kMaxAmbientLights
} from '../light/ambient'

import {
  kMaxDirectionalLights
} from '../light/directional'

import {
  MaterialCommand
} from './material'

import {
  LambertMaterial as type
} from './types'

module.exports = exports = (...args) => new LambertMaterialCommand(...args)
export class LambertMaterialCommand extends MaterialCommand {
  constructor(ctx, initialState = {}) {
    let {
      roughness: initialRoughness = 0.7,
      emissive: initialEmissive = [0, 0, 0, 1],
      ambient: initialAmbient = [0.28, 0.28, 0.28, 1],
      albedo: initialAlbedo = 0.7,
    } = initialState

    const uniforms = {
      'material.roughness': ({}, {roughness = initialRoughness} = {}) => {
        return roughness
      },

      'material.emissive': ({}, {emissive = initialEmissive} = {}) => {
        return emissive
      },

      'material.albedo': ({}, {albedo = initialAlbedo} = {}) => {
        return albedo
      },

      'material.ambient': ({}, {ambient = initialAmbient} = {}) => {
        return ambient
      },

      'lightContext.ambient.count': ({lights}) => {
        const {AmbientLight} = lightTypes
        const count = lights.filter((l) => l.type == AmbientLight).length
        return count
      },

      'lightContext.directional.count': ({lights}) => {
        const {DirectionalLight} = lightTypes
        const count = lights.filter((l) => l.type == DirectionalLight).length
        return count
      },
    }

    const shaderDefines = {
      MAX_AMBIENT_LIGHTS: kMaxAmbientLights,
      MAX_DIRECTIONAL_LIGHTS: kMaxDirectionalLights,
    }

    setLightsInContext({
      which: 'ambient',
      type: lightTypes.AmbientLight,
      max: kMaxAmbientLights,
      defaults: {
        color: [0, 0, 0, 0],
        visible: false,
      }
    })

    setLightsInContext({
      which: 'directional',
      type: lightTypes.DirectionalLight,
      max: kMaxDirectionalLights,
      defaults: {
        direction: [0, 0, 0, 0],
        position: [0, 0, 0, 0],
        color: [0, 0, 0, 0],
        visible: false,
        radius: 0,
        ambient: 0,
        intensity: 0,
      }
    })

    super(ctx, {
      ...initialState,
      uniforms,
      type,
    })

    function setLightsInContext({which, type, max, defaults}) {
      for (let i = 0; i < max; ++i) {
        const key = `lightContext.${which}.lights[${i}]`
        const set = (property, fallback) => {
          Object.assign(uniforms, {
            [`${key}.${property}`]({lights}, args) {
              const filteredLights = lights.filter((l) => l.type == type)
              if (filteredLights[i]) {
                return coalesce(args[property], filteredLights[i][property], fallback)
              } else {
                return fallback
              }
            }
          })
        }

        for (let key in defaults) {
          set(key, defaults[key])
        }
      }
    }
  }
}
