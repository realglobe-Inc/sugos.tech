/***
 * Component of SNS links
 */
'use strict'

import React, {Component} from 'react'

export default () => (
  <div className='sns'>
  <span className="sns-twitter-button"
        dangerouslySetInnerHTML={ {
          __html: `
<a href="https://twitter.com/share" class="twitter-share-button" data-show-count="false">Tweet</a>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
`
        } }
  >

  </span>
  </div>
)