import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'checkboxcomponent',
	templateUrl: 'checkboxcomponent.html'
})
export class CheckboxComponent {
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
		this._exercise = val ? JSON.parse(val) : {};
	}

	@Input()
	get data(): any {
		return this._storage_data;
	}
	set data(val: any) {
		let initialData: any = this._storage_data;
		this._storage_data = val || {
			check_boxes: [],
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
		this._exercise.meta.maxAllowAdd = 2;
		return this.canEdit && this._exercise.meta.allowAdd && (this._custom_input_count < this._exercise.meta.maxAllowAdd);
	}

	public addInputValue(): void {
		if (this.addCustomAllowed()) {
			this.addCustomInput(this._custom_input);
			this._storage_data.custom_inputs.push(this._custom_input);
			this._custom_input = '';
			this.setValueChange();
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

	public removeCustomInput(index: number): void {
		if (this._storage_data.selected === index) {
			this._storage_data.selected = -1;
		}
		let ind: number = index - (this._exercise.options.length - this._storage_data.custom_inputs.length);
		this._storage_data.custom_inputs.splice(ind, 1);
		this._exercise.options.pop();
		this._custom_input_count--;
	}

	public onToggle(index: number): void {
		this._storage_data.check_boxes[index] = !this._storage_data.check_boxes[index];
		this.setValueChange();
	}

	public onChange(): void {
		this.setValueChange();
	}

	private setValueChange(): void {
		// Find selected exercise options
		let selectedBoxes: any[] = this._exercise.options.filter((item: any, index: number) => {
			return this._storage_data.check_boxes[index];
		});
		// Add custom options
		selectedBoxes = selectedBoxes.concat(this._storage_data.custom_inputs);
		// Get their labels
		let selectedLabels = selectedBoxes.map((item: any) => {
			return item.label;
		});

		this.onValueChange.emit('<ul><li>' + selectedLabels.join('</li><li>') + '</li></ul>');
	}
}
