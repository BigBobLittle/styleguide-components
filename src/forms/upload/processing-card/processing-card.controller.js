class Controller {
  constructor(
    $timeout,
    AsyncFileReader,
    AsyncFileSaver,
    AsyncTasksConfig,
    FileValidationService
  ) {
    this.$timeout = $timeout;
    this.AsyncFileReader = AsyncFileReader;
    this.AsyncFileSaver = AsyncFileSaver;
    this.AsyncTasksConfig = AsyncTasksConfig;
    this.FileValidation = FileValidationService;

    this.processingState = null;
  }

  $onChanges(changes) {
    if (changes.file && changes.file.currentValue) {
      this.onFileCapture(changes.file.currentValue);
    }
  }

  onFileCapture(file) {
    if (this.ngDisabled) {
      return;
    }

    if (!file) {
      throw new Error('Could not retrieve file');
    }

    this.reset();

    this.file = file;

    this.isProcessing = true;
    this.processingState = null;

    this.onStart({ file });

    if (!this.FileValidation.isSmallerThanMaxSize(file, this.maxSize)) {
      this.validationMessages = [this.tooLargeMessage];
      asyncFailure({
        status: 413,
        statusText: 'Request Entity Too Large'
      }, null, this);
      return;
    }

    if (this.httpOptions) {
      // Post file now
      this.asyncFileRead(file)
        .then(dataUrl => this.asyncFileSave(file)
          .then(response => asyncSuccess(response, dataUrl, this))
          .catch((error) => {
            if (error.status === 422) {
              // Note: Only if async action returns 422, do we want to process that error
              asyncFailure(error, dataUrl, this);
            } else {
              // Note: If async action fails, we continue with original flow
              asyncSuccess(null, dataUrl, this);
            }
          }))
        .catch(error => asyncFailure(error, null, this));
    } else {
      // Post on form submit
      this.asyncFileRead(file)
        .then(dataUrl => asyncSuccess(null, dataUrl, this))
        .catch(error => asyncFailure(error, null, this));
    }
  }

  asyncFileSave(file) {
    const httpOptions = this.AsyncTasksConfig.extendHttpOptions(this.httpOptions);
    return this.AsyncFileSaver.save(httpOptions.param || this.name, file, httpOptions);
  }

  asyncFileRead(file) {
    return this.AsyncFileReader.read(file);
  }

  reset() {
    this.processingState = 0;
    this.isProcessing = false;
    this.isSuccess = false;
    this.isError = false;
  }

  onReselect() {
    this.onCancel();
  }
}

function asyncSuccess(response, dataUrl, $ctrl) {
  $ctrl.processingState = 1;
  let id = null;
  const file = $ctrl.file;
  const httpOptions = $ctrl.httpOptions;

  if (httpOptions
      && httpOptions.idProperty
      && response
      && response.data
      && response.data[httpOptions.idProperty]) {
    id = response.data[httpOptions.idProperty];

    // These are too specific to one use case.
    // $ctrl.successMessage = response.data.message;
    // $ctrl.successDetails = response.data.details ? response.data.details[0] : null;
  }

  // Time success messaging to match animation
  $ctrl.$timeout(() => {
    $ctrl.isProcessing = false;
    $ctrl.isSuccess = true;
  }, 3000);

  // Allow a small amount of extra time before notifying external handlers
  $ctrl.$timeout(() => {
    $ctrl.onSuccess({ file, dataUrl, id, response }); // eslint-disable-line
  }, 3800);

  // Reset after card is animated out
  $ctrl.$timeout(() => {
    $ctrl.processingState = 0;
  }, 4500);

  return dataUrl;
}

function asyncFailure(error, dataUrl, $ctrl) {
  // Start changing process indicator immediately
  $ctrl.processingState = -1;

  // // TODO this section is very implementation specific
  // if ($ctrl.httpOptions && error.data && error.data.message) {
  //   $ctrl.errorMessage = error.data.message;
  //   $ctrl.errorReasons = error.data.errors || [];
  //   $ctrl.errorDescription = $ctrl.errorReasons[0].message;
  // } else if ($ctrl.httpOptions && error.originalData && error.originalData.message) {
  //   // Note: error data can manipulated by interceptors, this ensures we still get data needed
  //   $ctrl.errorMessage = error.originalData.message;
  //   $ctrl.errorReasons = error.originalData.errors || [];
  //   $ctrl.errorDescription = $ctrl.errorReasons[0].message;
  // }

  // Wait before updating text
  $ctrl.$timeout(() => {
    $ctrl.isProcessing = false;
    $ctrl.isError = true;
  }, 3000);

  // Allow a small amount of extra time before notifying external handlers
  $ctrl.$timeout(() => {
    $ctrl.onFailure({ error });
  }, 4100); // 3500); TODO for some reason more time is needed

  return error;
}

Controller.$inject = [
  '$timeout',
  'AsyncFileReader',
  'AsyncFileSaver',
  'AsyncTasksConfig',
  'FileValidationService'
];

export default Controller;
