/**
 * @namespace SnippetConstants
 */

'use strict'

import {highlightJsx} from 'ape-highlighting'
import  fs from 'fs'

const exists = (filename) => fs.existsSync && fs.existsSync(filename)
const read = (filename) => exists(filename) && fs.readFileSync(filename).toString() || null

const exampleCloud = highlightJsx.code(
  read(require.resolve('sugos/example/example-cloud.js'))
)
const exampleActor = highlightJsx.code(
  read(require.resolve('sugos/example/example-actor.js'))
)
const exampleCaller = highlightJsx.code(
  read(require.resolve('sugos/example/example-caller.js'))
)

export {
  exampleCloud,
  exampleActor,
  exampleCaller
}
