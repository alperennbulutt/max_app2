import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface IWordgridAnswer {
	selected: any[];
	custom_inputs: any[];
}

@Component({
	selector: 'wordgridcomponent',
	templateUrl: 'wordgridcomponent.html'
})
export class WordgridComponent {
	private _exercise: any = {};
	private _storage_data: any;
	private _custom_input_count: number = 0;
	private _custom_input: string = '';

	@Input() canEdit: boolean;
	@Input()
	get exercise(): any {
		return this._exercise;
	}
	set exercise(val: any) {
		this._exercise = JSON.parse(val) || {};
	}

	@Input()
	get data(): any {
		return this._storage_data;
	}
	set data(val: any) {
		let initialData: any = this._storage_data;
		this._storage_data = val || {
			selected: [],
			custom_inputs: []
		};
		this._storage_data.custom_inputs.forEach((item: any) => {
			if (item) {
				this.addCustomInput(item);
			}
		});
		if (initialData) {
			this.dataChange.emit(this._storage_data);
		}
	}
	@Output() dataChange: any = new EventEmitter();
	@Output() onValueChange: any = new EventEmitter();

	constructor() {}

	private addCustomAllowed(): boolean {
		return this.canEdit && this._exercise.meta.allowAdd && (this._custom_input_count < this._exercise.meta.maxAllowAdd);
	}

	public addInputValue(): void {
		if (this.addCustomAllowed()) {
			this.addCustomInput(this._custom_input);
			this._storage_data.custom_inputs.push(this._custom_input);
			this.selectInputOn(this._custom_input);
			this._custom_input = '';
			this.onValueChange.emit('<ul><li>' + this._storage_data.selected.join('</li><li>') + '</li></ul>');
		}
	}

	public addCustomInput(value: string): void {
		let doubleInputs: any[] = this._exercise.options.find((input: any) => {
			return input.label.toLowerCase() === value.toLowerCase();
		});

		if (!doubleInputs) {
			this._exercise.options.push({ label: value, custom: true });
			this._custom_input_count++;
		}
	}

	public removeCustomInput(index: number, event?: any): void {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		let ind: number = index - (this._exercise.options.length - this._storage_data.custom_inputs.length);
		this._storage_data.custom_inputs.splice(ind, 1);
		this._exercise.options.splice(index, 1);
		this._custom_input_count--;
	}

	public selectToggle(label: string): void {
		if (this.canEdit) {
			if (this._storage_data.selected.indexOf(label) === -1) {
				this.selectInputOn(label);
			} else {
				this.selectInputOff(label);
			}
			this.dataChange.emit(this._storage_data);
			this.onValueChange.emit('<ul><li>' + this._storage_data.selected.join('</li><li>') + '</li></ul>');
		}
	}

	private selectInputOn(label: string): void {
		if (this.canEdit) {
			this._storage_data.selected.push(label);
		}
	}

	private selectInputOff(label: string): void {
		if (this.canEdit) {
			this._storage_data.selected.splice(this._storage_data.selected.indexOf(label), 1);
		}
	}

	public isSelected(label: string): boolean {
		return this._storage_data.selected.indexOf(label) !== -1;
	}
}
