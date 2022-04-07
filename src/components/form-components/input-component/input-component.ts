import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'input-component',
	templateUrl: 'input-component.html'
})
export class InputComponent {
	public inputValue: any;
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() onAddCustom: EventEmitter<any> = new EventEmitter<any>();
	@Input() placeholder: string = 'sddsds';

	public valueChanged(ev, index: number): void {
		//console.log('val', this.inputValue);
	}

	public addValue(): void {
		this.onAddCustom.emit(this.inputValue);
		this.inputValue = '';
	}
}
