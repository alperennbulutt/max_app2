import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'radio-component',
	templateUrl: 'radio-component.html'
})
export class RadioComponent {
	private radioValue: string;

	@Input() items: any[] = [];
	@Input() showCustom: boolean = false;
	@Input() outputAll: boolean = false;
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() onValueChange: EventEmitter<any> = new EventEmitter<any>();
	@Input()
	set initValue(val: string) {
		if (val) {
			this.radioValue = val;
		}
	}

	public valueChanged(): void {
		this.items.map((item: any) => item.selected = (item.value === this.radioValue));
		let outputvalue: any;
		if (!this.outputAll) {
			outputvalue = this.items;
		} else {
			outputvalue = this.items.map((item: any) => item.selected = (item.value === this.radioValue));
		}
		this.onChange.emit(outputvalue);
		this.onValueChange.emit(this.radioValue);
	}
}
