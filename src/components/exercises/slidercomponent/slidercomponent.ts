import { Component, Input, Output, EventEmitter } from '@angular/core';

// interface ISliderExercise {
// 	options: {
// 		label: string;
// 		value: string;
// 		custom: boolean;
// 	}[];
// 	meta: {
// 		allowAdd: boolean;
// 		maxAllowAdd: number;
// 	};
// }

@Component({
	selector: 'slidercomponent',
	templateUrl: 'slidercomponent.html'
})
export class SliderComponent {
	public _exercise: any = {};
	public _storageData: any;

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
		return this._storageData;
	}
	set data(val: any) {
		let initialData: any = this._storageData;
		this._storageData = val || {
			ranges: []
		};
		if (initialData) {
			this.dataChange.emit(this._storageData);
		}
	}
	@Output() dataChange: any = new EventEmitter();
	@Output() onValueChange: any = new EventEmitter();

	constructor() {}
}
