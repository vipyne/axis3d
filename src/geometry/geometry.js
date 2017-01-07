'use strict'

/**
 * Module dependencies.
 */

import Wireframe from 'screen-projected-lines'
import reindex from 'mesh-reindex'
import unindex from 'unindex-mesh'
import normals from 'angle-normals'

module.exports = exports = (...args) => new Geometry(...args)
export class Geometry {
  constructor({complex} = {}, {flatten = true} = {}) {
    if (complex instanceof Geometry) {
      complex = complex.complex
    }

    if (complex) {
      if (flatten && complex.cells) {
        // This is wrapped in a `try/catch' to allow execution
        // to continue when a `reindex/unindex' fails due to an
        // attempt to reindex an already reindexed complex
        try {
          const cells = complex.cells.map((cell) => cell.slice())
          const flattened = reindex(unindex(complex.positions, cells))
          complex.normals = normals(flattened.cells, flattened.positions)
          if (complex.uvs) {
            flattened.uvs = reindex(unindex(complex.uvs, cells)).positions
          }
          Object.assign(complex, flattened)
        } catch (e) {
          // @TODO(werle) - warning ?
        }
      }

      if (null == complex.normals && complex.positions && complex.cells) {
        complex.normals = normals(complex.cells, complex.positions)
      }
    }

    this.complex = complex || null
    this.wireframe = complex && Wireframe(complex, {
      attributes: {
        normals: complex.normals
      }
    })

    if (this.wireframe) {
      this.wireframe.normals = this.wireframe.attributes.normals
    }
  }

  get positions() {
    return this.complex ? this.complex.positions : null
  }

  get normals() {
    return this.complex ? this.complex.normals : null
  }

  get uvs() {
    return this.complex ? this.complex.uvs : null
  }

  get cells() {
    return this.complex ? this.complex.cells : null
  }
}
