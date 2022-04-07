import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

export function createSelectionValidator(): any {
	return (c: FormControl) => {
		let err: any = {
			invalidValueError: {
				given: c.value
			}
		};
		// Check if value is set
		return c.value ? err : null;
	};
}

@Component({
	selector: 'password-viewer',
	templateUrl: 'password-viewer.html',
	providers: [
		{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ComponentPasswordViewer), multi: true },
		{ provide: NG_VALIDATORS, useExisting: forwardRef(() => ComponentPasswordViewer), multi: true }
	]
})
export class ComponentPasswordViewer implements ControlValueAccessor {
	propagateChange: Function = () => {};
	validateFunction: Function = () => {};
	public _placeholder: string = '';

	private _valueVisible: boolean = false;

	@Input() icon_visible: string;
	@Input() icon_invisible: string;
	@Input('value') _value: string;
	@Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

	get value(): string {
		return this._value;
	}

	set value(val: string) {
		this._value = val;
		this.propagateChange(val);
		this.valueChange.emit(val);
	}

	@Input()
	get placeholder(): string {
		return this._placeholder;
	}

	set placeholder(val: string) {
		this._placeholder = val || '';
	}

	constructor() {
	}

	public toggleView(state?: boolean, event?: any): void {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}

		if (typeof state === 'undefined') {
			state = !this._valueVisible;
		}
		this._valueVisible = state;
	}

	writeValue(value: string): void {
		this.value = value;
	}

	registerOnChange(fn: Function): void {
		this.propagateChange = fn;
	}

	registerOnTouched(): void {}

	validate(formControl: FormControl): any {
		return this.validateFunction(formControl);
	}
}
