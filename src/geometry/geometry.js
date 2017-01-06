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
    this.complex = complex && flatten ? reindex(unindex(complex.positions, complex.cells)) : complex
    this.wireframe = complex && Wireframe(complex, {
      attributes: {
        normals: (complex.cells && complex.positions) && normals(
          complex.cells,
          complex.positions
        )
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
