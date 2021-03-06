let $ctrl;

class FormControlController {
  constructor($element) {
    this.$element = $element;
    this.element = $element[0];

    // This is a bit lame, but necessary due to the way twUpload's callbacks work
    // Because they use '=', not '&', we lose reference to this controller.
    $ctrl = this;
  }

  $onInit() {
    this.$ngModel = this.$element.controller('ngModel');
    this.addValidators();

    if (!this.uploadOptions) {
      this.uploadOptions = {};
    }
  }

  change() {
    this.$ngModel.$setDirty();

    // Pass internal value through our validators
    this.$ngModel.$setViewValue(this.internalModel);
  }

  focus() {
    this.element.dispatchEvent(new CustomEvent('focus'));
  }

  blur() {
    this.$ngModel.$setTouched();
    this.element.dispatchEvent(new CustomEvent('blur'));
  }

  // eslint-disable-next-line
  onAsyncUploadSuccess(file, response) {
    if ($ctrl.onAsyncSuccess) {
      $ctrl.onAsyncSuccess({ response });
    }
  }

  // eslint-disable-next-line
  onAsyncUploadFailure(response) {
    if ($ctrl.onAsyncFailure) {
      $ctrl.onAsyncFailure({ response });
    }
  }

  /**
   * autocomplete hides our form help so we need to disable it when help text
   * is present. Chrome ignores autocomplete=off, the only way to disable it is
   * to provide an 'invalid' value, for which 'disabled' serves.
   */
  getAutocompleteStatus() {
    return (this.helpOptions && this.helpOptions.message) ? 'disabled' : 'on';
  }

  addValidators() {
    const $ngModel = this.$ngModel;

    $ngModel.$validators.required = (modelValue, viewValue) => {
      const value = modelValue || viewValue;
      return !value || !this.ngRequired;
    };

    $ngModel.$validators.minlength = (modelValue, viewValue) => {
      const value = modelValue || viewValue;
      if (this.type !== 'text' || !this.ngMinlength) {
        return true;
      }
      return !value || value.length >= this.ngMinlength;
    };

    $ngModel.$validators.maxlength = (modelValue, viewValue) => {
      const value = modelValue || viewValue;
      if (this.type !== 'text' || !this.ngMaxlength) {
        return true;
      }
      return !value || value.length <= this.ngMaxlength;
    };

    // Min and max do not work on custom elements, add manual validators
    $ngModel.$validators.min = (modelValue, viewValue) => {
      const value = modelValue || viewValue;
      if (typeof this.ngMin === 'undefined') {
        return true;
      }
      if (typeof value === 'number'
        && typeof this.ngMin === 'number') {
        return value >= this.ngMin;
      }
      if (this.type === 'date'
        && typeof value === 'string'
        && typeof this.ngMin === 'string') {
        return value >= this.ngMin;
      }
      if (this.type === 'date'
        && value instanceof Date
        && this.ngMin instanceof Date) {
        return value >= this.ngMin;
      }
      return true;
    };

    $ngModel.$validators.max = (modelValue, viewValue) => {
      const value = modelValue || viewValue;
      if (typeof this.ngMax === 'undefined') {
        return true;
      }
      if (typeof value === 'number'
        && typeof this.ngMax === 'number') {
        return value <= this.ngMax;
      }
      if (this.type === 'date'
        && typeof value === 'string'
        && typeof this.ngMax === 'string') {
        return value <= this.ngMax;
      }
      if (this.type === 'date'
        && value instanceof Date
        && this.ngMax instanceof Date) {
        return value <= this.ngMax;
      }
      return true;
    };

    $ngModel.$formatters.push((modelValue) => {
      this.internalModel = modelValue;
      return modelValue;
    });
  }
}

FormControlController.$inject = ['$element'];

export default FormControlController;
