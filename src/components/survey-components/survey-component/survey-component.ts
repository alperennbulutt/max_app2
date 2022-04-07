import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'survey-component',
	templateUrl: 'survey-component.html'
})
export class SurveyComponent {
	public questions: any;
	public currentQuestion: any;
	public questionIndex: number = 0;
	public answers: any = {};
	public currentAnswer: any;
	public skipHistory: any = {};
	public skipto: number;
	public showCustom: boolean = false;
	public nextAllowed: boolean = false;
	public isLastQustion: boolean = false;

	public sectionIndex: number = 0;
	public sections: any[] = [];
	public surveyStatus: any = {

	};

	@Input()
	set survey(value: any) {
		if (value) {
			this.sections = value.sections;
			this.questions = value.sections[this.sectionIndex].questions;
			this.setcurrentQuestion();
		}
	}
	@Output() onFinish: any = new EventEmitter();


	public setcurrentQuestion(forceTo?: number): void {
		// Action for skipping to certain question
		if (forceTo) {
			let skipFromIndex: number = this.questionIndex;
			this.questionIndex = this.questions.findIndex((question: any) => {
				return question.id === forceTo;
			});
			this.currentQuestion = this.questions[this.questionIndex];
			this.skipHistory[this.currentQuestion.id] = skipFromIndex;
			this.skipto = undefined;
		} else {
			if (this.questionIndex < this.questions.length) {
				this.currentQuestion = this.questions[this.questionIndex];
				this.isLastQustion = this.questionIndex === this.questions.length - 1;
			}else {
				this.onFinish.emit(this.answers);
			}
		}

		if (this.answers.hasOwnProperty(this.currentQuestion.id)) {
			this.currentAnswer = this.answers[this.currentQuestion.id].value;
		} else {
			if (this.currentQuestion.options[0].label) {
				this.currentAnswer = [...this.currentQuestion.options];
			} else {
				this.currentAnswer = '';
			}
		}

		this.nextAllowed = this.isNextAllowed();
	}

	public nextQuestion(): void {
		if (!this.skipto) {
			this.questionIndex++;
			this.setcurrentQuestion();
		} else {
			this.setcurrentQuestion(this.skipto);
		}
	}

	public restart(): void {
		let firstLessonId: number = this.questions[0].id;
		this.skipHistory = {};
		this.answers = {};
		this.setcurrentQuestion(firstLessonId);
	}

	public prevQuestion(): void {
		if (this.skipHistory.hasOwnProperty(this.currentQuestion.id)) {
			this.questionIndex = this.skipHistory[this.currentQuestion.id];
		} else {
			this.questionIndex--;
		}
		this.setcurrentQuestion();
	}

	public isFirstQuestion(): boolean {
		return this.questionIndex === 0;
	}

	public updateAnswer(event): void {
		this.answers[this.currentQuestion.id] = this.parseAnswers(this.currentQuestion.type, event);
		this.nextAllowed = this.isNextAllowed();
	}

	private parseAnswers(type: string, answers): any {
		let answer: any = {
			value: '',
			text: this.currentAnswer ? this.currentAnswer.textfield : ''
		}
		switch (type) {
			case 'number':
				answer.value = answers.value;
			break;
			case 'radio':
			case 'checkbox':
			case 'textarea':
			case 'memo':
				answer.value = answers;
			break;
		}

		if (type === 'radio') {
			let selectedAnswer: any = answers.find((answer: any) => answer.selected);
			if (selectedAnswer && selectedAnswer.next_id) {
				this.skipto = selectedAnswer.next_id;
			} else {
				this.skipto = undefined;
			}
		} else if (type === 'checkbox') {
			if (answers.filter((answer: any) => answer.checked).find((answer) => answer.value === 99)) {
				this.showCustom = true;
			} else {
				this.showCustom = false;
			}
		} else {
			this.showCustom = false;
		}

		return answer;
	}

	public isNextAllowed(): boolean {
		if (!this.currentQuestion.required) {
			return true;
		}
		if (this.currentQuestion.required && this.answers.hasOwnProperty(this.currentQuestion.id)) {
			return true;
		}

		if (this.showCustom === true) {
			return false;
		}
	}
}
