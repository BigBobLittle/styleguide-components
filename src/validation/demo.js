import angular from 'angular';
import template from './demo.html';

export default angular.module('tw.styleguide.demo.validation', [])
  .component('validationDocs', {
    bindings: {
      model: '='
    },
    controller() {
      // Used by twValidation docs
      this.basicSelect = [
        { value: 0, label: 'Zero' },
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' }
      ];
      this.log = (message) => {
        console.log(message); // eslint-disable-line
      };
    },
    template
  }).name;
