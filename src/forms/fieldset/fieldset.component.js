import controller from './fieldset.controller.js';
import template from './fieldset.html';

const Fieldset = {
  controller,
  template,
  bindings: {
    model: '=',
    fields: '<',
    uploadOptions: '<',
    locale: '@',
    legend: '@',
    onRefreshRequirements: '&',
    validationMessages: '<',
    errorMessages: '<',
    isValid: '=?',
    narrow: '<'
  }
};

export default Fieldset;
