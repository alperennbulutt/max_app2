import { Component, Input, Output, EventEmitter } from '@angular/core';

interface ITextAreaExercise {
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

interface ITextAreaAnswer {
	inputs: string[];
	customInputs?: {
		label: string;
		value: string;
	}[];
}

@Component({
	selector: 'textareacomponent',
	templateUrl: 'textareacomponent.html'
})
export class TextareaComponent {
	private _customInputCount: number = 0;

	public _exercise: ITextAreaExercise;
	public _storageData: ITextAreaAnswer;

	@Input() canEdit: boolean;
	@Input()
	get exercise(): any {
		return this._exercise;
	}
	set exercise(val: any) {
		this._exercise = val ? JSON.parse(val) : {};

		if (this._exercise && this._exercise.options) {
			this._storageData = {
				inputs: Array(this._exercise.options.length).fill(undefined),
				customInputs: [],
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
			if (!this._storageData.customInputs) {
				this._storageData.customInputs = [];
			}
		}
	}
	@Output() dataChange: any = new EventEmitter();
	@Output() onValueChange: any = new EventEmitter();

	constructor() {}

	public onInputChange(): void {
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

	public addCustomInput(item: any): void {
		this._storageData.customInputs.push({ label: item.label, value: item.value });
		this._customInputCount++;
	}

	public removeCustomInput(index: number): void {
		this._storageData.customInputs.splice(index, 1);
		this._customInputCount--;
	}
}
