import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'questionnairecomponent',
	templateUrl: 'questionnairecomponent.html'
})
export class QuestionnaireComponent {
	private _exercise: any = {};
	private exerciseChoices: any;
	public result: string = '';
	public storageData: any = {};
	public answeredAllQuestions: boolean = false;

	@Input() canEdit: boolean;
	@Input()
	get exercise(): any {
		return this._exercise;
	}
	set exercise(val: any) {
		this._exercise = JSON.parse(val) || {};
		this.exerciseChoices = this._exercise['choices'];
	}

	@Input()
	get data(): any {
		return this.storageData;
	}
	set data(val: any) {
		this.storageData = val || {};
		this.dataChange.emit(this.storageData);
		this.checkIfAllAnswersAreGiven();
		this.showResult();
	}
	@Output() dataChange: any = new EventEmitter();

	constructor() {}

	public answerChosen(answerNumber: number, answer: boolean): void {
		if (this.canEdit) {
			this.storageData[answerNumber] = answer;
			this.checkIfAllAnswersAreGiven();
		}
	}

	private checkIfAllAnswersAreGiven(): void {
		if (Object.keys(this.storageData).length === this.exerciseChoices.length) {
			this.answeredAllQuestions = true;
		}
	}

	public showResult(): void {
		if (this.answeredAllQuestions) {
			let feedback: any = this._exercise['feedback'];
			let AnswersTrue: number = 0;
			let AnswersFalse: number = 0;
			for (let key in this.storageData) {
				this.storageData[key] ? AnswersTrue++ : AnswersFalse++;
			}
			if (AnswersTrue >= AnswersFalse) {
				this.result = feedback['positive'];
			} else {
				this.result = feedback['negative'];
			}
		}
	}
}
