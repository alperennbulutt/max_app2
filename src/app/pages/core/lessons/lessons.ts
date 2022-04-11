import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { LessonProvider, ILesson } from '../../../providers/lesson-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';
import { InfoProvider } from '../../../providers/info-provider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, style, transition, animate } from '@angular/animations';

@IonicPage({
	name: 'Lessons'
})
@Component({
	selector: 'page-lessons',
	templateUrl: 'lessons.html',
	host: {
		'class': 'coloured-background coloured-background--yellow'
	},
	animations: [
		trigger('slideDown', [
			transition(':enter', [
				style({ height: 0 }),
				animate(300, style({ height: '*' }))
			]),
			transition(':leave', [
				style({ height: '*' }),
				animate(300, style({ height: 0 }))
			])
		])
	]
})
export class Lessons {
	public lessons: ILesson[];
	public intro: any;
	public openSubpage: boolean = false;

	public tempTestLessons: ILesson[];
	public menuItems: any = [
		// {
		// 	title: 'Beloon jezelf',
		// 	page: 'Lesson',
		// 	params: { id: 361 }
		// },
		{
			title: 'Test jezelf',
			page: 'TestYourself',
			hasSubpages: true,
			isOpen: false,
			subpages: [
				{
					title: 'Hoe sta ik ervoor?',
					page: 'Survey',
					params: { questionnaireId: 35 }
				},
				{
					title: 'Wat zijn mijn moeilijke situaties?',
					page: 'MyDifficultMoments'
				},
				{
					title: 'Feit of Fabel',
					page: 'Lesson',
					params: { id: 373, getAnswers: 'false' }
				},
			]
		},
		{
			title: 'Denk nuchter',
			page: 'Lesson',
			params: { id: 363 }
		},
		{
			title: 'Omgaan met trek',
			page: 'Lesson',
			params: { id: 365 }
		},
		{
			title: 'Te veel gedronken, wat nu?',
			page: 'Lesson',
			params: { id: 370 }
		},
		{
			title: 'Stress en drinken',
			page: 'StressAndDrinks',
			hasSubpages: true,
			isOpen: false,
			subpages: [
				{
					title: 'Tips',
					page: 'Lesson',
					params: { id: 374 }
				},
				{
					title: 'Ontspanningsoefeningen',
					page: 'Lesson',
					params: { id: 375 }
				}
			]
		},
		{
			title: 'Slapen en drinken',
			page: 'Lesson',
			params: { id: 372 }
		}
	];

	constructor(
		private nav: NavController,
		private storage: StorageProvider,
		private lessonProvider: LessonProvider,
		private bmAnalytics: BoostMeAnalyticsProvider,
		private infoProvider: InfoProvider,
	) {
	}

	ionViewWillEnter(): void {
		this.infoProvider.getInfo('HOE-INTRO').subscribe((intro: any) => {
			this.intro = intro.content;
		});
	}

	public openPage(menuItem: any): void {
		if (menuItem.hasSubpages) {
			menuItem.isOpen = !menuItem.isOpen;
		} else {
			let params: any = menuItem.params || {};
			this.nav.push(menuItem.page, params);
		}

		if (menuItem.page === 'TestYourself') {
			this.bmAnalytics.track({ name: 'TESTJEZELF_CHOSEN' });
		} else if (menuItem.page === 'Survey') {
			this.bmAnalytics.track({ name: 'HOEERVOOR_CHOSEN' });
		} else if (menuItem.page === 'StressAndDrinks') {
			this.bmAnalytics.track({ name: 'STRESS_CHOSEN' });
		}
	}

	public viewSummary(): void {
		this.nav.push('SessionSummary');
	}

	public toRewards(): void {
		this.nav.push('reward-yourself');
	}
}
