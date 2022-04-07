import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'textarea-component',
	templateUrl: 'textarea-component.html'
})
export class TextAreaComponent {
	@Input() textareaValue: string;
	@Input() editable: boolean = true;
	@Output() textareaValueChange: EventEmitter<any> = new EventEmitter<any>();

	public change(): void {
		this.textareaValueChange.emit(this.textareaValue);
	}
}
