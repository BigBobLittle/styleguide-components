import angular from 'angular';

class SelectController {
  constructor($element, $transclude, $timeout, $attrs, TwDomService, $scope) {
    this.$ngModel = $element.controller('ngModel');
    this.$element = $element;
    this.$attrs = $attrs;
    this.$timeout = $timeout;
    this.$transclude = $transclude;
    this.dom = TwDomService;

    this.element = $element[0];
    $scope.$watch('$ctrl.ngModel', (newValue, oldValue) => this.onModelChange(newValue, oldValue));
  }

  $onInit() {
    this.button = this.element.getElementsByClassName('btn')[0];
    this.search = '';

    preSelectModelValue(this.$ngModel, this);
    setDefaultIfRequired(this.$ngModel, this, this.$attrs, this.$timeout);

    addEventHandlers(this, this.$element, this.$ngModel, this.options, this.$timeout);

    checkForTranscludedContent(this.$transclude, this);

    this.responsiveClasses = responsiveClasses;

    this.optionsPageSize = 300;
    this.numberOfOptionsRevealed = this.optionsPageSize; // Init.
    this.hasMoreOptionsToReveal = false;

    this.filterString = '';
    this.filteredOptions = this.getFilteredOptions();
  }

  $onChanges(changes) {
    if (changes.options) {
      this.onOptionsChange(
        changes.options.currentValue,
        changes.options.previousValue
      );
    }
  }

  onModelChange(newValue, oldValue) {
    if (newValue === oldValue) {
      return;
    }
    if (newValue || oldValue) {
      this.$ngModel.$setDirty();
    }
    const option = findOptionFromValue(this.options, newValue);
    if (option) {
      this.selected = option;
    } else {
      this.selected = null;
    }
  }

  onOptionsChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      preSelectModelValue(this.$ngModel, this);
      setDefaultIfRequired(this.$ngModel, this, this.$attrs, this.$timeout);
      this.filteredOptions = this.getFilteredOptions();
    }
  }

  circleClasses(responsiveOption) {
    let classes = responsiveClasses(responsiveOption);
    const secondaryClasses = responsiveClasses(this.hideSecondary);
    // If secondary text line, and it won't be hidden at some point, use larger circle
    if (this.selected.secondary && secondaryClasses.length === 0) {
      classes += ' circle-sm';
    } else {
      classes += ' circle-xs';
    }
    return classes;
  }

  buttonFocus() {
    this.element.dispatchEvent(new CustomEvent('focus'));
  }

  optionClick(option, $event) {
    if (option.disabled) {
      $event.stopPropagation();
      return;
    }
    selectOption(this.$ngModel, this, option);
    this.button.focus();
  }

  optionFocus(option) {
    selectOption(this.$ngModel, this, option);
  }

  optionKeypress(event) {
    // If we're in the filter don't allow normal behaviour
    if (event.target.classList.contains('tw-select-filter')) {
      return;
    }

    // Prevent delete taking us back
    const characterCode = getCharacterCodeFromKeypress(event);
    if (characterCode === 8) {
      event.preventDefault();
      return;
    }

    // Search for option based on character
    const character = getCharacterFromKeypress(event);
    continueSearchAndSelectMatch(
      this.$ngModel,
      this,
      this.options,
      character
    );
    focusOnActiveLink(this.element);
  }

  placeholderClick() {
    resetOption(this.$ngModel, this);
    this.button.focus();
  }

  placeholderFocus() {
    resetOption(this.$ngModel, this);
  }

  getFilteredOptions() {
    this.hasMoreOptionsToReveal = false;
    if (!this.options || !this.options.filter) {
      return [];
    }

    const filterStringLower = this.filterString && escapeRegExp(this.filterString.toLowerCase());

    const encounteredLabelsAndValues = Object.create(null);

    const filteredOptions = [];
    for (let i = 0; i < this.options.length; ++i) {
      const option = this.options[i];

      if (option.header && !option.value && !option.label) {
        filteredOptions.push(option);
        // eslint-disable-next-line no-continue
        continue;
      }

      let isDuplicate = false;

      const existingValuesForLabel = encounteredLabelsAndValues[option.label];
      const hasExistingValues = angular.isArray(existingValuesForLabel);

      if (hasExistingValues) {
        for (let j = 0; j < existingValuesForLabel.length; j++) {
          if (angular.equals(existingValuesForLabel[j], option.value)) {
            isDuplicate = true;
            break;
          }
        }
      }

      const shouldAddOption = !isDuplicate
        && (!filterStringLower // empty filterstring means pass everything.
          || labelMatches(option, filterStringLower)
          || noteMatches(option, filterStringLower)
          || secondaryMatches(option, filterStringLower)
          || searchableMatches(option, filterStringLower));

      if (shouldAddOption) {
        // Too many options? Don't add anymore, indicate that there's more instead.
        if (filteredOptions.length >= this.numberOfOptionsRevealed) {
          this.hasMoreOptionsToReveal = true;
          break;
        }

        if (hasExistingValues) {
          existingValuesForLabel.push(option.value);
        } else {
          encounteredLabelsAndValues[option.label] = [option.value];
        }

        filteredOptions.push(option);
      }
    }

    return filteredOptions;
  }

  focusOnFilterInput() {
    const filterInput = this.element.getElementsByClassName('tw-select-filter')[0];
    if (filterInput) {
      filterInput.focus();
    }
  }

  filterChange() {
    this.numberOfOptionsRevealed = this.optionsPageSize; // Reset.
    this.filteredOptions = this.getFilteredOptions();
    const selectedOption = findSelected(this.filteredOptions, this.selected);

    // Choose a new selected value if the old one was hidden
    if (!selectedOption && this.filteredOptions.length) {
      selectOption(this.$ngModel, this, this.filteredOptions[0]);
    }
  }

  // Keydown as keypress did not work in chrome/safari
  filterKeydown(event) {
    const characterCode = event.which || event.charCode || event.keyCode;
    const activeOption = this.element.querySelector('.active');
    const activeLink = activeOption ? activeOption.querySelector('a') : false;
    const optionLinks = this.element.getElementsByClassName('tw-select-option-link');

    if (characterCode === keys.down) {
      this.moveDownOneOption(activeOption, activeLink, optionLinks);
      event.preventDefault(); // Prevent cursor jumping around in input
    } else if (characterCode === keys.up) {
      this.moveUpOneOption(activeOption, activeLink, optionLinks);
      event.preventDefault(); // Prevent cursor jumping in input
    } else if (characterCode === keys.return) {
      if (activeOption) {
        activeOption.click();
        this.button.focus();
      }
      event.preventDefault(); // Prevent form action as input active
    }
    return true;
  }

  selectOptionUsingLink(link) {
    const option = this.filteredOptions[link.getAttribute('index')];
    selectOption(this.$ngModel, this, option);
  }

  moveUpOneOption(activeOption, activeLink, optionLinks) {
    // If none active, select last
    if (!activeOption && optionLinks.length) {
      this.selectOptionUsingLink(optionLinks[optionLinks.length - 1]);
      return;
    }

    // If active option not first, move up
    if (activeLink !== optionLinks[0]) {
      const previousOption = this.dom.getPreviousSiblingWithClassName(
        activeOption,
        'tw-select-option'
      );
      if (previousOption) {
        const previousOptionLink = previousOption.getElementsByTagName('a')[0];
        this.selectOptionUsingLink(previousOptionLink);
      }
    }
  }

  moveDownOneOption(activeOption, activeLink, optionLinks) {
    // If none active, select first
    if (!activeOption && optionLinks.length) {
      this.selectOptionUsingLink(optionLinks[0]);
      return;
    }
    // If active option not last, move down
    if (activeLink !== optionLinks[optionLinks.length - 1]) {
      const nextOption = this.dom.getNextSiblingWithClassName(
        activeOption,
        'tw-select-option'
      );
      if (nextOption) {
        const nextOptionLink = nextOption.getElementsByTagName('a')[0];
        this.selectOptionUsingLink(nextOptionLink);
        return;
      }
    }
    // If active is last and custom action, focus on it
    const transcludedOption = this.element.getElementsByClassName('tw-select-transcluded');

    if (transcludedOption.length) {
      transcludedOption[0].getElementsByTagName('a')[0].focus();
    }
  }

  shouldShowSearch() {
    // For longer list auto-show search.
    // We choose twelve as we don't need it for month selector
    return this.filter || (this.options && this.options.length > 12);
  }

  revealMoreOptions($event) {
    $event.stopPropagation();
    this.numberOfOptionsRevealed += this.optionsPageSize;
    this.filteredOptions = this.getFilteredOptions(); // Re-calc options based on larger list size.
  }
}

function labelMatches(option, search) {
  return option.label && option.label.toLowerCase().search(search) >= 0;
}
function noteMatches(option, search) {
  return option.note && option.note.toLowerCase().search(search) >= 0;
}
function secondaryMatches(option, search) {
  return option.secondary && option.secondary.toLowerCase().search(search) >= 0;
}
function searchableMatches(option, search) {
  return option.searchable && option.searchable.toLowerCase().search(search) >= 0;
}

function addEventHandlers($ctrl, $element, $ngModel, options, $timeout) {
  const element = $element[0];
  const button = element.getElementsByClassName('btn')[0];
  const buttonGroup = element.getElementsByClassName('btn-group')[0];
  const dropdown = element.getElementsByClassName('dropdown-menu')[0];

  const onFocusOut = () => {
    $timeout(() => {
      // If button isn't focused and dropdown not open, blur
      if (button !== document.activeElement
        && !buttonGroup.classList.contains('open')) {
        element.dispatchEvent(new CustomEvent('blur'));
      }
    }, 150); // need timeout because using dropdown.js,
  };

  const onButtonClick = () => {
    $timeout(() => {
      if ($ctrl.shouldShowSearch()) {
        // If filter in use, focus on that
        const filterInput = element.getElementsByClassName('tw-select-filter')[0];
        filterInput.focus();
      } else {
        // Otherwise focus on selected option
        focusOnActiveLink(element);
      }
    });
  };

  const onButtonKeypress = (event) => {
    $ctrl.optionKeypress(event);
  };

  const onDropdownKeypress = (event) => {
    if (event.target.tagName.toLowerCase() === 'a') {
      $ctrl.optionKeypress(event);
    }
  };

  const onComponentBlur = () => {
    $ngModel.$setTouched();
  };

  element.addEventListener('blur', onComponentBlur);
  button.addEventListener('keypress', onButtonKeypress);
  button.addEventListener('click', onButtonClick);
  button.addEventListener('focusout', onFocusOut);
  dropdown.addEventListener('focusout', onFocusOut);
  dropdown.addEventListener('keypress', onDropdownKeypress);
}

function focusOnActiveLink(element) {
  const activeOption = element.getElementsByClassName('active')[0];
  if (activeOption) {
    activeOption.getElementsByTagName('a')[0].focus();
  }
}

function checkForTranscludedContent($transclude, $ctrl) {
  $transclude((clone) => {
    if (clone.length > 1 || clone.text().trim() !== '') {
      $ctrl.hasTranscluded = true;
    }
  });
}

function getCharacterCodeFromKeypress(event) {
  return event.which || event.charCode || event.keyCode;
}

function getCharacterFromKeypress(event) {
  return String.fromCharCode(getCharacterCodeFromKeypress(event));
}

function escapeRegExp(str) {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function preSelectModelValue($ngModel, $ctrl) {
  if (isValidModel($ctrl.ngModel)) {
    const option = findOptionFromValue($ctrl.options, $ctrl.ngModel);
    if (option) {
      selectOption($ngModel, $ctrl, option);
    }
  }
}

function findOptionFromValue(options, value) {
  let optionMatch = false;
  options.forEach((option) => {
    if (angular.equals(option.value, value)) {
      optionMatch = option;
    }
  });
  return optionMatch;
}

function setDefaultIfRequired($ngModel, $ctrl, $attrs, $timeout) {
  // If required and model empty, select first option with value
  if (($ctrl.ngRequired || $attrs.required) && !isValidModel($ctrl.ngModel) && !$ctrl.placeholder) {
    for (let i = 0; i < $ctrl.options.length; i++) {
      if (isValidModel($ctrl.options[i].value)) {
        selectOption($ngModel, $ctrl, $ctrl.options[i]);
        $timeout($ctrl.ngChange);
        break;
      }
    }
  }
}

function selectOption($ngModel, $ctrl, option) {
  if (option.disabled) {
    return;
  }
  $ngModel.$setViewValue(option.value);
  // Force commit so that ng-change always has new value
  $ngModel.$commitViewValue();
  $ctrl.selected = option;
}

function findSelected(options, selected) {
  // There can be scenarios when the `filteredOptions` are loaded asynchronously
  // so this method may be called with an undefined as `options` argument, so
  // we should check if that passed argument is really an array before calling
  // `.forEach` on it
  if (!angular.isArray(options)) {
    return undefined;
  }

  // Prefer forEach over find for browser support
  let selectedOption;
  options.forEach((option) => {
    if (selected && angular.equals(selected.value, option.value)) {
      selectedOption = selected;
    }
  });
  return selectedOption;
}

function resetOption($ngModel, $ctrl) {
  $ngModel.$setViewValue(null);
  // Force commit so that ng-change always has new value
  $ngModel.$commitViewValue();
  $ctrl.selected = false;
}

function continueSearchAndSelectMatch($ngModel, $ctrl, options, letter) {
  let found = searchAndSelect($ngModel, $ctrl, options, $ctrl.search + letter);
  if (found) {
    $ctrl.search += letter;
  } else {
    $ctrl.search = letter;
    found = searchAndSelect($ngModel, $ctrl, options, $ctrl.search);
  }
  return found;
}

function searchAndSelect($ngModel, $ctrl, options, term) {
  let found = false;
  const searchTerm = term.toLowerCase();

  options.forEach((option) => {
    if (found) {
      return;
    }
    if (containsSearch(option.label, searchTerm)
      || containsSearch(option.note, searchTerm)
      || containsSearch(option.secondary, searchTerm)
      || containsSearch(option.searchable, searchTerm)) {
      selectOption($ngModel, $ctrl, option);
      found = true;
    }
  });
  return found;
}

function containsSearch(term, search) {
  return term && term.toLowerCase().indexOf(search) === 0;
}

function isValidModel(value) {
  return value || value === 0 || value === false;
}

function responsiveClasses(value) {
  let classes = '';
  let breakpoints = [];
  const validBreakpoints = {
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true
  };

  if (typeof value === 'boolean' && value) {
    return 'hidden';
  }

  if (value && value.toLowerCase && value.toLowerCase() === 'true') {
    return 'hidden';
  }

  if (value) {
    breakpoints = value.split(',');
  }

  breakpoints.forEach((breakpoint) => {
    if (validBreakpoints[breakpoint]) {
      classes += `hidden-${breakpoint} `;
    }
  });

  return classes;
}

const keys = {
  up: 38,
  down: 40,
  return: 13
};

SelectController.$inject = [
  '$element',
  '$transclude',
  '$timeout',
  '$attrs',
  'TwDomService',
  '$scope'
];

export default SelectController;
