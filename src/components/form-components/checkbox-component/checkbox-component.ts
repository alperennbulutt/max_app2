import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'checkbox-component',
	templateUrl: 'checkbox-component.html'
})
export class CheckboxComponent {
	private checkboxValues: any[] = [];
	public customInput: string;

	public itemModel: any = {
		label: 'label',
		value: 'value'
	}

	@Input() items: any[] = [];
	@Input() model: any = this.itemModel;
	@Input() custom: boolean = false;
	@Input() outputAll: boolean = false;
	@Input() placeholder: string = '';
	@Input() showExplanationField: boolean;
	@Input() explanationField: string;
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() explanationFieldChange: EventEmitter<any> = new EventEmitter<any>();

	public valueChanged(ev, index: number): void {
		this.items[index].checked = ev.checked;
		this.fireEvent();
	}

	public addCustom(event: string): void {
		if (!this.items.find((item: any) => item.label === event) && event) {
			let customValue: any = {
				value: '',
				checked: true,
				custom: true
			}
			customValue[this.model.label] = event;
			this.items.push(customValue);
			this.fireEvent();
		}
	}

	private fireEvent(): void {
		let checkboxValues: any[];
		if (!this.outputAll) {
			checkboxValues = this.items.filter((item: any) => item.checked);
		} else {
			checkboxValues = this.items;
		}
		this.onChange.emit(checkboxValues);
		checkboxValues = [];
	}

	public explanationFieldChanged(): void {
		this.fireEvent();
		this.explanationFieldChange.emit(this.explanationField);
	}
}
