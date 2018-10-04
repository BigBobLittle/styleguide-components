class FieldController {
  constructor(RequirementsService) {
    this.RequirementsService = RequirementsService;
  }

  $onChanges(changes) {
    if (changes.initialField) {
      this.field = copyJSON(this.initialField);
      this.control = this.field.control ? this.field.control :
        this.RequirementsService.getControlType(changes.initialField.currentValue);

      // TODO we should probably do this at fieldset level, so the model is available
      if (this.field.valuesAsync) {
        this.RequirementsService.prepValuesAsync(this.field, {});
      }

      if (this.field.default && !this.model) {
        this.model = this.field.default;
      }
    }
  }

  onFocus() {
    if (this.focusHandler) {
      this.focusHandler();
    }
  }

  onBlur() {
    if (this.blurHandler) {
      this.blurHandler();
    }
  }

  onChange(newValue) {
    if (this.changeHandler) {
      this.changeHandler({ value: newValue });
    }
    if (this.errorMessage) {
      delete this.errorMessage;
    }
  }

  // eslint-disable-next-line
  sizeOf(obj) {
    return obj ? Object.keys(obj).length : 0;
  }

  // eslint-disable-next-line
  isFeedbackDetached(controlType) {
    if (controlType === 'date' ||
        controlType === 'file' ||
        controlType === 'radio' ||
        controlType === 'tel') {
      return true;
    }
    return false;
  }
}

function copyJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

FieldController.$inject = ['TwRequirementsService'];

export default FieldController;