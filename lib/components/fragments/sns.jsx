/***
 * Component of SNS links
 */
'use strict'

import React, {Component} from 'react'

export default () => (
  <div className='sns'>
    <div className="facebook-sdk"
         dangerouslySetInnerHTML={ {
           __html: `
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.7";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
`
         } }
    ></div>


    <span className="sns-button sns-twitter-button" dangerouslySetInnerHTML={ {
      __html: `
<div class="fb-like" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>
`
    } }></span>


    <span className="sns-button sns-twitter-button"
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
