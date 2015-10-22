# styleguide-components
AngularJS components for TransferWise Bootstrap.  Currently these components focus on forms and form behaviour, they enable you to use standard Boostrap markup, but gain additional visuals and behaviour.

### Forms
##### Validation
In the simplest possible case you will need to use Bootstrap's `form-group` and `form-control` classes to gain validation.  Validation will only work if you have bound a value with `ngModel`.  If you were to focus this input and exit without entering a valid value, the control would show a validation error.
```
<div class="form-group">
    <input class="form-control" ng-model="ctrl.example" required />
</div>
```

If you add a Bootstrap `control-label` this will also be styled, blue when the control is focussed, red when invalid.
```
<div class="form-group">
    <label class="control-label">Label</label>
    <input class="form-control" ng-model="ctrl.example" required />
</div>
```

If the controls are inside a `form`, validation will also occur on form submit.  Use the `novalidate` attribute to prevent the browser's own validation interfering.
```
<form novalidate>
    <div class="form-group">
        <label class="control-label">Label</label>
        <input class="form-control" ng-model="ctrl.example" required />
    </div>
    <button type="submit">Submit</button>
</form>
```

##### Radio and checkboxes
Using the standard bootstrap form structure, your radio and checkboxes will also be upgraded to much prettier versions supporting all standard functionality.
```
<div class="form-group">
    <label class="control-label">Label</label>
	<div class="checkbox">
		<label>
		    <input type="checkbox" value="1" class="form-control" />
			Checkbox 1 label
		</label>
	</div>
</div>
```
