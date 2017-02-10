(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/doc/links.json":[function(require,module,exports){
module.exports={
  "SUGOS": "https://github.com/realglobe-Inc/sugos",
  "SUGOS Tutorials": "https://github.com/realglobe-Inc/sugos-tutorial",
  "Realglobe, Inc.": "http://realglobe.jp"
}
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/footer.jsx":[function(require,module,exports){
/**
 * Footer component
 * @class Footer
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _links = require('../../../doc/links.json');

var _links2 = _interopRequireDefault(_links);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends Footer */
var Footer = _react2.default.createClass({
  displayName: 'Footer',

  mixins: [],
  render: function render() {
    var s = this;
    var props = s.props;
    var l = props.l;


    return _react2.default.createElement(
      _apemanReactBasic.ApFooter,
      { className: 'footer' },
      _react2.default.createElement(
        'div',
        { className: 'footer-group' },
        _react2.default.createElement(
          'h3',
          { className: 'footer-title' },
          l('footer.LINKS_TITLE')
        ),
        _react2.default.createElement(_apemanReactBasic.ApLinks, { links: _links2.default })
      ),
      props.children,
      _react2.default.createElement(
        'div',
        { className: 'footer-group' },
        _react2.default.createElement(
          'a',
          { className: 'footer-company',
            href: 'http://realglobe.jp/'
          },
          _react2.default.createElement(_apemanReactBasic.ApImage, { width: '64px',
            height: '64px',
            scale: 'fit',
            src: 'images/company-logo.png'
          }),
          _react2.default.createElement(
            'span',
            { className: 'footer-copyright' },
            l('footer.COPY_RIGHT')
          )
        )
      )
    );
  }
});

exports.default = Footer;

},{"../../../doc/links.json":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/doc/links.json","apeman-react-basic":"apeman-react-basic","react":"react"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/header.jsx":[function(require,module,exports){
/**
 * Header component
 * @class Header
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _logo = require('../fragments/logo');

var _logo2 = _interopRequireDefault(_logo);

var _link_service = require('../../services/link_service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @lends Header */
var Header = function (_Component) {
  _inherits(Header, _Component);

  function Header() {
    _classCallCheck(this, Header);

    return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
  }

  _createClass(Header, [{
    key: 'render',
    value: function render() {
      var s = this;
      var props = s.props;
      var tab = props.tab,
          l = props.l;


      var _tabItem = _apemanReactBasic.ApHeaderTabItem.createItem;
      var _link = function _link() {
        return _link_service.singleton.resolveHtmlLink.apply(_link_service.singleton, arguments);
      };
      return _react2.default.createElement(
        _apemanReactBasic.ApHeader,
        { className: 'header' },
        _react2.default.createElement(
          _apemanReactBasic.ApContainer,
          null,
          _react2.default.createElement(
            _apemanReactBasic.ApHeaderLogo,
            { href: _link('index.html') },
            _react2.default.createElement(_logo2.default, { l: l })
          ),
          _react2.default.createElement(
            _apemanReactBasic.ApHeaderTab,
            null,
            _tabItem(l('pages.DOCS_PAGE'), _link('docs.html'), { selected: tab === 'DOCS' }),
            _tabItem(l('pages.CASES_PAGE'), _link('cases.html'), { selected: tab === 'CASES' })
          )
        ),
        _react2.default.createElement(Header.GithubLink, null)
      );
    }
  }], [{
    key: 'GithubLink',
    value: function GithubLink() {
      return _react2.default.createElement('a', { href: 'https://github.com/realglobe-Inc/sugos',
        id: 'github-link',
        className: 'github-corner',
        dangerouslySetInnerHTML: {
          __html: '\n<svg width="44" height="44" viewBox="0 0 250 250" style="fill:#333; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true">\n<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>\n<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>\n<style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>\n'
        }
      });
    }
  }, {
    key: 'propTypes',
    get: function get() {
      return {
        tab: _react.PropTypes.string
      };
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return {
        tab: null
      };
    }
  }]);

  return Header;
}(_react.Component);

exports.default = Header;

},{"../../services/link_service":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/link_service.jsx","../fragments/logo":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/logo.jsx","apeman-react-basic":"apeman-react-basic","react":"react"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/logo.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Logo = _react2.default.createClass({
  displayName: 'Logo',

  mixins: [],
  render: function render() {
    var s = this;
    var l = s.props.l;

    return _react2.default.createElement(
      'h1',
      { className: 'logo' },
      l('logo.LOGO')
    );
  }
});

exports.default = Logo;

},{"react":"react"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/markdown.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _apemanReactMarkdown = require('apeman-react-markdown');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EOL = _apemanReactMarkdown.ApMarkdown.EOL;


var Markdown = _react2.default.createClass({
  displayName: 'Markdown',

  propTypes: {},
  statics: {
    EOL: EOL
  },
  getDefaultProps: function getDefaultProps() {
    var s = this;
    return {
      links: require('../../../doc/links')
    };
  },
  render: function render() {
    var s = this;
    var props = s.props;

    return _react2.default.createElement(_apemanReactMarkdown.ApMarkdown, props);
  }
});

exports.default = Markdown;

},{"../../../doc/links":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/doc/links.json","apeman-react-markdown":"apeman-react-markdown","marked":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/marked/lib/marked.js","react":"react"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/sns.jsx":[function(require,module,exports){
/***
 * Component of SNS links
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  return _react2.default.createElement(
    'div',
    { className: 'sns' },
    _react2.default.createElement('div', { className: 'facebook-sdk',
      dangerouslySetInnerHTML: {
        __html: '\n<div id="fb-root"></div>\n<script>(function(d, s, id) {\n  var js, fjs = d.getElementsByTagName(s)[0];\n  if (d.getElementById(id)) return;\n  js = d.createElement(s); js.id = id;\n  js.src = "//connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.7";\n  fjs.parentNode.insertBefore(js, fjs);\n}(document, \'script\', \'facebook-jssdk\'));</script>\n'
      }
    }),
    _react2.default.createElement('span', { className: 'sns-button sns-twitter-button', dangerouslySetInnerHTML: {
        __html: '\n<div class="fb-like" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>\n'
      } }),
    _react2.default.createElement('span', { className: 'sns-button sns-twitter-button',
      dangerouslySetInnerHTML: {
        __html: '\n<a href="https://twitter.com/share" class="twitter-share-button" data-show-count="false">Tweet</a>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>\n'
      }
    })
  );
};

},{"react":"react"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/index_component.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _header = require('./fragments/header');

var _header2 = _interopRequireDefault(_header);

var _splash_view = require('./views/splash_view');

var _splash_view2 = _interopRequireDefault(_splash_view);

var _locale_service = require('../services/locale_service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var l = _locale_service.singleton.l;


var IndexComponent = _react2.default.createClass({
  displayName: 'IndexComponent',
  render: function render() {
    var s = this;
    return _react2.default.createElement(
      _apemanReactBasic.ApPage,
      null,
      _react2.default.createElement(_header2.default, { l: l }),
      _react2.default.createElement(
        _apemanReactBasic.ApMain,
        null,
        _react2.default.createElement(_splash_view2.default, { l: l })
      )
    );
  }
});

exports.default = IndexComponent;

},{"../services/locale_service":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/locale_service.jsx","./fragments/header":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/header.jsx","./views/splash_view":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/views/splash_view.jsx","apeman-react-basic":"apeman-react-basic","react":"react"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/views/splash_view.jsx":[function(require,module,exports){
/**
 * View for splash
 * @class Splash
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _apemanReactBasic = require('apeman-react-basic');

var _bstorage = require('bstorage');

var _package = require('sugos/package.json');

var _markdown = require('../fragments/markdown');

var _markdown2 = _interopRequireDefault(_markdown);

var _footer = require('../fragments/footer');

var _footer2 = _interopRequireDefault(_footer);

var _sns = require('../fragments/sns');

var _sns2 = _interopRequireDefault(_sns);

var _storage_constants = require('../../constants/storage_constants');

var _link_service = require('../../services/link_service');

var _snippet_service = require('../../services/snippet_service');

var _markdown_service = require('../../services/markdown_service');

var _bwindow = require('bwindow');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SplashView = function (_Component) {
  _inherits(SplashView, _Component);

  function SplashView() {
    _classCallCheck(this, SplashView);

    return _possibleConstructorReturn(this, (SplashView.__proto__ || Object.getPrototypeOf(SplashView)).apply(this, arguments));
  }

  _createClass(SplashView, [{
    key: 'render',
    value: function render() {
      var s = this;
      var l = s.props.l;

      var _link = function _link() {
        return _link_service.singleton.resolveHtmlLink.apply(_link_service.singleton, arguments);
      };

      var pathname = (0, _bwindow.get)('location.pathname');
      return _react2.default.createElement(
        _apemanReactBasic.ApView,
        { className: 'splash-view' },
        _react2.default.createElement(
          _apemanReactBasic.ApViewBody,
          null,
          _react2.default.createElement(
            _apemanReactBasic.ApJumbotron,
            { className: 'jumbotron',
              imgSrc: 'images/jumbotron.jpg' },
            _react2.default.createElement(
              _apemanReactBasic.ApJumbotronTitle,
              { className: 'logo-font' },
              'SUGOS'
            ),
            _react2.default.createElement(
              _apemanReactBasic.ApJumbotronText,
              null,
              _package.description
            ),
            _react2.default.createElement(
              'p',
              { className: 'splash-button-container' },
              _react2.default.createElement(
                _apemanReactBasic.ApButton,
                { href: _link('docs.html'),
                  onTap: function onTap() {
                    return (0, _bstorage.purge)(_storage_constants.GUIDE_STATE_KEY);
                  }
                },
                ' ',
                l('buttons.GET_STARTED'),
                ' '
              )
            )
          ),
          _react2.default.createElement(_sns2.default, null),
          _react2.default.createElement(
            _apemanReactBasic.ApArticle,
            null,
            _react2.default.createElement(SplashView.Section, { pathname: pathname,
              id: 'splash-about-section',
              markdownName: '01.about-this' }),
            _react2.default.createElement(SplashView.Section, { pathname: pathname,
              id: 'splash-how-section',
              title: l('captions.HOW_IT_WORKS'),
              markdownName: '02.how-it-works' }),
            _react2.default.createElement(SplashView.Section, { pathname: pathname,
              id: 'splash-why-section',
              title: l('captions.WHAT_TO_USE'),
              markdownName: '03.what-to-use' })
          ),
          _react2.default.createElement(_footer2.default, { l: l })
        )
      );
    }
  }], [{
    key: 'Section',
    value: function Section(_ref) {
      var pathname = _ref.pathname,
          id = _ref.id,
          _ref$title = _ref.title,
          title = _ref$title === undefined ? null : _ref$title,
          markdownName = _ref.markdownName;

      var markdown = _markdown_service.singleton.getMarkdown(markdownName);
      markdown = markdown && markdown.replace(/\]\(\.\//g, '](' + pathname + '/../');
      return _react2.default.createElement(
        _apemanReactBasic.ApSection,
        { id: id },
        _react2.default.createElement(
          _apemanReactBasic.ApSectionHeader,
          null,
          title
        ),
        _react2.default.createElement(
          _apemanReactBasic.ApSectionBody,
          null,
          _react2.default.createElement(_markdown2.default, { src: markdown })
        )
      );
    }
  }]);

  return SplashView;
}(_react.Component);

module.exports = SplashView;

},{"../../constants/storage_constants":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/storage_constants.jsx","../../services/link_service":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/link_service.jsx","../../services/markdown_service":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/markdown_service.jsx","../../services/snippet_service":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/snippet_service.jsx","../fragments/footer":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/footer.jsx","../fragments/markdown":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/markdown.jsx","../fragments/sns":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/fragments/sns.jsx","apeman-react-basic":"apeman-react-basic","bstorage":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/index.js","bwindow":"bwindow","react":"react","sugos/package.json":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sugos/package.json"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/loc_constants.json":[function(require,module,exports){
module.exports='use strict';module.exports = {"en":{"_":{},"$lang":"en","accordions":{"ACTOR_API":"API of SUGO-Actor","CALLER_API":"API of SUGO-Caller","HUB_API":"API of SUGO-Hub"},"buttons":{"GET_STARTED":"Get Started"},"captions":{"HOW_IT_WORKS":"How It Works","WHAT_TO_USE":"What to Use"},"dropdown":{},"errors":{"RESOURCE_DATA_CONFLICT_ERROR":"RESOURCE_DATA_CONFLICT_ERROR","RESOURCE_DATA_ERROR":"RESOURCE_DATA_ERROR","RESOURCE_DATA_MISSING_ERROR":"RESOURCE_DATA_MISSING_ERROR","RESOURCE_ERROR":"RESOURCE_ERROR","RESOURCE_INCLUDE_ERROR":"RESOURCE_INCLUDE_ERROR","RESOURCE_INCLUDE_INVALID_ERROR":"RESOURCE_INCLUDE_INVALID_ERROR","RESOURCE_NOT_FOUND_ERROR":"RESOURCE_NOT_FOUND_ERROR","RESOURCE_TYPE_ERROR":"RESOURCE_TYPE_ERROR","RESOURCE_TYPE_INVALID_ERROR":"RESOURCE_TYPE_INVALID_ERROR","RESOURCE_TYPE_MISSING_ERROR":"RESOURCE_TYPE_MISSING_ERROR","RESOURCE_VR_ERROR":"RESOURCE_VR_ERROR","RESOURCE_VR_TYPE_ERROR":"RESOURCE_VR_TYPE_ERROR","SIGN_CAPTCHA_WRONG_ERROR":"SIGN_CAPTCHA_WRONG_ERROR","SIGN_ERROR":"SIGN_ERROR","SIGN_FORM_WRONG_ERROR":"SIGN_FORM_WRONG_ERROR","SOMETHING_WRONG_ERROR":"SOMETHING_WRONG_ERROR","VALUE_DUPLICATE_ERROR":"VALUE_DUPLICATE_ERROR","VALUE_ERROR":"VALUE_ERROR","VALUE_INVALID_ERROR":"VALUE_INVALID_ERROR","VALUE_MISSING_ERROR":"VALUE_MISSING_ERROR","VALUE_NUMBER_ERROR":"VALUE_NUMBER_ERROR","VALUE_NUMBER_INVALID_ERROR":"VALUE_NUMBER_INVALID_ERROR","VALUE_NUMBER_TOO_LARGE_ERROR":"VALUE_NUMBER_TOO_LARGE_ERROR","VALUE_NUMBER_TOO_SMALL_ERROR":"VALUE_NUMBER_TOO_SMALL_ERROR","VALUE_STRING_ERROR":"VALUE_STRING_ERROR","VALUE_STRING_INVALID_ERROR":"VALUE_STRING_INVALID_ERROR","VALUE_STRING_TOO_LONG_ERROR":"VALUE_STRING_TOO_LONG_ERROR","VALUE_STRING_TOO_SHORT_ERROR":"VALUE_STRING_TOO_SHORT_ERROR","VALUE_TYPE_ERROR":"VALUE_TYPE_ERROR","VALUE_TYPE_INVALID_ERROR":"VALUE_TYPE_INVALID_ERROR"},"footer":{"COPY_RIGHT":"Copyright © 2016 REALGLOBE. All Rights Reserved","LINKS_TITLE":"Links"},"guides":{},"headings":{"REFERENCE_API":"APIs","REFERENCE_README":"READMEs"},"jumbotron":{},"labels":{},"leads":{"QUICK_START_LEAD_01":"Three steps to start"},"links":{},"logo":{"LOGO":"SUGOS"},"menu":{},"messages":{},"notices":{},"org":{},"pages":{"CASES_PAGE":"Cases","DOCS_PAGE":"Docs"},"placeholders":{},"status":{"400":"Bad Request","401":"Authentication is required","403":"You don't have permissions","404":"Could not find resource","500":"Something wrong with the server","502":"Bad gateway error","503":"Server not available"},"titles":{"CASE_CURL_RAPIRO_TITLE":"Control RAPIRO Robot via curl Command","CASE_DRONE_TITLE":"Fly ArDrone with Preset","CASE_EDISON_ROOMBA_TITLE":"Control Roomba with Edison","CASE_EDISON_STREAM_TITLE":"Crate network Camera with Edison and WebCOM","CASE_GYRO_TITLE":"Make Pepper to follow iPhone Motion","CASE_HITOE_TITLE":"Watch HeartBeat with HITOE Sensor and Display It on Google Map","CASE_PLEN_TITLE":"Control PLEN Robot from Browser","CASE_SENSE_TITLE":"Detect Human Motions with Kinnect","CASE_SPEECH_RECOGNITION_TITLE":"Pepper Talk from HTML5 Recognition API","CASE_TEXT_INPUT_TITLE":"Pepper Talk from Chat UI","CASES_PAGE_TITLE":"Cases","DOCS_PAGE_TITLE":"Docs","GUIDE_ACTOR_TITLE":"Declare Modules on SUGO-Actor","GUIDE_CALLER_TITLE":"Access to Modules from SUGO-Caller","GUIDE_CLOUD_TITLE":"Setup SUGO-Hub","GUIDES_TITLE":"Guidance Documents of SUGOS","SHOWCASE_TITLE":"Use Cases of SUGOS","UI_TITLE":"SUGOS"},"toasts":{},"toggles":{"QUICK_START":"Quick Start","REFERENCES":"References","TIPS":"Tips"},"$vars":{},"$fallback":{}},"ja":{"_":{},"$lang":"ja","accordions":{"ACTOR_API":"API of SUGO-Actor","CALLER_API":"API of SUGO-Caller","HUB_API":"API of SUGO-Hub"},"buttons":{"GET_STARTED":"始めてみる"},"captions":{"HOW_IT_WORKS":"How It Works","WHAT_TO_USE":"What to Use"},"dropdown":{},"errors":{"RESOURCE_DATA_CONFLICT_ERROR":"リソースデータ競合エラー","RESOURCE_DATA_ERROR":"リソースデータエラー","RESOURCE_DATA_MISSING_ERROR":"リソースデータ欠落エラー","RESOURCE_ERROR":"リソースエラー","RESOURCE_INCLUDE_ERROR":"リソースインクルードエラー","RESOURCE_INCLUDE_INVALID_ERROR":"RESOURCE_INCLUDE_INVALID_ERROR","RESOURCE_NOT_FOUND_ERROR":"未検出エラー","RESOURCE_TYPE_ERROR":"リソース種別エラー","RESOURCE_TYPE_INVALID_ERROR":"リソース種別不正エラー","RESOURCE_TYPE_MISSING_ERROR":"リソース種別欠落エラー","RESOURCE_VR_ERROR":"リソースバージョンエラー","RESOURCE_VR_TYPE_ERROR":"リソースバージョン種別エラー","SIGN_CAPTCHA_WRONG_ERROR":"CAPTCHA照合エラー","SIGN_ERROR":"ログインエラー","SIGN_FORM_WRONG_ERROR":"ログイン入力内容エラー","SOMETHING_WRONG_ERROR":"不明なエラー","VALUE_DUPLICATE_ERROR":"文字列重複エラー","VALUE_ERROR":"値エラー","VALUE_INVALID_ERROR":"値不正エラー","VALUE_MISSING_ERROR":"値欠落エラー","VALUE_NUMBER_ERROR":"数値エラー","VALUE_NUMBER_INVALID_ERROR":"数値不正エラー","VALUE_NUMBER_TOO_LARGE_ERROR":"数値上限エラー","VALUE_NUMBER_TOO_SMALL_ERROR":"数値下限エラー","VALUE_STRING_ERROR":"文字列エラー","VALUE_STRING_INVALID_ERROR":"文字列不正エラー","VALUE_STRING_TOO_LONG_ERROR":"文字列長上限エラー","VALUE_STRING_TOO_SHORT_ERROR":"文字列長下限エラー","VALUE_TYPE_ERROR":"値種別エラー","VALUE_TYPE_INVALID_ERROR":"値種別不正エラー"},"footer":{"COPY_RIGHT":"Copyright © 2016 REALGLOBE. All Rights Reserved","LINKS_TITLE":"Links"},"guides":{},"headings":{"REFERENCE_API":"APIs","REFERENCE_README":"READMEs"},"jumbotron":{},"labels":{},"leads":{"QUICK_START_LEAD_01":"クイックスタート手順"},"links":{},"logo":{"LOGO":"SUGOS"},"menu":{},"messages":{},"notices":{},"org":{},"pages":{"CASES_PAGE":"事例","DOCS_PAGE":"ドキュメント"},"placeholders":{},"status":{"400":"不正なリクエスト","401":"認証が必要です","403":"権限がありません","404":"リソースが見つかりません","500":"サーバーでエラーが発生しました","502":"ゲートウェイエラー","503":"混雑中"},"titles":{"CASE_CURL_RAPIRO_TITLE":"Control RAPIRO Robot via curl Command","CASE_DRONE_TITLE":"ArDroneをプリセット操作する","CASE_EDISON_ROOMBA_TITLE":"Control Roomba with Edison","CASE_EDISON_STREAM_TITLE":"Crate network Camera with Edison and WebCOM","CASE_GYRO_TITLE":"Make Pepper to follow iPhone Motion","CASE_HITOE_TITLE":"Watch HeartBeat with HITOE Sensor and Display It on Google Map","CASE_PLEN_TITLE":"ブラウザからPLENを操る","CASE_SENSE_TITLE":"Kinnectで人間の動きを検知する","CASE_SPEECH_RECOGNITION_TITLE":"Make Pepper Talk Text Input by HTML5 Recognition API","CASE_TEXT_INPUT_TITLE":"Make Pepper Talk from Chat UI","CASES_PAGE_TITLE":"事例","DOCS_PAGE_TITLE":"ドキュメント","GUIDE_ACTOR_TITLE":"Declare Modules on SUGO-Actor","GUIDE_CALLER_TITLE":"Access to Modules from SUGO-Caller","GUIDE_CLOUD_TITLE":"Setup SUGO-Hub","GUIDES_TITLE":"Guidance Documents of SUGOS","SHOWCASE_TITLE":"SUGOSを使った事例","UI_TITLE":"SUGOS"},"toasts":{},"toggles":{"QUICK_START":"Quick Start","REFERENCES":"References","TIPS":"Tips"},"$vars":{},"$fallback":{"_":{},"$lang":"en","accordions":{"ACTOR_API":"API of SUGO-Actor","CALLER_API":"API of SUGO-Caller","HUB_API":"API of SUGO-Hub"},"buttons":{"GET_STARTED":"Get Started"},"captions":{"HOW_IT_WORKS":"How It Works","WHAT_TO_USE":"What to Use"},"dropdown":{},"errors":{"RESOURCE_DATA_CONFLICT_ERROR":"RESOURCE_DATA_CONFLICT_ERROR","RESOURCE_DATA_ERROR":"RESOURCE_DATA_ERROR","RESOURCE_DATA_MISSING_ERROR":"RESOURCE_DATA_MISSING_ERROR","RESOURCE_ERROR":"RESOURCE_ERROR","RESOURCE_INCLUDE_ERROR":"RESOURCE_INCLUDE_ERROR","RESOURCE_INCLUDE_INVALID_ERROR":"RESOURCE_INCLUDE_INVALID_ERROR","RESOURCE_NOT_FOUND_ERROR":"RESOURCE_NOT_FOUND_ERROR","RESOURCE_TYPE_ERROR":"RESOURCE_TYPE_ERROR","RESOURCE_TYPE_INVALID_ERROR":"RESOURCE_TYPE_INVALID_ERROR","RESOURCE_TYPE_MISSING_ERROR":"RESOURCE_TYPE_MISSING_ERROR","RESOURCE_VR_ERROR":"RESOURCE_VR_ERROR","RESOURCE_VR_TYPE_ERROR":"RESOURCE_VR_TYPE_ERROR","SIGN_CAPTCHA_WRONG_ERROR":"SIGN_CAPTCHA_WRONG_ERROR","SIGN_ERROR":"SIGN_ERROR","SIGN_FORM_WRONG_ERROR":"SIGN_FORM_WRONG_ERROR","SOMETHING_WRONG_ERROR":"SOMETHING_WRONG_ERROR","VALUE_DUPLICATE_ERROR":"VALUE_DUPLICATE_ERROR","VALUE_ERROR":"VALUE_ERROR","VALUE_INVALID_ERROR":"VALUE_INVALID_ERROR","VALUE_MISSING_ERROR":"VALUE_MISSING_ERROR","VALUE_NUMBER_ERROR":"VALUE_NUMBER_ERROR","VALUE_NUMBER_INVALID_ERROR":"VALUE_NUMBER_INVALID_ERROR","VALUE_NUMBER_TOO_LARGE_ERROR":"VALUE_NUMBER_TOO_LARGE_ERROR","VALUE_NUMBER_TOO_SMALL_ERROR":"VALUE_NUMBER_TOO_SMALL_ERROR","VALUE_STRING_ERROR":"VALUE_STRING_ERROR","VALUE_STRING_INVALID_ERROR":"VALUE_STRING_INVALID_ERROR","VALUE_STRING_TOO_LONG_ERROR":"VALUE_STRING_TOO_LONG_ERROR","VALUE_STRING_TOO_SHORT_ERROR":"VALUE_STRING_TOO_SHORT_ERROR","VALUE_TYPE_ERROR":"VALUE_TYPE_ERROR","VALUE_TYPE_INVALID_ERROR":"VALUE_TYPE_INVALID_ERROR"},"footer":{"COPY_RIGHT":"Copyright © 2016 REALGLOBE. All Rights Reserved","LINKS_TITLE":"Links"},"guides":{},"headings":{"REFERENCE_API":"APIs","REFERENCE_README":"READMEs"},"jumbotron":{},"labels":{},"leads":{"QUICK_START_LEAD_01":"Three steps to start"},"links":{},"logo":{"LOGO":"SUGOS"},"menu":{},"messages":{},"notices":{},"org":{},"pages":{"CASES_PAGE":"Cases","DOCS_PAGE":"Docs"},"placeholders":{},"status":{"400":"Bad Request","401":"Authentication is required","403":"You don't have permissions","404":"Could not find resource","500":"Something wrong with the server","502":"Bad gateway error","503":"Server not available"},"titles":{"CASE_CURL_RAPIRO_TITLE":"Control RAPIRO Robot via curl Command","CASE_DRONE_TITLE":"Fly ArDrone with Preset","CASE_EDISON_ROOMBA_TITLE":"Control Roomba with Edison","CASE_EDISON_STREAM_TITLE":"Crate network Camera with Edison and WebCOM","CASE_GYRO_TITLE":"Make Pepper to follow iPhone Motion","CASE_HITOE_TITLE":"Watch HeartBeat with HITOE Sensor and Display It on Google Map","CASE_PLEN_TITLE":"Control PLEN Robot from Browser","CASE_SENSE_TITLE":"Detect Human Motions with Kinnect","CASE_SPEECH_RECOGNITION_TITLE":"Pepper Talk from HTML5 Recognition API","CASE_TEXT_INPUT_TITLE":"Pepper Talk from Chat UI","CASES_PAGE_TITLE":"Cases","DOCS_PAGE_TITLE":"Docs","GUIDE_ACTOR_TITLE":"Declare Modules on SUGO-Actor","GUIDE_CALLER_TITLE":"Access to Modules from SUGO-Caller","GUIDE_CLOUD_TITLE":"Setup SUGO-Hub","GUIDES_TITLE":"Guidance Documents of SUGOS","SHOWCASE_TITLE":"Use Cases of SUGOS","UI_TITLE":"SUGOS"},"toasts":{},"toggles":{"QUICK_START":"Quick Start","REFERENCES":"References","TIPS":"Tips"},"$vars":{},"$fallback":{}}}};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/markdown_constants.jsx":[function(require,module,exports){
'use strict';
module.exports = { "en": { "01.about-this": "Forget about networks. SUGOS enables you to call remote functions as if they are there.\n\n\n", "02.how-it-works": "SUGOS is consisting of three parts.\n\n+ [SUGO-Hub][sugo_hub_url] - Http server which works as a hub for callers and actors.\n+ [SUGO-Actor][sugo_actor_url] - Http client to receive commands and kick functions  \n+ [SUGO-Caller][sugo_caller_url] - Http client to send procedure call to remote actor\n\n<img src='images/sugos-overview.png' />\n\nOnce you declare a function on an actor, the hub server shares it's signature with callers.\nThen, the callers dynamically define functions to wrap remote procedure calling.     \n\nThus, function like\n\n```javascript\nfunction sayHelloTo(name){ /* ... */}\n``` \n\non the actor-side cloud be called as\n\n```javascript\nsayHelloTo(\"Liz\")\n```\n\nfrom the caller-side.\n\n\n[sugo_hub_url]: https://github.com/realglobe-Inc/sugo-hub \n[sugo_actor_url]: https://github.com/realglobe-Inc/sugo-actor \n[sugo_caller_url]: https://github.com/realglobe-Inc/sugo-client \n", "03.what-to-use": "With SUGOS, you can build IoT applications or or Cloud-Robotics quite easily.\n\nSee [use cases](./cases.html) to know what we do with SUGOS.\n \nIn addition to that, we have [more live examples](https://github.com/realglobe-Inc/sugos#more-examples) which you can deploy to your heroku.   \n\n\n", "10.quick-start": "", "11.setup-hub": "Setup a [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub) server for actors and callers.", "12.declare-on-sugo-actor": "Create a [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor) instance and declare modules. Then, connect to the cloud server.", "13.call-from-sugo-caller": "Create a [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller) instance and connect to the actor with key.\nThen get access to modules and call functions as you like.\n", "20.case-plen": "SUGOS make it super easy to controlling robot remotely.\n\nFor example, you can control [PLEN][plen_url] robot from web browser.\n\nThe way it works is:\n\n1. Tapping button on browser kicks SUGO-Caller methods\n2. SUGO-Caller send packets to remote SUGO-Actor via SUGO-Hub\n3. SUGO-Actor received a command and drive the robot connected \n\n[plen_url]: https://plen.jp/\n", "21.case-drone": "Once you setup modules on actor, you can easily customize logic to call then on caller side.\n\nFor example, define preset for [ArDrone][ardrone_url] about how it flies. A simple Javascript on browser would do this. \n  \n[ardrone_url]: http://www.parrot.com/usa/products/ardrone-2/\n", "22.case-kinect": "\nNot only sending commands. SUGOS supports event-emit interface, which enables you to receive events from remote actor.\n   \nThis is an example to detect human body frame with [Kinect Sensor][kinect_url] and display the result on remote browser. \n\n[kinect_url]: https://msdn.microsoft.com/en-us/library/hh438998.aspx\n", "23.case-pepper-voice": "Sinces SUGO-Callers run on browsers, you can easliy combine web browser feature like [Web Speech API][html5_speech_api_url].\n\nFor example, detect speech with browser and make pepper to talk it.\n\n[html5_speech_api_url]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API\n", "24.case-pepper-text": "Or, just create a text-box and make the pepper to talk it.", "25.roomba-edison": "With some little handy work, SUGOS makes even more fun!\n \nThis is an example to control [Roomba vacuuming robot][roomba_url] via [Intel Edison Board][edison_url]\n\nA SUGO-Actor instance runs on the Edison and send commands to Roomba serial port.\n\n  \n\n[roomba_url]: http://www.irobot.com/For-the-Home/Vacuuming/Roomba.aspx\n[edison_url]: http://www.intel.com/content/www/us/en/do-it-yourself/edison.html", "26.edison-webcom": "SUGOS event interface enables you to send data from SUGO-Actor to SUGO-Caller.\n   \nFor example, run a SUGO-Actor instance on Edison Board and send video stream data from a webcom. \n", "27.curl-rapiro": "Sometimes you want to send command via simple HTTP request, without SUGO-Callers.\n\nLittle trick with hub servers would do this. \nSUGO-Hub is based on [Koa][koa_url] framework, and you can add your own middleware on it.\n\n \n[koa_url]: https://github.com/koajs/koa\n", "28.hitoe-map": "Mashing up device and web API is one of the most powerful use cases for SUGOS.\n \nFor example, use [Hitoe sensor][hitoe_url] to detect sudden illness and display location of the patient on Google Map\n\n[hitoe_url]: https://www.ntt-review.jp/archive/ntttechnical.php?contents=ntr201409ra1.html", "29.iphone-pepper": "A single SUGO-Caller may connect multiple SUGO-Actors.\n\nThis example shows detecting motion from iOS and sending it to pepper robot.", "actor": "# sugo-actor@4.4.2\n\nActor component of SUGOS.\n\n+ Functions\n  + [sugoActor(config)](#sugo-actor-function-sugo-actor)\n+ [SugoActor](sugo-actor-classes) Class\n  + [new SugoActor(url, config)](#sugo-actor-classes-sugo-actor-constructor)\n  + [actor.connect()](#sugo-actor-classes-sugo-actor-connect)\n  + [actor.disconnect()](#sugo-actor-classes-sugo-actor-disconnect)\n  + [actor.perform(data)](#sugo-actor-classes-sugo-actor-perform)\n  + [actor.load(moduleName, module)](#sugo-actor-classes-sugo-actor-load)\n  + [actor.loadSub(moduleName, subModules)](#sugo-actor-classes-sugo-actor-loadSub)\n  + [actor.unload(name)](#sugo-actor-classes-sugo-actor-unload)\n\n## Functions\n\n<a name=\"sugo-actor-function-sugo-actor\" ></a>\n\n### sugoActor(config) -> `SugoActor`\n\nCreate an actor instance. Just an alias of `new SugoActor(config)`\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| config | Object | Sugo caller configuration |\n\n```javascript\nco(function * () {\n  let actor = sugoActor({\n    key: 'my-actor-01',\n    modules: {\n    }\n  })\n  yield actor.connect()\n}).catch((err) => console.error(err))\n```\n\n\n<a name=\"sugo-actor-classes\"></a>\n\n## SugoActor Class\n\n\n\n\n<a name=\"sugo-actor-classes-sugo-actor-constructor\" ></a>\n\n### new SugoActor(url, config)\n\nConstructor of SugoActor class\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| url | string | Cloud server url |\n| config | object | Configurations |\n| config.key | string | Key of actor |\n| config.auth | object | Auth object |\n| config.modules | object.&lt;String, SugoActorModule&gt; | Modules to load. |\n\n\n<a name=\"sugo-actor-classes-sugo-actor-connect\" ></a>\n\n### actor.connect() -> `Promise`\n\nConnect to hub.\nBy call this, actor share specification of the modules to hub so that callers can access them.\n\n<a name=\"sugo-actor-classes-sugo-actor-disconnect\" ></a>\n\n### actor.disconnect() -> `Promise`\n\nDisconnect from the hub\n\n<a name=\"sugo-actor-classes-sugo-actor-perform\" ></a>\n\n### actor.perform(data) -> `Promise`\n\nHandle perform event\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| data | object |  |\n\n\n<a name=\"sugo-actor-classes-sugo-actor-load\" ></a>\n\n### actor.load(moduleName, module) -> `Promise`\n\nLoad a module\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| moduleName | string | Name of module |\n| module | Object | Module to load |\n\n\n<a name=\"sugo-actor-classes-sugo-actor-loadSub\" ></a>\n\n### actor.loadSub(moduleName, subModules) -> `Promise`\n\nLoad submodules\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| moduleName | string |  |\n| subModules | Object |  |\n\n\n<a name=\"sugo-actor-classes-sugo-actor-unload\" ></a>\n\n### actor.unload(name) -> `Promise`\n\nUnload module with name\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| name | string | Name of module |\n\n\n\n\n", "caller": "# sugo-caller@3.0.3\n\nCaller component of SUGOS.\n\n+ Functions\n  + [sugoCaller(config)](#sugo-caller-function-sugo-caller)\n+ [SugoCaller](sugo-caller-classes) Class\n  + [new SugoCaller(config)](#sugo-caller-classes-sugo-caller-constructor)\n  + [caller.connect(key)](#sugo-caller-classes-sugo-caller-connect)\n  + [caller.disconnect(key)](#sugo-caller-classes-sugo-caller-disconnect)\n+ [ActorAccessBundle](sugo-caller-classes) Class\n  + [new ActorAccessBundle()](#sugo-caller-classes-actor-access-bundle-constructor)\n  + [bundle.get(moduleName, options)](#sugo-caller-classes-actor-access-bundle-get)\n  + [bundle.has(moduleName)](#sugo-caller-classes-actor-access-bundle-has)\n  + [bundle.set(moduleName, module, options)](#sugo-caller-classes-actor-access-bundle-set)\n  + [bundle.del(moduleName)](#sugo-caller-classes-actor-access-bundle-del)\n  + [bundle.names()](#sugo-caller-classes-actor-access-bundle-names)\n\n## Functions\n\n<a name=\"sugo-caller-function-sugo-caller\" ></a>\n\n### sugoCaller(config) -> `SugoCaller`\n\nCreate a caller instance. Just an alias of `new SugoCaller(config)`\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| config | Object | Sugo caller configuration |\n\n```javascript\nco(function * () {\n  let caller = sugoCaller({})\n  let actor01 = yield caller.connect('my-actor-01')\n  let foo = actor01.get('foo') // Get a module of actor\n  yield foo.sayYeah() // Call the remote function\n}).catch((err) => console.error(err))\n```\n\n\n<a name=\"sugo-caller-classes\"></a>\n\n## SugoCaller Class\n\nHub client for caller side.\nWhen you connect to remote actor with a caller, it receives specification of the actor and dynamically define function kick actor side function.\nThis way you can magically call functions declared on remote as if they were here.\n\n\n<a name=\"sugo-caller-classes-sugo-caller-constructor\" ></a>\n\n### new SugoCaller(config)\n\nConstructor of SugoCaller class\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| config | Object | Caller configuration |\n| config.protocol | string | Protocol to use ( \"http\" or \"https\" ) |\n| config.host | string | Hub host name. ( eg: \"localhost:3000\" ) |\n| config.pathname | string | Hub URL path name ( eg: \"/callers\" ) |\n| config.auth | Object | Auth data for hub |\n\n\n<a name=\"sugo-caller-classes-sugo-caller-connect\" ></a>\n\n### caller.connect(key) -> `Promise.<ActorAccessBundle>`\n\nConnect to actor\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| key | string | Key of actor |\n\n\n<a name=\"sugo-caller-classes-sugo-caller-disconnect\" ></a>\n\n### caller.disconnect(key) -> `Promise`\n\nDisconnect from cloud server\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| key | string | Key of actor to connect |\n\n\n<a name=\"sugo-caller-classes\"></a>\n\n## ActorAccessBundle Class\n\nBundle for actor access.\nThis class provides access for loaded modules on actor.\n\n\n<a name=\"sugo-caller-classes-actor-access-bundle-constructor\" ></a>\n\n### new ActorAccessBundle()\n\nConstructor of ActorAccessBundle class\n\n\n\n<a name=\"sugo-caller-classes-actor-access-bundle-get\" ></a>\n\n### bundle.get(moduleName, options) -> `ActorAccessModule`\n\nGet a module\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| moduleName | string | Name of module |\n| options | Object | Optional settings |\n\n\n<a name=\"sugo-caller-classes-actor-access-bundle-has\" ></a>\n\n### bundle.has(moduleName) -> `Boolean`\n\nCheck if module exists\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| moduleName | string | Name of module |\n\n\n<a name=\"sugo-caller-classes-actor-access-bundle-set\" ></a>\n\n### bundle.set(moduleName, module, options)\n\nSet module\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| moduleName | string | Name of module |\n| module | ActorAccessModule | Module to set |\n| options | Object | Optional settings |\n\n\n<a name=\"sugo-caller-classes-actor-access-bundle-del\" ></a>\n\n### bundle.del(moduleName)\n\nDelete module\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| moduleName | string | Name of module |\n\n\n<a name=\"sugo-caller-classes-actor-access-bundle-names\" ></a>\n\n### bundle.names() -> `Array.<string>`\n\nGet names of modules\n\n\n\n", "hub": "# sugo-hub@4.0.1\n\nHub server of SUGOS\n\n+ Functions\n  + [sugoHub()](#sugo-hub-function-sugo-hub)\n+ [SugoHub](sugo-hub-classes) Class\n  + [new SugoHub(options)](#sugo-hub-classes-sugo-hub-constructor)\n\n## Functions\n\n<a name=\"sugo-hub-function-sugo-hub\" ></a>\n\n### sugoHub() -> `Promise.<SugoHub>`\n\nCreate a hub instance. Just an alias of `new SugoCaller(config)`\n```javascript\nco(function * () {\n  let cloud = sugoHub({\n  // Options here\n  })\n  yield hub.listen(3000)\n}).catch((err) => console.error(err))\n```\n\n\n<a name=\"sugo-hub-classes\"></a>\n\n## SugoHub Class\n\nHub server of SUGOS\n\n\n<a name=\"sugo-hub-classes-sugo-hub-constructor\" ></a>\n\n### new SugoHub(options)\n\nConstructor of SugoHub class\n\n| Param | Type | Description |\n| ----- | --- | -------- |\n| options | Object | Optional settings |\n| options.storage | string,Object | Storage options |\n| config.keys | string | Koa keys |\n| options.endpoints | Object | Endpoint settings |\n| config.context | Object | Koa context prototype |\n| config.public | string | Public directories. |\n| options.invalidateInterval | number | Interval for invalidate loop |\n\n\n\n\n", "tip-module-variations": "## Ways to Declare Actor Modules\n\nThere are several ways to declare a module for actor\n\n### new Module(methods)\n\nThe most basic way is passing object represents methods\n\n```javascript\nconst sugoActor = require('sugo-actor')\nconst {Module} = sugoActor\n\nlet module01 = new Module({\n  doSomething () { /* ... */ }\n})\n\n```\n\n### new Module(func)\n \nMethods could be a single functions. \n\n```javascript\nlet module02 = new Module(function asFunc () { /* ... */ })\n```\n\nThe module it self will be a function on caller side.\n\nFor more detail, see https://github.com/realglobe-Inc/sugo-actor#declare-a-single-function-as-module\n\n\n### new (class Custom {} extends Module)()\n\nActor accepts instances of custom class which extends `Module`. \n\n```javascript\nclass CustomModule extends Module {\n  doSomething () { /* ... */ }\n}\nlet module03 = new CustomModule()\n```\n\nFor more detail, see https://github.com/realglobe-Inc/sugo-module-base#define-custom-class\n\n\n### new (Module.modularize(SomeClass))()\n\nIf you want use existing class which is not a sub class of `Module`, make it actor-compatible with `Module.modularize()` utility.   \n\n```javascript\nclass MyClass {\n  doSomething () { /* ... */ }\n}\n\nconst MyClassModularized = Module.modularize(MyClass)\n \nlet module04 = new MyClassModularized()\n```\n\nFor more detail, see https://github.com/realglobe-Inc/sugo-module-base#modularize-existing-class" }, "ja": {} };

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/snippet_constants.jsx":[function(require,module,exports){
'use strict';
module.exports = { "exampleCloud": "<div id=\"highlighter_582932\" class=\"syntaxhighlighter nogutter  \"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tbody><tr><td class=\"code\"><div class=\"container\"><div class=\"line number1 index0 alt2\"><code class=\"preprocessor\">#!/usr/bin/env node</code></div><div class=\"line number2 index1 alt1\"><code class=\"comments\">/**</code></div><div class=\"line number3 index2 alt2\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">* This is an example of SUGO-Hub</code></div><div class=\"line number4 index3 alt1\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">* @see <a href=\"https://github.com/realglobe-Inc/sugo-hub\">https://github.com/realglobe-Inc/sugo-hub</a></code></div><div class=\"line number5 index4 alt2\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">*/</code></div><div class=\"line number6 index5 alt1\"><code class=\"string\">'use strict'</code></div><div class=\"line number7 index6 alt2\">&nbsp;</div><div class=\"line number8 index7 alt1\"><code class=\"plain\">const sugoHub = require(</code><code class=\"string\">'sugo-hub'</code><code class=\"plain\">)</code></div><div class=\"line number9 index8 alt2\"><code class=\"plain\">const co = require(</code><code class=\"string\">'co'</code><code class=\"plain\">)</code></div><div class=\"line number10 index9 alt1\">&nbsp;</div><div class=\"line number11 index10 alt2\"><code class=\"plain\">co(</code><code class=\"keyword\">function</code> <code class=\"plain\">* () {</code></div><div class=\"line number12 index11 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"comments\">// Start sugo-hub server</code></div><div class=\"line number13 index12 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">let hub = yield sugoHub({}).listen(3000)</code></div><div class=\"line number14 index13 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">console.log(`SUGO Hub started at port: ${hub.port}`)</code></div><div class=\"line number15 index14 alt2\"><code class=\"plain\">}).</code><code class=\"keyword\">catch</code><code class=\"plain\">((err) => console.error(err))</code></div></div></td></tr></tbody></table></div>", "exampleActor": "<div id=\"highlighter_638659\" class=\"syntaxhighlighter nogutter  \"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tbody><tr><td class=\"code\"><div class=\"container\"><div class=\"line number1 index0 alt2\"><code class=\"preprocessor\">#!/usr/bin/env</code></div><div class=\"line number2 index1 alt1\">&nbsp;</div><div class=\"line number3 index2 alt2\"><code class=\"comments\">/**</code></div><div class=\"line number4 index3 alt1\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">* This is an example of SUGO-Actor</code></div><div class=\"line number5 index4 alt2\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">* @see <a href=\"https://github.com/realglobe-Inc/sugo-actor\">https://github.com/realglobe-Inc/sugo-actor</a></code></div><div class=\"line number6 index5 alt1\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">*/</code></div><div class=\"line number7 index6 alt2\"><code class=\"string\">'use strict'</code></div><div class=\"line number8 index7 alt1\">&nbsp;</div><div class=\"line number9 index8 alt2\"><code class=\"plain\">const sugoActor = require(</code><code class=\"string\">'sugo-actor'</code><code class=\"plain\">)</code></div><div class=\"line number10 index9 alt1\"><code class=\"plain\">const { Module } = sugoActor</code></div><div class=\"line number11 index10 alt2\"><code class=\"plain\">const co = require(</code><code class=\"string\">'co'</code><code class=\"plain\">)</code></div><div class=\"line number12 index11 alt1\">&nbsp;</div><div class=\"line number13 index12 alt2\"><code class=\"plain\">co(</code><code class=\"keyword\">function</code> <code class=\"plain\">* () {</code></div><div class=\"line number14 index13 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">let actor = sugoActor({</code></div><div class=\"line number15 index14 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">/** Host of hub to connect */</code></div><div class=\"line number16 index15 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">hostname: </code><code class=\"string\">'localhost'</code><code class=\"plain\">,</code></div><div class=\"line number17 index16 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">port: 3000,</code></div><div class=\"line number18 index17 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">/** Name to identify this actor on the hub */</code></div><div class=\"line number19 index18 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">key: </code><code class=\"string\">'my-actor-01'</code><code class=\"plain\">,</code></div><div class=\"line number20 index19 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">/** Modules to provide */</code></div><div class=\"line number21 index20 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">modules: {</code></div><div class=\"line number22 index21 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">// Example of a simple call-return function module</code></div><div class=\"line number23 index22 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">tableTennis: </code><code class=\"keyword\">new</code> <code class=\"plain\">Module({</code></div><div class=\"line number24 index23 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">ping (pong = </code><code class=\"string\">'default pong!'</code><code class=\"plain\">) {</code></div><div class=\"line number25 index24 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"keyword\">return</code> <code class=\"plain\">co(</code><code class=\"keyword\">function</code> <code class=\"plain\">* () {</code></div><div class=\"line number26 index25 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">/* ... */</code></div><div class=\"line number27 index26 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"keyword\">return</code> <code class=\"plain\">`</code><code class=\"string\">\"${pong}\"</code> <code class=\"plain\">from actor!` </code><code class=\"comments\">// Return to the remote caller</code></div><div class=\"line number28 index27 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">})</code></div><div class=\"line number29 index28 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">}</code></div><div class=\"line number30 index29 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">}),</code></div><div class=\"line number31 index30 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">// Load plugin module</code></div><div class=\"line number32 index31 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">timeBomb: require(</code><code class=\"string\">'./example-time-bomb-module'</code><code class=\"plain\">)({})</code></div><div class=\"line number33 index32 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">}</code></div><div class=\"line number34 index33 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">})</code></div><div class=\"line number35 index34 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">yield actor.connect() </code><code class=\"comments\">// Connect to the hub server</code></div><div class=\"line number36 index35 alt1\"><code class=\"plain\">}).</code><code class=\"keyword\">catch</code><code class=\"plain\">((err) => console.error(err))</code></div></div></td></tr></tbody></table></div>", "exampleCaller": "<div id=\"highlighter_352362\" class=\"syntaxhighlighter nogutter  \"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tbody><tr><td class=\"code\"><div class=\"container\"><div class=\"line number1 index0 alt2\"><code class=\"preprocessor\">#!/usr/bin/env</code></div><div class=\"line number2 index1 alt1\">&nbsp;</div><div class=\"line number3 index2 alt2\"><code class=\"comments\">/**</code></div><div class=\"line number4 index3 alt1\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">* This is an example of SUGO-Caller</code></div><div class=\"line number5 index4 alt2\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">* @see <a href=\"https://github.com/realglobe-Inc/sugo-caller\">https://github.com/realglobe-Inc/sugo-caller</a></code></div><div class=\"line number6 index5 alt1\"><code class=\"undefined spaces\">&nbsp;</code><code class=\"comments\">*/</code></div><div class=\"line number7 index6 alt2\"><code class=\"string\">'use strict'</code></div><div class=\"line number8 index7 alt1\">&nbsp;</div><div class=\"line number9 index8 alt2\"><code class=\"plain\">const sugoCaller = require(</code><code class=\"string\">'sugo-caller'</code><code class=\"plain\">)</code></div><div class=\"line number10 index9 alt1\"><code class=\"plain\">const co = require(</code><code class=\"string\">'co'</code><code class=\"plain\">)</code></div><div class=\"line number11 index10 alt2\">&nbsp;</div><div class=\"line number12 index11 alt1\"><code class=\"plain\">co(</code><code class=\"keyword\">function</code> <code class=\"plain\">* () {</code></div><div class=\"line number13 index12 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">let caller = sugoCaller({</code></div><div class=\"line number14 index13 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"comments\">// Host of hub to connect</code></div><div class=\"line number15 index14 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">hostname: </code><code class=\"string\">'localhost'</code><code class=\"plain\">,</code></div><div class=\"line number16 index15 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">port: 3000</code></div><div class=\"line number17 index16 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">})</code></div><div class=\"line number18 index17 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"comments\">// Connect to an actor with key</code></div><div class=\"line number19 index18 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">let actor01 = yield caller.connect(</code><code class=\"string\">'my-actor-01'</code><code class=\"plain\">)</code></div><div class=\"line number20 index19 alt1\">&nbsp;</div><div class=\"line number21 index20 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"comments\">// Using call-return function</code></div><div class=\"line number22 index21 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">{</code></div><div class=\"line number23 index22 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">let tableTennis = actor01.get(</code><code class=\"string\">'tableTennis'</code><code class=\"plain\">)</code></div><div class=\"line number24 index23 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">let pong = yield tableTennis.ping(</code><code class=\"string\">'hey!'</code><code class=\"plain\">)</code></div><div class=\"line number25 index24 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">console.log(pong) </code><code class=\"comments\">// -> `\"hey!\" from call!`</code></div><div class=\"line number26 index25 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">}</code></div><div class=\"line number27 index26 alt2\">&nbsp;</div><div class=\"line number28 index27 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"comments\">// Using event emitting interface</code></div><div class=\"line number29 index28 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">{</code></div><div class=\"line number30 index29 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">let timeBomb = actor01.get(</code><code class=\"string\">'timeBomb'</code><code class=\"plain\">)</code></div><div class=\"line number31 index30 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">let tick = (data) => console.log(`tick: ${data.count}`)</code></div><div class=\"line number32 index31 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">timeBomb.on(</code><code class=\"string\">'tick'</code><code class=\"plain\">, tick) </code><code class=\"comments\">// Add listener</code></div><div class=\"line number33 index32 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">let booom = yield timeBomb.countDown(10)</code></div><div class=\"line number34 index33 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">console.log(booom)</code></div><div class=\"line number35 index34 alt2\"><code class=\"undefined spaces\">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class=\"plain\">timeBomb.off(</code><code class=\"string\">'tick'</code><code class=\"plain\">, tick) </code><code class=\"comments\">// Remove listener</code></div><div class=\"line number36 index35 alt1\"><code class=\"undefined spaces\">&nbsp;&nbsp;</code><code class=\"plain\">}</code></div><div class=\"line number37 index36 alt2\"><code class=\"plain\">}).</code><code class=\"keyword\">catch</code><code class=\"plain\">((err) => console.error(err))</code></div></div></td></tr></tbody></table></div>" };

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/storage_constants.jsx":[function(require,module,exports){
'use strict';
module.exports = { "GUIDE_STATE_KEY": "guide.state" };

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/entrypoints/index_entrypoint.jsx":[function(require,module,exports){
'use strict';

var _sgReact = require('sg-react');

var _index_component = require('../components/index_component');

var _index_component2 = _interopRequireDefault(_index_component);

var _redirect_service = require('../services/redirect_service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONTAINER_ID = 'index-wrap';

(0, _sgReact.once)('DOMContentLoaded', function () {
  var _window = window,
      locale = _window.locale;

  (0, _sgReact.mount)(CONTAINER_ID, _index_component2.default, {
    locale: locale
  }).then(function () {
    // The component is ready.
  });
});

},{"../components/index_component":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/components/index_component.jsx","../services/redirect_service":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/redirect_service.jsx","sg-react":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sg-react/shim/browser/index.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/link_service.jsx":[function(require,module,exports){
(function (process){
/**
 * @class LinkService
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var abind = require('abind');

/** @lends LinkService */

var LinkService = function () {
  function LinkService() {
    _classCallCheck(this, LinkService);
  }

  _createClass(LinkService, [{
    key: 'resolveHtmlLink',


    /**
     * Resolve a html link
     * @param {string} filename - Html file name
     * @returns {string} - Resolved file name
     */
    value: function resolveHtmlLink(filename) {
      var s = this;
      var lang = s._getLang();
      var htmlDir = lang ? 'html/' + lang : 'html';
      return path.join(htmlDir, filename);
    }
  }, {
    key: '_getLang',
    value: function _getLang() {
      if (typeof window === 'undefined') {
        return process.env.LANG;
      }
      return window.lang;
    }
  }]);

  return LinkService;
}();

var singleton = new LinkService();

Object.assign(LinkService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = LinkService;

}).call(this,require('_process'))

},{"_process":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/process/browser.js","abind":"abind","path":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/path-browserify/index.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/locale_service.jsx":[function(require,module,exports){
/**
 * @class LocaleService
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var abind = require('abind');

var _require = require('bwindow'),
    get = _require.get;

var loc = require('../constants/loc_constants.json');

/**
 * Create a resolver function for message
 * @param {Object} messages - Message data
 * @returns {function}
 */
function messageResolver(messages) {
  /**
   * Resolver function
   * @param {string} keypath - Keypath to resolve
   */
  return function resolver(keypath) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _options$formatter = options.formatter,
        _formatter = _options$formatter === undefined ? function (message) {
      return message;
    } : _options$formatter;

    if (!keypath) {
      return keypath;
    }
    if ((typeof keypath === 'undefined' ? 'undefined' : _typeof(keypath)) === 'object') {
      return Object.keys(keypath).filter(function (key) {
        return !/^\$/.test(key);
      }).reduce(function (resolved, key) {
        return Object.assign(resolved, _defineProperty({}, key, resolver(keypath[key], {
          formatter: function formatter(message) {
            return _formatter(message, key);
          }
        })));
      }, {});
    }
    var keys = keypath.split(/\./);
    var data = messages;
    while (data && keys.length > 0) {
      var key = keys.shift();
      var message = data[key];
      if (typeof message === 'string') {
        return _formatter(message);
      }
      data = message;
    }
    console.warn('Message not found with keypath: ' + keypath);
  };
}

/**
 * Create a multiple message resolvers
 * @param messages
 * @returns {Array}
 */
function messageResolvers(messages) {
  return Object.keys(messages).reduce(function (resolvers, lang) {
    return Object.assign(resolvers, _defineProperty({}, lang, messageResolver(messages[lang])));
  }, {});
}

/** @lends LocaleService */

var LocaleService = function () {
  function LocaleService() {
    var lang = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'en';

    _classCallCheck(this, LocaleService);

    var s = this;
    abind(s);
    s.setLang(lang);
    s.setLoc(loc);
  }

  _createClass(LocaleService, [{
    key: 'setLoc',
    value: function setLoc(loc) {
      var s = this;
      s.resolvers = messageResolvers(loc);
    }

    /**
     * Set lang
     * @param lang
     */

  }, {
    key: 'setLang',
    value: function setLang(lang) {
      var s = this;
      s.lang = lang;
    }

    /**
     * Localize message
     * @param keypath - Message key path
     * @param {Object} [options=[]} - Optional settings
     * @returns {Promise}
     */

  }, {
    key: 'localize',
    value: function localize(keypath) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var s = this;
      var resolvers = s.resolvers,
          lang = s.lang;

      var resolver = resolvers[lang] || resolvers[Object.keys(resolvers).shift()];
      return resolver(keypath, options);
    }

    /**
     * Alias for localize function
     * @param {...*} args - Args to resolve
     * @returns {string} - Resolved messaged
     */

  }, {
    key: 'l',
    value: function l() {
      var s = this;
      return s.localize.apply(s, arguments);
    }
  }]);

  return LocaleService;
}();

var singleton = new LocaleService();

Object.assign(LocaleService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = LocaleService;

},{"../constants/loc_constants.json":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/loc_constants.json","abind":"abind","bwindow":"bwindow"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/markdown_service.jsx":[function(require,module,exports){
/**
 * @class MarkdownService
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.singleton = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _abind = require('abind');

var _abind2 = _interopRequireDefault(_abind);

var _os = require('os');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @lends MarkdownService */
var MarkdownService = function () {
  function MarkdownService() {
    _classCallCheck(this, MarkdownService);

    var s = this;
    (0, _abind2.default)(s);
  }

  /**
   * Get markdown with name
   * @param {string} name - Name of markdown
   * @returns {?string} - Matched markdown
   */


  _createClass(MarkdownService, [{
    key: 'getMarkdown',
    value: function getMarkdown(name) {
      var s = this;
      var markdowns = s._getMarkdowns();
      return markdowns[name];
    }
  }, {
    key: 'getMarkdownHeading',
    value: function getMarkdownHeading(name) {
      var s = this;
      var markdown = s.getMarkdown(name);
      return markdown && markdown.trim().split(_os.EOL).shift().trim().replace(/^#+/, '').trim();
    }
  }, {
    key: '_getMarkdowns',
    value: function _getMarkdowns() {
      if (typeof window === 'undefined') {
        return require('../constants/markdown_constants');
      }
      return window.markdowns;
    }
  }]);

  return MarkdownService;
}();

var singleton = new MarkdownService();

Object.assign(MarkdownService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = MarkdownService;

},{"../constants/markdown_constants":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/markdown_constants.jsx","abind":"abind","os":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/os-browserify/browser.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/redirect_service.jsx":[function(require,module,exports){
/**
 * @class RedirectService
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var url = require('url');
var debug = require('debug')('sg:services:redirect');

var RedirectService = function () {
  function RedirectService() {
    _classCallCheck(this, RedirectService);
  }

  _createClass(RedirectService, [{
    key: 'redirectIfNotAuth',
    value: function redirectIfNotAuth() {
      var referrer = url.parse(document.referrer).hostname;
      var hostname = window.location.hostname;

      if (!hostname) {
        return;
      }
      var hosts = [hostname, 'www.sugos.tech', 'sugos-tech-ghpage-proxy.herokuapp.com'];
      debug('referrer host: ' + referrer);
      if (!hosts.includes(referrer) && hostname !== 'www.sugos.tech') {
        debug('redirecting to http://www.sugos.tech');
        window.location.href = 'http://www.sugos.tech';
      }
    }
  }]);

  return RedirectService;
}();

var singleton = new RedirectService();

Object.assign(RedirectService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = RedirectService;

},{"debug":"debug","url":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/url/url.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/services/snippet_service.jsx":[function(require,module,exports){
/**
 * @class SnippetService
 */
'use strict';

/** @lends SnippetService */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SnippetService = function () {
  function SnippetService() {
    _classCallCheck(this, SnippetService);
  }

  _createClass(SnippetService, [{
    key: 'getSnippet',

    /**
     * Get snippet with name
     * @param {string} name - Name of snippet
     * @returns {?string} - Matched snippet
     */
    value: function getSnippet(name) {
      var s = this;
      var snippets = s._getSnippets();
      return snippets[name];
    }
  }, {
    key: '_getSnippets',
    value: function _getSnippets() {
      if (typeof window === 'undefined') {
        return require('../constants/snippet_constants');
      }
      return window.snippets;
    }
  }]);

  return SnippetService;
}();

var singleton = new SnippetService();

Object.assign(SnippetService, {
  singleton: singleton
});

exports.singleton = singleton;
exports.default = SnippetService;

},{"../constants/snippet_constants":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/constants/snippet_constants.jsx"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/asleep/asleep.js":[function(require,module,exports){
/*
  asleep 1.0.3
 
  April 2016 Nodebite AB, Thomas Frank

  MIT Licensed - use anywhere you want!

  Non-blocking sleep in ES7 (or, in ES6, setTimeout as a promise)
*/

/*
  Nodebite code style -> jshint settings below, also 
  indent = 2 spaces, keep your rows reasonably short
  also try to keep your methods below sceen height.
*/
/* jshint 
  loopfunc: true,
  trailing: true,
  sub: true,
  expr: true,
  noarg: false,
  forin: false
*/

module.exports = function(sleepMs){
  var res;
  setTimeout(function(){ res(); }, sleepMs);
  return new Promise(function(a){ res = a; });
};

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/json/stringify.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/json/stringify.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/object/assign.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/object/assign.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/object/define-property.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/object/define-property.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/promise.js":[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/promise.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/helpers/defineProperty.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};
},{"../core-js/object/define-property":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/object/define-property.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_local_storage.js":[function(require,module,exports){
/**
 * Get local storage object
 * @function getLocalStorage
 * @returns {?Object} Local storage instance
 */
'use strict';

var _require = require('bwindow');

var get = _require.get;

/** @lends getLocalStorage */

function getLocalStorage() {
  return get('localStorage', { strict: false });
}

module.exports = getLocalStorage;

},{"bwindow":"bwindow"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_query.js":[function(require,module,exports){
/**
 * Get query from location
 * @function getQuery
 * @returns {?Object} - Query
 */
'use strict';

var _require = require('bwindow');

var get = _require.get;

var _require2 = require('qs');

var parse = _require2.parse;

/** @lends getQuery */

function getQuery() {
  var location = get('location');
  if (!location) {
    return null;
  }
  var search = location.search;

  return search && parse(search.replace(/^\?/, ''));
}

module.exports = getQuery;

},{"bwindow":"bwindow","qs":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/index.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/set_query.js":[function(require,module,exports){
/**
 * Update query on location
 * @function setQuery
 * @param {Object} query - Query object to set
 * @returns {boolean} - Succeed or not
 */
'use strict';

var _require = require('bwindow');

var get = _require.get;

var _require2 = require('qs');

var stringify = _require2.stringify;

/** @lends setQuery */

function setQuery(query) {
  var history = get('history');
  var location = get('location');
  var valid = !!history && !!location;
  if (!valid) {
    return false;
  }
  history.pushState(null, null, [location.pathname, stringify(query)].join('?'));
  return true;
}

module.exports = setQuery;

},{"bwindow":"bwindow","qs":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/index.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/index.js":[function(require,module,exports){
/**
 * Browser local-storage wrapper
 * @module bstorage
 */

'use strict';

var d = function d(module) {
  return module && module.default || module;
};

module.exports = {
  get purge() {
    return d(require('./purge'));
  },
  get restore() {
    return d(require('./restore'));
  },
  get save() {
    return d(require('./save'));
  }
};

},{"./purge":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/purge.js","./restore":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/restore.js","./save":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/save.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/purge.js":[function(require,module,exports){
/**
 * Remove data from local storage
 * @function purge
 * @param {string} key - Key to purge
 */
'use strict';

var getLocalStorage = require('./helpers/get_local_storage');

/** @lends purge */
function purge(key) {
  var localStorage = getLocalStorage();
  if (!localStorage) {
    return false;
  }
  localStorage.removeItem(key);
  return true;
}

module.exports = purge;

},{"./helpers/get_local_storage":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_local_storage.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/restore.js":[function(require,module,exports){
/**
 * Get data from local storage
 * @function restore
 * @param {string} key - Key to restore
 * @returns {?Object} - Resotred object
 */
'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLocalStorage = require('./helpers/get_local_storage');
var getQuery = require('./helpers/get_query');

/** @lends restore */
function restore(key) {
  var localStorage = getLocalStorage();
  if (!localStorage) {
    return undefined;
  }
  var has = localStorage.hasOwnProperty(key);
  if (!has) {
    return undefined;
  }
  var found = localStorage.getItem(key);
  var isEmpty = typeof found === 'undefined' || found === null;
  if (isEmpty) {
    return found;
  }
  try {
    return JSON.parse(found);
  } catch (e) {
    return found;
  }
}

(0, _assign2.default)(restore, {
  query: function query(key) {
    return (getQuery() || {})[key];
  }
});

module.exports = restore;

},{"./helpers/get_local_storage":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_local_storage.js","./helpers/get_query":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_query.js","babel-runtime/core-js/object/assign":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/object/assign.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/save.js":[function(require,module,exports){
/**
 * Set data to local storage
 * @function save
 * @param {string} key - Key to save
 * @param {Object} value - Values to save
 */
'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLocalStorage = require('./helpers/get_local_storage');
var getQuery = require('./helpers/get_query');
var setQuery = require('./helpers/set_query');

/** @lends save */
function save(key, value) {
  var localStorage = getLocalStorage();
  if (!localStorage) {
    return false;
  }
  localStorage.setItem(key, (0, _stringify2.default)(value));
  return true;
}

(0, _assign2.default)(save, {
  query: function query(key, value) {
    var query = (0, _assign2.default)(getQuery() || {}, (0, _defineProperty3.default)({}, key, value));
    return setQuery(query);
  }
});

module.exports = save;

},{"./helpers/get_local_storage":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_local_storage.js","./helpers/get_query":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/get_query.js","./helpers/set_query":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/bstorage/shim/browser/helpers/set_query.js","babel-runtime/core-js/json/stringify":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/json/stringify.js","babel-runtime/core-js/object/assign":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/object/assign.js","babel-runtime/helpers/defineProperty":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/helpers/defineProperty.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/json/stringify.js":[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/object/assign.js":[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.assign":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.object.assign.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/object/define-property.js":[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","../../modules/es6.object.define-property":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.object.define-property.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/fn/promise.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","../modules/es6.object.to-string":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.object.to-string.js","../modules/es6.promise":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.promise.js","../modules/es6.string.iterator":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/web.dom.iterable.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_a-function.js":[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_add-to-unscopables.js":[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-instance.js":[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js":[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-object.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_array-includes.js":[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-index.js","./_to-iobject":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-iobject.js","./_to-length":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-length.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_classof.js":[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_cof.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_cof.js":[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js":[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ctx.js":[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_a-function.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_defined.js":[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js":[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_fails.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_dom-create.js":[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_is-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-object.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_enum-bug-keys.js":[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_export.js":[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","./_ctx":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ctx.js","./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_fails.js":[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_for-of.js":[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js","./_ctx":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ctx.js","./_is-array-iter":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-array-iter.js","./_iter-call":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-call.js","./_to-length":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-length.js","./core.get-iterator-method":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/core.get-iterator-method.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js":[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_has.js":[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js":[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js","./_object-dp":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dp.js","./_property-desc":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_property-desc.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_html.js":[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ie8-dom-define.js":[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js","./_dom-create":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_dom-create.js","./_fails":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_fails.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_invoke.js":[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iobject.js":[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_cof.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-array-iter.js":[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-object.js":[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-call.js":[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-create.js":[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js","./_object-create":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-create.js","./_property-desc":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_property-desc.js","./_set-to-string-tag":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_set-to-string-tag.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-define.js":[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_export.js","./_has":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_has.js","./_hide":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js","./_iter-create":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-create.js","./_iterators":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iterators.js","./_library":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_library.js","./_object-gpo":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-gpo.js","./_redefine":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_redefine.js","./_set-to-string-tag":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_set-to-string-tag.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-detect.js":[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-step.js":[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iterators.js":[function(require,module,exports){
module.exports = {};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_library.js":[function(require,module,exports){
module.exports = true;
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_microtask.js":[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_cof.js","./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_task":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_task.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-assign.js":[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_fails.js","./_iobject":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iobject.js","./_object-gops":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-gops.js","./_object-keys":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-keys.js","./_object-pie":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-pie.js","./_to-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-object.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-create.js":[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js","./_dom-create":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_dom-create.js","./_enum-bug-keys":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_enum-bug-keys.js","./_html":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_html.js","./_object-dps":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dps.js","./_shared-key":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared-key.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dp.js":[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js","./_ie8-dom-define":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ie8-dom-define.js","./_to-primitive":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-primitive.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dps.js":[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js","./_descriptors":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js","./_object-dp":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dp.js","./_object-keys":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-keys.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-gops.js":[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-gpo.js":[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_has.js","./_shared-key":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared-key.js","./_to-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-object.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-keys-internal.js":[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_array-includes.js","./_has":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_has.js","./_shared-key":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared-key.js","./_to-iobject":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-keys.js":[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_enum-bug-keys.js","./_object-keys-internal":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-keys-internal.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-pie.js":[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_property-desc.js":[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_redefine-all.js":[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_redefine.js":[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_set-species.js":[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","./_descriptors":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js","./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_object-dp":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dp.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_set-to-string-tag.js":[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_has.js","./_object-dp":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dp.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared-key.js":[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared.js","./_uid":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_uid.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared.js":[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_species-constructor.js":[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_a-function.js","./_an-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-object.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_string-at.js":[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_defined.js","./_to-integer":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_task.js":[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_cof.js","./_ctx":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ctx.js","./_dom-create":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_dom-create.js","./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_html":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_html.js","./_invoke":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_invoke.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-index.js":[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-integer.js":[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-iobject.js":[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_defined.js","./_iobject":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iobject.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-length.js":[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-integer.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-object.js":[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_defined.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-primitive.js":[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-object.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_uid.js":[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js":[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_shared":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_shared.js","./_uid":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_uid.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/core.get-iterator-method.js":[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_classof.js","./_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","./_iterators":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.array.iterator.js":[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_add-to-unscopables.js","./_iter-define":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-define.js","./_iter-step":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-step.js","./_iterators":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iterators.js","./_to-iobject":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_to-iobject.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.object.assign.js":[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_export.js","./_object-assign":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-assign.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.object.define-property.js":[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_descriptors.js","./_export":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_export.js","./_object-dp":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_object-dp.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.object.to-string.js":[function(require,module,exports){

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.promise.js":[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_a-function.js","./_an-instance":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_an-instance.js","./_classof":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_classof.js","./_core":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_core.js","./_ctx":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_ctx.js","./_export":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_export.js","./_for-of":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_for-of.js","./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_is-object":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_is-object.js","./_iter-detect":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-detect.js","./_library":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_library.js","./_microtask":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_microtask.js","./_redefine-all":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_redefine-all.js","./_set-species":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_set-species.js","./_set-to-string-tag":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_set-to-string-tag.js","./_species-constructor":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_species-constructor.js","./_task":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_task.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.string.iterator.js":[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iter-define.js","./_string-at":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_string-at.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/web.dom.iterable.js":[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_global.js","./_hide":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_hide.js","./_iterators":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_iterators.js","./_wks":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/_wks.js","./es6.array.iterator":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/core-js/library/modules/es6.array.iterator.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/marked/lib/marked.js":[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/os-browserify/browser.js":[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/path-browserify/index.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/process/browser.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/punycode/punycode.js":[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/formats.js":[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

module.exports = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/index.js":[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/formats.js","./parse":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/parse.js","./stringify":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/stringify.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/parse.js":[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseValues(str, options) {
    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos));
            val = options.decoder(part.slice(pos + 1));
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function parseObject(chain, val, options) {
    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (
            !isNaN(index) &&
            root !== cleanRoot &&
            String(index) === cleanRoot &&
            index >= 0 &&
            (options.parseArrays && index <= options.arrayLimit)
        ) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
};

var parseKeys = function parseKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, segment[1])) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].replace(/\[|\]/g, ''))) {
            if (!options.allowPrototypes) {
                continue;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts || {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};

},{"./utils":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/utils.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/stringify.js":[function(require,module,exports){
'use strict';

var utils = require('./utils');
var formats = require('./formats');

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder ? encoder(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            return [formatter(encoder(prefix)) + '=' + formatter(encoder(obj))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter
            ));
        } else {
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter
            ));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts || {};
    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = encode ? (typeof options.encoder === 'function' ? options.encoder : defaults.encoder) : null;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    if (typeof options.format === 'undefined') {
        options.format = formats.default;
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter
        ));
    }

    return keys.join(delimiter);
};

},{"./formats":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/formats.js","./utils":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/utils.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/qs/lib/utils.js":[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

exports.arrayToObject = function (source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function (target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            target[source] = true;
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports.arrayToObject(target, options);
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                if (target[i] && typeof target[i] === 'object') {
                    target[i] = exports.merge(target[i], item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            acc[key] = exports.merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

exports.decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function (str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D || // -
            c === 0x2E || // .
            c === 0x5F || // _
            c === 0x7E || // ~
            (c >= 0x30 && c <= 0x39) || // 0-9
            (c >= 0x41 && c <= 0x5A) || // a-z
            (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

exports.compact = function (obj, references) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    var refs = references || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0; i < obj.length; ++i) {
            if (obj[i] && typeof obj[i] === 'object') {
                compacted.push(exports.compact(obj[i], refs));
            } else if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    keys.forEach(function (key) {
        obj[key] = exports.compact(obj[key], refs);
    });

    return obj;
};

exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function (obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/querystring-es3/decode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/querystring-es3/encode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/querystring-es3/index.js":[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/querystring-es3/decode.js","./encode":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/querystring-es3/encode.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sg-react/shim/browser/index.js":[function(require,module,exports){
/**
 * React utility for SUGOS
 * @module sg-react
 */

'use strict';

var d = function d(module) {
  return module && module.default || module;
};

module.exports = {
  get mount() {
    return d(require('./mount'));
  },
  get once() {
    return d(require('./once'));
  }
};

},{"./mount":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sg-react/shim/browser/mount.js","./once":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sg-react/shim/browser/once.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sg-react/shim/browser/mount.js":[function(require,module,exports){
/**
 * Mount a react component into DOM tree.
 * @function mount
 * @param {string} containerId - DOMElement Id of the container to mount
 * @param {ReactComponent} Component - A component class to render
 * @param {Object} props - Properties
 * @returns {Promise} - A promise
 */
'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var React = require('react');
var ReactDOM = require('react-dom');

var _require = require('bwindow'),
    get = _require.get;

var co = require('co');
var asleep = require('asleep');

/** @lends mount */
function mount(container, Component, props) {
  var window = get('window');
  if (!window) {
    return _promise2.default.reject(new Error('Window not found'));
  }
  if (!container) {
    return _promise2.default.reject(new Error('Container not found'));
  }
  var document = window.document;

  if (typeof container === 'string') {
    var found = document.getElementById(container);
    if (!container) {
      return _promise2.default.reject(new Error('Container not found: ' + container));
    }
    container = found;
  }
  props = (0, _assign2.default)({}, props); // Copy props to cut prototype chain
  var element = React.createElement(Component, props);

  return new _promise2.default(function (resolve, reject) {
    return ReactDOM.render(element, container, function () {
      return resolve();
    });
  });
}

module.exports = mount;

},{"asleep":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/asleep/asleep.js","babel-runtime/core-js/object/assign":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/object/assign.js","babel-runtime/core-js/promise":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/babel-runtime/core-js/promise.js","bwindow":"bwindow","co":"co","react":"react","react-dom":"react-dom"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sg-react/shim/browser/once.js":[function(require,module,exports){
/**
 * Bind window event once
 * @function once
 * @param {string} event - Event to bind
 * @param {function} handler - Event handler
 */
'use strict';

var _require = require('bwindow'),
    once = _require.once;

module.exports = once;

},{"bwindow":"bwindow"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/sugos/package.json":[function(require,module,exports){
module.exports={
  "_args": [
    [
      {
        "raw": "sugos@^2.1.3",
        "scope": null,
        "escapedName": "sugos",
        "name": "sugos",
        "rawSpec": "^2.1.3",
        "spec": ">=2.1.3 <3.0.0",
        "type": "range"
      },
      "/Users/okunishitaka/Projects/realglobe-projects/sugos.tech"
    ]
  ],
  "_from": "sugos@>=2.1.3 <3.0.0",
  "_id": "sugos@2.2.3",
  "_inCache": true,
  "_installable": true,
  "_location": "/sugos",
  "_nodeVersion": "6.6.0",
  "_npmOperationalInternal": {
    "host": "packages-12-west.internal.npmjs.com",
    "tmp": "tmp/sugos-2.2.3.tgz_1486718704960_0.6032958840951324"
  },
  "_npmUser": {
    "name": "realglobe",
    "email": "oss@realglobe.jp"
  },
  "_npmVersion": "3.10.3",
  "_phantomChildren": {},
  "_requested": {
    "raw": "sugos@^2.1.3",
    "scope": null,
    "escapedName": "sugos",
    "name": "sugos",
    "rawSpec": "^2.1.3",
    "spec": ">=2.1.3 <3.0.0",
    "type": "range"
  },
  "_requiredBy": [
    "#DEV:/"
  ],
  "_resolved": "https://registry.npmjs.org/sugos/-/sugos-2.2.3.tgz",
  "_shasum": "a567e96446bfbbb15bb5866f6b5d06a310676eb8",
  "_shrinkwrap": null,
  "_spec": "sugos@^2.1.3",
  "_where": "/Users/okunishitaka/Projects/realglobe-projects/sugos.tech",
  "author": {
    "name": "Taka Okunishi",
    "email": "okunishitaka.com@gmail.com",
    "url": "http://okunishitaka.com"
  },
  "bugs": {
    "url": "https://github.com/realglobe-Inc/sugos/issues"
  },
  "dependencies": {
    "co": "^4.6.0",
    "stringcase": "^3.2.1",
    "sugo-actor": "^4.5.1",
    "sugo-caller": "^3.2.1",
    "sugo-hub": "^5.2.0"
  },
  "description": "A high-level RPC framework to make remote controlling super easy.",
  "devDependencies": {
    "amocha": "^2.0.0",
    "ape-deploying": "^5.0.2",
    "ape-formatting": "^1.0.0",
    "ape-releasing": "^4.0.2",
    "ape-tasking": "^4.0.7",
    "ape-tmpl": "^5.0.20",
    "ape-updating": "^4.1.0",
    "asleep": "^1.0.3",
    "coz": "^6.0.17",
    "filecopy": "^3.0.0",
    "injectmock": "^2.0.0",
    "markdown-toc": "^1.1.0",
    "sg-templates": "^1.2.5",
    "sugos-assets": "^2.0.6",
    "sugos-index": "^2.0.3",
    "sugos-travis": "^2.0.7"
  },
  "directories": {},
  "dist": {
    "shasum": "a567e96446bfbbb15bb5866f6b5d06a310676eb8",
    "tarball": "https://registry.npmjs.org/sugos/-/sugos-2.2.3.tgz"
  },
  "engines": {
    "node": ">=6",
    "npm": ">=4"
  },
  "gitHead": "87b2f9658cab05126c583a08c51c5c4b80f6c1d6",
  "homepage": "https://github.com/realglobe-Inc/sugos#readme",
  "keywords": [
    "SUGOS"
  ],
  "license": "Apache-2.0",
  "main": "lib",
  "maintainers": [
    {
      "name": "realglobe",
      "email": "oss@realglobe.jp"
    }
  ],
  "name": "sugos",
  "optionalDependencies": {},
  "readme": "ERROR: No README data found!",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/realglobe-inc/sugos.git"
  },
  "scripts": {
    "prepare": "node ./ci/assets.js && node ./ci/build.js",
    "test": "node ./ci/test.js"
  },
  "version": "2.2.3",
  "warnings": [
    {
      "code": "ENOTSUP",
      "required": {
        "node": ">=6",
        "npm": ">=4"
      },
      "pkgid": "sugos@2.2.3"
    }
  ]
}

},{}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/url/url.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/url/util.js","punycode":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/punycode/punycode.js","querystring":"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/querystring-es3/index.js"}],"/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/node_modules/url/util.js":[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}]},{},["/Users/okunishitaka/Projects/realglobe-projects/sugos.tech/lib/entrypoints/index_entrypoint.jsx"])
//# sourceMappingURL=index.js.map
