import angular from 'angular';
import template from './fieldset.demo.html';

export default angular
  .module('tw.styleguide.demo.forms.fieldset', [])
  .component('twFieldsetDocs', {
    controller: fieldsetDocsController,
    template
  })
  .component('fieldsetExample', {
    bindings: {
      model: '=',
      requirements: '<',
      errorMessages: '<',
      warningMessages: '<',
      onRefreshHandler: '&?onRefreshRequirements',
      onModelChangeHandler: '&?onModelChange',
      onFieldFocusHandler: '&?onFieldFocus',
      onFieldBlurHandler: '&?onFieldBlur',
      onFieldChangeHandler: '&?onFieldChange'
    },
    controller() {
      this.isValid = false;
      this.onFieldFocus = (key, field) => {
        if (this.onFieldFocusHandler) {
          this.onFieldFocusHandler({ key, field });
        }
      };
      this.onFieldBlur = (key, field) => {
        if (this.onFieldBlurHandler) {
          this.onFieldBlurHandler({ key, field });
        }
      };
      this.onFieldChange = (value, key, field) => {
        if (this.onFieldChangeHandler) {
          this.onFieldChangeHandler({ value, key, field });
        }
      };
      this.onModelChange = (model) => {
        if (this.onModelChangeHandler) {
          this.onModelChangeHandler({ model });
        }
      };
      this.onRefreshRequirements = () => {
        if (this.onRefreshHandler) {
          this.onRefreshHandler();
        }
      };
    },
    template: `
    <div class="row">
      <div class="col-md-6">
        <tw-fieldset
          title="{{ $ctrl.requirements.title }}"
          description="{{ $ctrl.requirements.description }}"
          model="$ctrl.model"
          fields="$ctrl.requirements.properties"
          required-fields="$ctrl.requiredFields"
          is-valid="$ctrl.isValid"
          on-model-change="$ctrl.onModelChange(model)"
          on-field-focus="$ctrl.onFieldFocus(key, field)"
          on-field-blur="$ctrl.onFieldBlur(key, field)"
          on-field-change="$ctrl.onFieldChange(value, key, field)"
          on-refresh-requirements="$ctrl.onRefreshRequirements()"
          upload-options="{buttonText: 'Choose file'}"
          error-messages="$ctrl.errorMessages"
          warning-messages="$ctrl.warningMessages">
        </tw-fieldset>
      </div>
      <div class="col-md-6 p-t-3">
<pre>&lt;tw-fieldset<span ng-if="$ctrl.requirements.title">
  title="{{ $ctrl.requirements.title }}"</span><span ng-if="$ctrl.requirements.description">
  description="{{ $ctrl.requirements.description }}"</span>
  is-valid="{{ $ctrl.isValid }}"<span ng-if="$ctrl.onModelChangeHandler">
  on-model-change="(model) => { console.log(model); }"</span><span ng-if="$ctrl.onFieldFocusHandler">
  on-field-focus="(key, field) => { console.log('focus: ' + key); }"</span><span ng-if="$ctrl.onFieldBlurHandler">
  on-field-blur="(key, field) => { console.log('blur: ' + key); }"</span><span ng-if="$ctrl.onFieldChangeHandler">
  on-field-change="(value, key, field) => { console.log('changed: '+ key + ' to ' + value); }"</span><span ng-if="$ctrl.errorMessages">
  error-messages="{{ $ctrl.errorMessages | json }}"</span><span ng-if="$ctrl.warningMessages">
  warning-messages="{{ $ctrl.warningMessages | json }}"</span>
  model="{{ $ctrl.model | json }}"<span ng-if="$ctrl.requirements.required">
  required-fields="{{ $ctrl.requirements.required | json }}"</span>
  fields="<div class="m-l-2">{{ $ctrl.requirements.properties | json }}"&gt;</div>&lt;/tw-fieldset&gt;</pre>
      </div>
    </div>`
  }).name;

function fieldsetDocsController() {
  this.onFieldChange = (value, key) => {
    this.log(`change: ${key} to ${value}`);
  };
  this.refresh = () => {
    this.log('onRefreshRequirements');
  };
  this.log = (message) => {
    console.log(message); // eslint-disable-line
  };

  this.fieldsetBasic = {
    properties: {
      stringProperty: {
        type: 'string',
        title: 'String label',
        placeholder: 'Please enter text'
      },
      numberProperty: {
        type: 'number',
        title: 'Number label',
        placeholder: 'Please enter number',
        min: 5,
        default: 123
      }
    }
  };
  this.fieldsetBasicModel = {
    stringProperty: 'Example',
    numberProperty: 321
  };

  this.fieldsetNested = {
    properties: {
      stringProperty: {
        type: 'string',
        title: 'String label',
        placeholder: 'Please enter text'
      },
      nestedObject: {
        type: 'object',
        title: 'Nested object',
        properties: {
          numberProperty: {
            type: 'number',
            title: 'Number label',
            placeholder: 'Please enter number',
            refreshRequirementsOnChange: true
          }
        }
      }
    }
  };
  this.fieldsetNestedModel = {
    stringProperty: 'Example',
    nestedObject: {
      numberProperty: 123
    }
  };

  this.fieldsetErrors = {
    stringProperty: 'Something is wrong with this',
  };
  this.fieldsetWarnings = {
    nestedObject: {
      numberProperty: 'Make sure this is your favourite number'
    }
  };

  this.fieldsetOptions = {
    title: 'Fieldset legend',
    description: 'Optional fieldset description, with more information about the content.',
    properties: {
      keyName: {
        type: 'text',
        title: 'Control label',
        placeholder: 'Please enter text'
      }
    },
    required: ['keyName']
  };
  this.fieldsetOptionsModel = {
    keyName: 'Example'
  };

  this.fieldsetLayout = {
    properties: {
      stringProperty: {
        type: 'string',
        title: 'String label',
        placeholder: 'Please enter text',
        width: 'md'
      },
      booleanProperty: {
        type: 'boolean',
        title: 'Boolean label',
        placeholder: 'Check it',
        width: 'md'
      },
      numberProperty: {
        type: 'number',
        title: 'Number label',
        placeholder: 'Please enter number',
        width: 'sm'
      }
    }
  };
  this.fieldsetLayoutModel = {};


  this.fieldsetFull = {
    properties: {
      text: {
        title: 'Text',
        type: 'text',
        displayFormat: '***** - *****||*-*-*',
        width: 'md',
        refreshRequirementsOnChange: true
      },
      number: {
        title: 'Number',
        type: 'number',
        width: 'md',
        refreshRequirementsOnChange: true
      },
      select: {
        title: 'Select',
        type: 'string',
        control: 'select',
        width: 'md',
        refreshRequirementsOnChange: true,
        values: [
          {
            key: '1',
            name: 'One'
          },
          {
            key: '2',
            name: 'Two'
          }
        ]
      },
      checkboxGroup: {
        title: 'Checkbox Group',
        type: 'string',
        control: 'checkbox-group',
        width: 'md',
        items: {
          enum: [1, 2],
          values: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }]
        }
      },
      password: {
        title: 'Password',
        type: 'string',
        control: 'password',
        width: 'md',
        refreshRequirementsOnChange: true
      },
      date: {
        title: 'Date',
        type: 'string',
        format: 'date',
        refreshRequirementsOnChange: true
      },
      telephone: {
        title: 'Telephone',
        type: 'string',
        control: 'tel',
        placeholder: 'Enter...'
      },
      radio: {
        title: 'Radio',
        type: 'string',
        control: 'radio',
        width: 'md',
        refreshRequirementsOnChange: true,
        values: [
          {
            key: '1',
            name: 'One'
          },
          {
            key: '2',
            name: 'Two'
          }
        ]
      },
      checkbox: {
        title: 'Checkbox',
        type: 'boolean',
        placeholder: 'Label',
        width: 'md',
        refreshRequirementsOnChange: true
      },
      textarea: {
        title: 'Textarea',
        type: 'string',
        control: 'textarea',
        refreshRequirementsOnChange: true
      },
      file: {
        title: 'File',
        type: 'string',
        format: 'base64url',
        refreshRequirementsOnChange: true
      },
      hidden: {
        type: 'string',
        hidden: true,
        default: 'hidden-value'
      }
    }
  };

  this.fieldsetFullModel = {
    text: 'helloworld',
    number: 123456,
    select: '1',
    date: '2000-01-01T00:00:00.000Z',
    checkbox: true,
    radio: '2',
    password: 'qwerty',
    telephone: '+441234567890',
    checkboxGroup: '["1", "2"]'
  };
}
