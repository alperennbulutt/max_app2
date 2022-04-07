import { Component, Input, Output, EventEmitter } from '@angular/core';

interface ITextFieldExercise {
	options: {
		label: string;
		value: string;
		custom: boolean;
	}[];
	meta: {
		allowAdd: boolean;
		maxAllowAdd: number;
	};
}

interface ITextFieldAnswer {
	inputs: string[];
	customLabels: string[];
	customInputs?: string[];
	selected?: number;
}

@Component({
	selector: 'textfieldcomponent',
	templateUrl: 'textfieldcomponent.html'
})
export class TextfieldComponent {
	private _customInputCount: number = 0;

	public _exercise: ITextFieldExercise;
	public _storageData: ITextFieldAnswer;

	@Input() canEdit: boolean;
	@Input()
	get exercise(): any {
		return this._exercise;
	}
	set exercise(val: any) {
		this._exercise = val ? JSON.parse(val) : undefined;

		if (this._exercise) {
			this._storageData = {
				customLabels: [],
				inputs: Array(this._exercise.options.length).fill(undefined)
			};
		}
	}

	@Input()
	get data(): any {
		return this._storageData;
	}
	set data(val: any) {
		if (val) {
			this._storageData = val;
			if (!this._storageData.customLabels) {
				this._storageData.customLabels = [];
			}
			this._storageData.customLabels.forEach((item: any) => {
				if (item) {
					this.addCustomInput(item);
				}
			});
		}
	}
	@Output() dataChange: any = new EventEmitter();
	@Output() onValueChange: any = new EventEmitter();

	constructor() {}

	public onInputChange(index: number, value: string): void {
		this._storageData.inputs[index] = value;
		this.dataChange.emit(this._storageData);
		this.onValueChange.emit(this._storageData.inputs[0]);
	}

	private addCustomAllowed(): boolean {
		return this.canEdit && this._exercise && this._exercise.meta.allowAdd && (this._customInputCount < this._exercise.meta.maxAllowAdd);
	}

	public addInputValue(): void {
		if (this.addCustomAllowed()) {
			this.addCustomInput('');
		}
	}

	public addCustomInput(value: string): void {
		this._exercise.options.push({ label: value, value: '', custom: true });
		this._customInputCount++;
	}

	public removeCustomInput(index: number): void {
		if (this._storageData.selected === index) {
			this._storageData.selected = -1;
		}
		this._storageData.customInputs.splice(index, 1);
		this._exercise.options.pop();
		this._customInputCount--;
	}
}
