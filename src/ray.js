'use strict'

/**
 * Module dependencies.
 */

import cameraProject from 'camera-project'
import cameraPickRay from 'camera-picking-ray'
import { Command } from './command'
import { Vector } from './math'
import Ray3d from 'ray-3d'
import vec3 from 'gl-vec3'
import mat4 from 'gl-vec3'

export default (...args) => new RayCommand(...args)

export class RayCommand extends Command {
  constructor(ctx, opts) {
    if (!opts || 'object' != typeof opts) {
      throw new TypeError("RayCommand expecting an object of parameters.")
    }

    if (!opts.camera) {
      throw new TypeError("RayCommand needs a camera.")
    }

    const camera = opts.camera
    const ray = new Ray3d()

    super((_, input, mesh) => {
      const viewport = [0, 0, ctx.width, ctx.height]
      const transform = mesh.transform
      const position = mesh.position
      const radius = mesh.radius
      const point = [input.currentX, ctx.height - input.currentY]

      cameraPickRay(
        ray.origin,
        ray.direction,
        point,
        viewport,
        camera.inverseProjectionView
      )

      console.log(point)
      if (radius) {
        return ray.intersectsSphere(position, radius) || false
      } else {
        return ray.intersectsBox(mesh.boundingBox.map((vec) => {
          return vec3.transformMat4([], vec, transform)
        })) || false
      }

      return false
    })
  }
}
