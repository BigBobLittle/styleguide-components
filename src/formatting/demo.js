import angular from 'angular';
import template from './demo.html';

import TextFormat from './text-format/text-format.demo.js';
import DateFormat from './date-format/date-format.demo.js';
import NumberFormat from './number-format/number-format.demo.js';
import CurrencyFormat from './currency-format/currency-format.demo.js';
import Markdown from './markdown/markdown.demo.js';

export default angular.module('tw.styleguide.demo.formatting', [
  TextFormat,
  DateFormat,
  NumberFormat,
  CurrencyFormat,
  Markdown
]).component('formattingDocs', {
  bindings: {
    model: '=',
    locales: '<'
  },
  template
}).name;
