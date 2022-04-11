import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import moment from 'moment';

import { TranslateService } from 'ng2-translate';

import { IBarChartData, IBarChartPage, IBarChartPoint } from '../../../../components/chart/chart';
import { StorageProvider } from '../../../../providers/utilities/storage-provider';
import { MenuProvider } from '../../../../providers/menu-provider';

import { BoostMeAnalyticsProvider } from '../../../../providers/boost-me-analytics-provider';
import { UserProvider } from '../../../../providers/user-provider';

import { IDayRegistry } from '../../log/log';

export enum EOverviewType {
	drinksPerDay = 0,
	noDrinks = 1,
	goalsReached = 2,
}

@IonicPage({
	name: 'ChartPage',
	segment: 'ChartPage/:overviewType'
})
@Component({
	selector: 'page-chart-page',
	templateUrl: 'chart-page.html',
	host: {
		'class': 'coloured-background one-page'
	}
})
export class ChartPage {
	@ViewChild('daySlider') slider: Slides;

	private storageKey: string = 'drinks-log';
	private sliderReady: boolean = false;

	private chartPages: IBarChartPage[] = [];
	private logs: IDayRegistry[];
	private goals: any;
	private overviewType: number = parseInt(this.navParams.get('overviewType')) || EOverviewType.drinksPerDay;
	private startReached: boolean = false;

	public pageIsLoaded: boolean = false;
	public chartData: IBarChartData = {
		data: []
	};
	public legendLabels: any = {
		positive: 'Binnen je doel',
		negative: 'Meer dan je doel',
		neutral: 'Geen doel gesteld',
		goal: 'Jouw gestelde doel',
		goalReached: 'Doel gehaald',
		noInfo: 'Geen info'
	};
	public selectedDay: IDayRegistry;
	public currentChartPageIndex: number = 0;
	public currentPageIndex: number = moment().weekday();
	public overviewData: any = {
		0: {
			view: 'day',
			pageTitle: 'Drankjes per dag',
			chartTitle: 'Aantal drankjes per dag',
			legend: ['positive', 'negative', 'neutral', 'goal', 'noInfo'],
			infoType: EOverviewType.drinksPerDay
		},
		1: {
			view: 'week',
			pageTitle: 'Dagen 0 gedronken',
			chartTitle: 'Dagen per week niets gedronken',
			legend: ['noInfo'],
			infoType: EOverviewType.noDrinks
		},
		2: {
			view: 'week',
			pageTitle: 'Doel gehaald',
			chartTitle: 'Aantal dagen per week je doel gehaald',
			legend: ['goalReached', 'noInfo'],
			infoType: EOverviewType.goalsReached
		}
	};
	public activeOverviewType: any;
	public pageHeader: string;
	public isLegendVisible: boolean = true;
	public isAlternateLegendVisible: boolean = false;
	public startDate: string;

	constructor(
		private nav: NavController,
		private navParams: NavParams,
		private translate: TranslateService,
		private storage: StorageProvider,
		private bmAnalytics: BoostMeAnalyticsProvider,
		private menuProvider: MenuProvider,
		private userProvider: UserProvider
	) { }

	ionViewWillEnter(): void {
		this.activeOverviewType = this.overviewData[this.overviewType];

		Promise.all([
			this.storage.getItem(this.storageKey),
			this.userProvider.getRegistrationDate(),
			this.storage.getItem('drinking-goal')
		]
		).then((resolvedPromoses: any) => {
			let logs: any = resolvedPromoses[0];
			let startDate: string = resolvedPromoses[1];
			let goals: any = resolvedPromoses[2];

			this.startDate = startDate;
			this.logs = logs || [];
			this.goals = goals || [];
			this.getChartData();
			this.fillChartData();
			this.pageIsLoaded = true;
		});
	}

	ionViewDidEnter(): void {
		if (!this.chartData.hideDayData) {
			//this.sliderReady = true;
			//this.slider.slideTo(moment().weekday(), 0);
		}
		if (document.querySelector('.no-drinks-info')) {
			document.querySelector('.no-drinks-info').addEventListener('click', () => {
				this.menuProvider.openMenuWithContent({
					title: 'Niet gedronken',
					header: null,
					content: 'Het is een goed idee om minstens 2 dagen per week niet te drinken. Dit is goed voor je lichaam en voorkomt drinken uit gewoonte.',
				});
			});
		}
	}

	public onSlideDidChange(): void {
		this.currentPageIndex = this.slider.getActiveIndex();
		if (this.currentPageIndex > this.slider.length() - 1) {
			this.currentPageIndex = this.slider.length() - 1;
		}
	}

	get timeFormat(): string {
		return 'YYYY-MM-DDT00:00:00';
	}

	private fillDayOverviewForDate(offset: number): IBarChartPage {
		let day: moment.Moment = moment().startOf('week').subtract(offset, 'week');
		let page: IBarChartPage = {
			pageTitle: undefined,
			data: []
		};
		let hasGoals: boolean;
		let dayGoal: any;
		if (this.goals.hasOwnProperty('items') && this.goals.items.length > 0) {
			hasGoals = true;
		} else {
			hasGoals = false;
		}

		for (let dayIterator: number = 0; dayIterator < 7; dayIterator++) {
			let dayItem: IBarChartPoint = {
				title: day.format('dd'),
				subtitle: day.format('DD') + ' ' + day.format('MMM'),
				value: undefined,
				color: 'primary',
				disabled: day > moment(),
				goal: undefined,
				customParams: { date: day.format() },
			};
			let logRegistry: IDayRegistry = this.logs.find((log: any) => moment(log.date).format(this.timeFormat) === day.format(this.timeFormat));


			if (hasGoals && day.isAfter(moment(this.goals.startDate))) {
				dayGoal = this.goals.items.find((goal: any) => goal.dateString === day.format('dddd'));
			}

			if (logRegistry) {
				dayItem.value = logRegistry.drinkCount;
				dayItem.goal = logRegistry.goal;
				if (dayGoal || logRegistry.goal > -1) {
					dayItem.color = logRegistry.drinkCount > logRegistry.goal ? 'secondary' : 'primary';
				} else {
					dayItem.color = 'neutral';
				}
			}

			if (moment(day).startOf('day').isBefore(moment(this.startDate).startOf('day'))) {
				dayItem.disabled = true;
				dayItem.goal = undefined;
			} else {
				if (!dayItem.goal && dayGoal) {
					dayItem.goal = dayGoal.value;
				}
			}

			page.data.push(dayItem);
			day.add(1, 'day');
		}
		return page;
	}

	private fillWeekOverviewForDate(offset: number): IBarChartPage {
		let day: moment.Moment = moment().startOf('week').subtract((offset * 7) + 6, 'week');

		let page: IBarChartPage = {
			pageTitle: undefined,
			data: []
		};

		for (let weekIterator: number = 0; weekIterator < 7; weekIterator++) {
			let startDay: moment.Moment = moment(day);
			let lastDay: moment.Moment;
			let maxDrinkCount: number = 0;
			let noGoal: any;
			let infoToShow: number;
			let color: string;

			for (let dayIterator: number = 0; dayIterator < 7; dayIterator++) {
				let logRegistry: IDayRegistry = this.logs.find((log: any) => moment(log.date).format() === day.format());

				if (logRegistry) {
					if (logRegistry.goal) {
						maxDrinkCount += logRegistry.goal;
					} else {
						noGoal = true;
					}

					if (this.activeOverviewType.infoType === EOverviewType.drinksPerDay) {
						// Get drinks amount
						if (logRegistry.drinkCount) {
							if (!infoToShow) {
								infoToShow = 0;
							}
							infoToShow += logRegistry.drinkCount;
						}
					} else if (this.activeOverviewType.infoType === EOverviewType.noDrinks) {
						infoToShow = this.countChartInfo(logRegistry.drinkCount === 0, logRegistry.drinkCount, infoToShow);
					} else if (this.activeOverviewType.infoType === EOverviewType.goalsReached) {
						infoToShow = this.countChartInfo(logRegistry.drinkCount <= logRegistry.goal, logRegistry.drinkCount, infoToShow);
					}
				}

				if (dayIterator === 6) {
					lastDay = moment(day);
				}
				day.add(1, 'day');
			}

			if (!noGoal && this.activeOverviewType.infoType !== EOverviewType.goalsReached) {
				color = this.activeOverviewType.infoType === EOverviewType.noDrinks ? 'primary' : 'neutral';
			} else if (this.activeOverviewType.infoType === EOverviewType.goalsReached) {
				color = 'primary';
			}
			else if (this.activeOverviewType.infoType === EOverviewType.noDrinks) {
				color = 'primary';
			}
			else {
				color = infoToShow <= maxDrinkCount ? 'primary' : 'secondary';
			}

			page.data.push({
				title: startDay.format('MMM'),
				subtitle: startDay.format('DD') + '-' + lastDay.format('DD'),
				value: infoToShow,
				color: color,
				// shaded: logRegistry.drinkCount > logRegistry.goal,
				disabled: startDay > moment() || lastDay <= moment(this.startDate),
				customParams: { date: startDay.format() },
			});
		}

		return page;
	}

	private countChartInfo(condition: boolean, drinkCount: number, info: number): number {
		if (condition) {
			if (info === undefined) {
				info = 1;
			} else {
				info++;
			}
		} else if (drinkCount !== undefined && info === undefined) {
			info = 0;
		}
		return info;
	}

	private getChartData(): void {
		this.chartPages = [];
		switch (this.activeOverviewType.view) {
			case 'day':
				this.chartData.hideDayData = true;
				this.chartPages.unshift(this.fillDayOverviewForDate(0));
				this.chartPages.unshift(this.fillDayOverviewForDate(1));
				break;
			case 'week':
				this.chartData.hideDayData = true;
				this.chartPages.unshift(this.fillWeekOverviewForDate(0));
				if (this.chartPages[0].data[0].customParams && moment(this.chartPages[0].data[0].customParams.date) <= moment(this.startDate)) {
					this.startReached = true;
				}
				if (!this.startReached) {
					this.chartPages.unshift(this.fillWeekOverviewForDate(1));
				}
				break;
		}
	}

	private fillChartData(): void {
		let chartData: IBarChartData = {
			title: this.activeOverviewType.chartTitle,
			initialPage: this.chartPages.length - 1,
			data: this.chartPages,
			yAxis: {
				visible: false,
			},
			xAxis: {
				titleSize: (this.overviewType === EOverviewType.noDrinks || this.overviewType === EOverviewType.noDrinks) ? 15 : undefined,
				subtitleSize: (this.overviewType === EOverviewType.noDrinks || this.overviewType === EOverviewType.goalsReached) ? 10 : undefined,
			},
			hideDayData: this.chartData.hideDayData,
		};
		this.chartData = chartData;
		if (this.sliderReady) {
			this.slider.slideTo(moment().weekday(), 0);
		}
	}

	public onChartBarClick(data: any): void {
		if (this.overviewType === EOverviewType.drinksPerDay && this.sliderReady) {
			this.slider.slideTo(data.index);
			// this.nav.push('Log', { date: data.customParams.date });
		}
	}

	public onChartSlideChanged(slider: Slides): void {
		this.currentChartPageIndex = slider.getActiveIndex();
		if (this.currentChartPageIndex > slider.length() - 1) {
			this.currentChartPageIndex = slider.length() - 1;
		}
		// Check if the startPoint is reached to disable loading of new slides
		if (!this.startReached && this.chartPages[0].data[0].customParams && moment(this.chartPages[0].data[0].customParams.date) <= moment(this.startDate)) {
			this.startReached = true;
		}
		if (slider.getActiveIndex() === 0 && !this.startReached) {
			switch (this.activeOverviewType.view) {
				case 'day':
					this.chartPages.unshift(this.fillDayOverviewForDate(this.chartData.data.length));
					break;
				case 'week':
					this.chartPages.unshift(this.fillWeekOverviewForDate(this.chartData.data.length));
					break;
			}
			let immediateSlideInterval: any = setInterval(() => {
				if (slider.length() === this.chartPages.length) {
					slider.slideTo(slider.getActiveIndex() + 1, 0);
					clearInterval(immediateSlideInterval);
				}
			});
		}
	}

	public openRegistryEdit(date: string): void {
		this.nav.push('Log', { date: date });
	}
}
