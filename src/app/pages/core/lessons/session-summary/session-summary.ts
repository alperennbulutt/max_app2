import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { SessionProvider, SessionStatus } from '../../../../providers/session-provider';
import { LessonProvider, ILesson } from '../../../../providers/lesson-provider';

@IonicPage({
	name: 'SessionSummary'
})
@Component({
	selector: 'page-session-summary',
	templateUrl: 'session-summary.html'
})
export class SessionSummary {
	prevSession: any;
	nextSession: any;
	prevSessionLesson: ILesson;

	constructor(
		private sessionProvider: SessionProvider,
		private lessonProvider: LessonProvider,
	) {
		let prevSession: any = this.sessionProvider.getPrevious();
		let currSession: any = this.sessionProvider.getCurrent();
		let nextSession: any = this.sessionProvider.getNext();

		if (currSession.status === SessionStatus.completed) {
			this.prevSession = currSession;
			this.nextSession = nextSession;
		} else {
			this.prevSession = prevSession;
			this.nextSession = currSession;
		}

		if (this.prevSession.lessonId) {
			this.lessonProvider.fetch().then((lessonData: ILesson[]) => {
				if (lessonData) {
					this.prevSessionLesson = lessonData.find((lesson: ILesson) => lesson.id === this.prevSession.lessonId);
				}
			});
		}
	}
}
