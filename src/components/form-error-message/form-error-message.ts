import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { FormValidator } from '../../providers/utilities/form-validator';

@Component({
	selector: 'form-error-message',
	template: '<div *ngIf="errorMessage !== null">{{errorMessage}}</div>'
})
export class ComponentFormControlMessage {
	@Input() control: FormControl;
	@Input() submitted: boolean = false;

	constructor(
		private formValidator: FormValidator,
	) {}

	public get errorMessage(): string {
		if (this.control) {
			for (let propertyName in this.control.errors) {
				if (this.control.errors.hasOwnProperty(propertyName) && (/*this.control.touched || */this.submitted)) { // @TODO: touched parameter is added on ngChange. Currently no way of detecting onBlur of a FormControl element. https://github.com/angular/angular/issues/7113
					return this.formValidator.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
				}
			}
		}
		return null;
	}
}
