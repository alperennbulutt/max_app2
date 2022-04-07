import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { LessonsService } from '../../../providers/lessons-service';

@Component({
	selector: 'answerdisplaycomponent',
	templateUrl: 'answerdisplaycomponent.html'
})
export class AnswerDisplayComponent {
	private _dataValue: any = {};
	private _exercise: any = {};

	public _answers: any = {
		lesson_title: '',
		answers: {},
		questiondef: {},
		component: ''
	};

	@Input()
	get exercise(): any {
		return this._exercise;
	}
	set exercise(val: any) {
		this._exercise = JSON.parse(val) || {};
	}

	@Input()
	get data(): any {
		return this._dataValue;
	}
	set data(val: any) {
		this._dataValue = val || {};
		this.dataChange.emit(this._dataValue);
	}
	@Output() dataChange: any = new EventEmitter();

	constructor(
		// public lessonsService: LessonsService
	) {
		// this.lessonsService.getLessonsFromStorage().then((lessons: any) => {
		// 	let lesson = lessons.find((lesson: any) => {
		// 		return lesson.id == this._exercise.options[0].excercise;
		// 	});
		//
		// 	lesson.pages.forEach((page: any) => {
		// 		page.pageblocks.forEach((pageblock: any) => {
		// 			if (this._dataValue.hasOwnProperty(pageblock.id)) {
		// 				this._answers.lesson_title = page.title;
		// 				this._answers.answers = this._dataValue[pageblock.id] || {};
		// 				this._answers.questiondef = pageblock.questiondef || {};
		// 				this._answers.component = pageblock.component || '';
		// 			}
		// 		});
		// 	});
		// });
	}
}
