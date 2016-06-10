/**
 * @namespace SnippetConstants
 */

'use strict'

import {highlightJsx} from 'ape-highlighting'
import  fs from 'fs'

const exists = (filename) => fs.existsSync && fs.existsSync(filename)
const read = (filename) => exists(filename) && fs.readFileSync(filename).toString() || null

const exampleCloud = highlightJsx(
  read(require.resolve('sugos/example/modules/example-cloud.js'))
)

export {
  exampleCloud
}
