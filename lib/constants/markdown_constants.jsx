/**
 * @namespace MarkdownConstants
 */

'use strict'

import fs from 'fs'
import path from 'path'
import aglob from 'aglob'

const mdDir = `${__dirname}/../../asset/markdowns`

let markdown = (lang) => aglob.sync('**/*.md', { cwd: `${mdDir}/${lang}` }).reduce((markdowns, filename) => Object.assign(markdowns, {
  [path.basename(filename, '.md')]: fs.readFileSync(`${mdDir}/${lang}/${filename}`).toString()
}), {})

const en = markdown('en')
const ja = markdown('ja')
export {
  en, ja
}
