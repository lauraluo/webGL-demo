/* publish time Friday, April 7th, 2017, 6:31:37 PM*/!function e(t,r,n){function a(u,l){if(!r[u]){if(!t[u]){var i="function"==typeof require&&require;if(!l&&i)return i(u,!0);if(o)return o(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var c=r[u]={exports:{}};t[u][0].call(c.exports,function(e){var r=t[u][1][e];return a(r||e)},c,c.exports,e,t,r,n)}return r[u].exports}for(var o="function"==typeof require&&require,u=0;u<n.length;u++)a(n[u]);return a}({1:[function(e,t,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=e("react"),a=function(e){return e&&e.__esModule?e:{default:e}}(n),o=a.default.createClass({displayName:"MyComponent",propTypes:{initData:a.default.PropTypes.array},render:function(){var e=this,t=[];return e.props.initData&&e.props.initData.list&&(t=e.props.initData.list.map(function(e,t){return a.default.createElement("li",{key:t},a.default.createElement("span",null,e.id),a.default.createElement("span",null,e.email))})),a.default.createElement("ul",null,t," lalalkkkkkkkuo1")}});r.default=o},{react:"react"}],2:[function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}var a=e("./components/index/RootComponent"),o=n(a),u=e("react-dom"),l=n(u);l.default.render(l.default.createElement(o.default,null),document.getElementById("index"))},{"./components/index/RootComponent":1,"react-dom":"react-dom"}]},{},[2]);