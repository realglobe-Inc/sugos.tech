/**
 * @namespace SnippetConstants
 */

'use strict'

import {highlightJsx} from 'ape-highlighting'
import  fs from 'fs'

const exists = (filename) => fs.existsSync && fs.existsSync(filename)
const read = (filename) => exists(filename) && fs.readFileSync(filename).toString() || null

const exampleUsage = highlightJsx.code(
  read(require.resolve('sugos/example/example-usage.js'))
)
const exampleCloud = highlightJsx.code(
  read(require.resolve('sugos/example/modules/example-cloud.js'))
)
const exampleSpot = highlightJsx.code(
  read(require.resolve('sugos/example/modules/example-spot.js'))
)
const exampleTerminal = highlightJsx.code(
  read(require.resolve('sugos/example/modules/example-terminal.js'))
)

export {
  exampleUsage,
  exampleCloud,
  exampleSpot,
  exampleTerminal
}
