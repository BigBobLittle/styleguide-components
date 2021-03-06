
import controller from './checkbox.controller.js';
import template from './checkbox.html';

const Checkbox = {
  controller,
  template,
  require: {
    $ngModel: 'ngModel'
  },
  bindings: {
    name: '@',
    ngModel: '=',
    ngTrueValue: '<',
    ngFalseValue: '<',
    ngRequired: '<',
    ngDisabled: '<'
  }
};

export default Checkbox;
