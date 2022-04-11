import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Alert, ModalController, Modal, ToastController, Toast } from 'ionic-angular';
import moment from 'moment';

import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { NotificationProvider, INotification } from '../../../providers/notification-provider';
import { MessageProvider } from '../../../providers/message-provider';
import { InfoProvider } from '../../../providers/info-provider';

import { SessionProvider } from '../../../providers/session-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';
import { MenuProvider } from '../../../providers/menu-provider';
import { UserProvider } from '../../../providers/user-provider';

interface IDayEntry {
	date: moment.Moment;
	dateString: string;
	value: number;
	prevValue: number;
	noGoal: boolean;
}

@IonicPage()
@Component({
	selector: 'page-module-planning-goal',
	templateUrl: 'goal.html',
	host: {
		'class': 'coloured-background coloured-background--pink'
	}
})
export class ModulePlanningGoal {
	private storageKey: string = 'drinking-goal';
	@ViewChild('datePicker') datePicker;

	public dayEntries: IDayEntry[] = [];
	public dayEntriesBackup: IDayEntry[] = [];
	public totalDrinks: number = 0;
	public noDrinkDays: number = 0;
	public noGoals: boolean = false;
	public isEditing: boolean;
	public isEditingFirstTime: boolean = true;
	public userGender: string;
	public extraInfoContent: any = {};
	public maxDateYear: number;
	public goalDates: any = {
		startDate: {
			formated: moment().format('D MMMM'),
			raw: moment(),
			savedDate: ''
		},
		endDate: {
			formated: moment().add(2, 'weeks').format('D MMMM'),
			raw: moment().add(2, 'weeks'),
			savedDate: ''
		},
		activeDate: {
			date: '',
			activeKey: ''
		}
	};
	public feedbackGiven: boolean = false;
	public canLeave: boolean = false;

	constructor(
		private nav: NavController,
		private navParams: NavParams,
		private alertController: AlertController,
		private storage: StorageProvider,
		private sessionProvider: SessionProvider,
		private bmAnalytics: BoostMeAnalyticsProvider,
		private menuProvider: MenuProvider,
		private notificationProvider: NotificationProvider,
		private userProvider: UserProvider,
		private infoProvider: InfoProvider,
		private messageProvider: MessageProvider,
		private modalController: ModalController,
		private toastController: ToastController
	) { }

	ionViewWillEnter(): void {
		if (this.navParams.get('fromPopup')) {
			this.bmAnalytics.track({ name: 'DOELEN_CHOSEN', value: '3' });
		}
		this.getDrinkGoalData();
		this.getUserGender();
		this.maxDateYear = moment().add(1, 'year').year();
		this.storage.getItem('feedbackGiven').then((feedbackGivenDate: string) => {
			if (feedbackGivenDate) {
				if (moment(feedbackGivenDate).isSameOrAfter(moment().startOf('day'))) {
					this.feedbackGiven = true;
				}
			} else {
				this.feedbackGiven = false;
			}
		});

		this.infoProvider.getInfo('INFO-DOELEN').subscribe((text: any) => {
			this.extraInfoContent['content'] = text.content;
			this.extraInfoContent['title'] = text.title;
		});
	}

	public getDrinkGoalData(): void {
		this.buildEntryData();
		this.storage.getItem(this.storageKey).then((storageData: any) => {
			if (storageData && storageData !== 'no-goals') {
				this.isEditing = false;
				storageData.items.forEach((item: any, index: number) => {
					this.dayEntries[index].value = item.value;
					this.dayEntries[index].noGoal = false;
				});
				this.goalDates.startDate.savedDate = storageData.startDate;
				this.goalDates.endDate.savedDate = storageData.endDate;
				this.changeGoalDates(storageData.startDate, 'startDate');
				this.changeGoalDates(storageData.endDate, 'endDate');
				this.updateTotal();
			} else {
				this.isEditing = true;
				this.noGoals = true;
			}
		}).catch((error: any) => {
			console.log('Error fetching data', error);
		});
	}

	public getUserGender(): void {
		this.userProvider.fetch(false, true).then((data: any) => {
			if (data) {
				this.userGender = data.gender;
			}
		});
	}

	public resetEntries(): void {
		this.dayEntries = [];
		this.totalDrinks = 0;
		this.noDrinkDays = 0;
		this.noGoals = true;
		this.buildEntryData();
	}

	public buildEntryData(): void {
		let day: moment.Moment = moment().startOf('week');
		for (let dayOffset: number = 0; dayOffset < 7; dayOffset++) {
			this.dayEntries.push({
				date: moment(day),
				dateString: day.format('dddd'),
				value: -1,
				prevValue: 0,
				noGoal: true
			});
			day.add(1, 'days');
		}
		this.dayEntriesBackup = JSON.parse(JSON.stringify(this.dayEntries));
	}

	ionViewCanLeave(): boolean {
		if (this.canLeave || !this.isEditing) {
			return true;
		} else if (this.isEditing && JSON.stringify(this.dayEntries) !== JSON.stringify(this.dayEntriesBackup)) {
			let alert: Alert = this.alertController.create({
				title: 'Niet opgeslagen',
				message: 'Je hebt je doelen gewijzigd maar niet opgeslagen. Wil je dit alsnog doen?',
				buttons: [
					{
						text: 'Nee, niet opslaan',
						handler: () => {
							this.nav.pop();
							this.canLeave = true;
						}
					},
					{
						text: 'Ja, terug naar opslaan',
						role: 'cancel'
					}
				]
			});
			alert.present();
			return false;
		} else {
			this.canLeave = true;
		}
	}

	public openDatepicker(isStartTime?: boolean): void {
		if (this.isEditing) {
			let key: string;
			if (isStartTime) {
				key = 'startDate';
			} else {
				key = 'endDate';
			}
			this.goalDates.activeDate.date = this.goalDates[key].raw.toISOString();
			this.goalDates.activeDate.activeKey = key;
			setTimeout(() => {
				this.datePicker.open();
			}, 100);
		}
	}

	public changeGoalDates(date: any, forceKey?: string): void {
		let key: string = forceKey || this.goalDates.activeDate.activeKey;
		let newDate: any;
		if (forceKey) {
			newDate = moment(date);
		} else {
			newDate = moment().year(date.year).month(date.month - 1).date(date.day);
		}
		this.goalDates[key].formated = newDate.format('D MMMM');
		this.goalDates[key].raw = newDate;
	}

	public toggleEditing(afterSave?: boolean, editButton?: boolean): void {
		if (editButton) {
			this.bmAnalytics.track({ name: 'DOELEN_EDIT' });
		}
		if (!afterSave) {
			if (this.isEditing) {
				this.canLeave = false;
				this.dayEntries = [...this.dayEntriesBackup];
				this.changeGoalDates(this.goalDates.startDate.savedDate, 'startDate');
				this.changeGoalDates(this.goalDates.endDate.savedDate, 'endDate');
				this.updateTotal();
			} else {
				this.dayEntriesBackup = JSON.parse(JSON.stringify(this.dayEntries));
				this.isEditingFirstTime = false;
				this.changeGoalDates(moment(), 'startDate');
				this.changeGoalDates(moment().add(2, 'weeks'), 'endDate');
			}
		}
		this.isEditing = !this.isEditing;
	}

	public updateTotal(event?): void {
		this.noGoals = false;
		this.totalDrinks = this.dayEntries.map((entry: IDayEntry) => {
			entry.noGoal = entry.noGoal && entry.value === -1;
			return entry.value;
		}).reduce((value: number, item: number) => {
			item = item > -1 ? item : 0;
			return item + value;
		});

		this.noDrinkDays = this.dayEntries.filter((entry: IDayEntry) => {
			return entry.value === 0 && !entry.noGoal;
		}).length;
	}

	public openInfo(): void {
		this.menuProvider.openMenuWithContent({
			title: this.extraInfoContent.title,
			header: '',
			content: this.extraInfoContent.content
		});
	}

	public openMeasures(): void {
		let measuresModal: Modal = this.modalController.create('Measures');
		measuresModal.present();
	}

	get timeFormat(): string {
		return 'YYYY-MM-DDT00:00:00';
	}

	public done(clickBackButton?: boolean): void {
		let gender: string = this.userGender;
		let riskLevel: string;
		let feedbackText: string;
		let drinkValues: any = {
			m: {
				riskAmount: 5,
				criticalAmount: 6,
			},
			f: {
				riskAmount: 3,
				criticalAmount: 4,
			}
		}
		let drinkingGoalList: number[] = this.dayEntries.map((entry: any) => entry.value);
		let highestDrinkValue: number = drinkingGoalList.reduce((a: number, b: number) => Math.max(a, b));
		let lowestDrinkValue: number = drinkingGoalList.reduce((a: number, b: number) => Math.min(a, b));
		let criticalDrinkAmount: number = drinkValues[gender].criticalAmount;
		let riskAmount: number = drinkValues[gender].riskAmount;
		let riskLevels: any = {
			noEntries: 0,
			perfect: 1,
			lowRisk: 2,
			good: 3,
			noExtremes: 4,
			noExtremes2: 5,
			highRisk: 6,
			highRisk2: 7,
			highest: 8,
			fallback: 9
		}

		if (lowestDrinkValue > -1) {
			this.bmAnalytics.track({ name: 'DOELEN', value: drinkingGoalList.join() });
		}

		let entriesWithoutGoals: any = this.dayEntries.filter((entry: any) => entry.noGoal);
		let hasGoals: boolean = entriesWithoutGoals.length === 0;
		let noGoals: boolean = entriesWithoutGoals.length === 7;
		if (hasGoals && !this.feedbackGiven) {
			// All days perfect
			if (this.noDrinkDays === 7) {
				riskLevel = 'perfect';
			}
			// 2 or less nodrinks and not more than 3
			else if (this.noDrinkDays >= 2 && highestDrinkValue < 3) {
				riskLevel = 'lowRisk';
			}
			// nodrinks less than 2, highest is less than 3
			else if (this.noDrinkDays < 2 && highestDrinkValue < 3) {
				riskLevel = 'good';
			}
			// highest drink more than risk, nodrinkdays is more than 2
			else if (highestDrinkValue <= riskAmount && this.noDrinkDays >= 2) {
				riskLevel = 'noExtremes';
			}
			// highest value less than riskamount, nodrinkdays less than 2
			else if (highestDrinkValue <= riskAmount && this.noDrinkDays <= 1) {
				riskLevel = 'noExtremes2';
			}
			//highestDrinkValue more than critical, nodrinkdays 2 or more
			else if (highestDrinkValue >= criticalDrinkAmount && this.noDrinkDays >= 2) {
				riskLevel = 'highRisk';
			}
			//highestDrinkValue more than critical, at least one lower than critical, nodrinks less than 2
			else if (highestDrinkValue >= criticalDrinkAmount && lowestDrinkValue <= criticalDrinkAmount && this.noDrinkDays <= 1) {
				riskLevel = 'highRisk2';
			}
			//all days critical or higher
			else if (this.noDrinkDays === 0 && lowestDrinkValue > riskAmount && this.totalDrinks >= (7 * criticalDrinkAmount)) {
				riskLevel = 'highest';
			} else {
				riskLevel = 'fallback';
			}

			//this.storage.setItem('feedbackGiven', moment().startOf('day').format());
			//this.feedbackGiven = true;
		} else if (noGoals) {
			riskLevel = 'noEntries';
		} else {
			riskLevel = 'fallback';
		}

		this.infoProvider.getInfo('GOALS_FEEDBACK_' + riskLevels[riskLevel]).subscribe((text: any) => {
			if (text) {
				feedbackText = text.content;
				this.bmAnalytics.track({ name: 'DOELEN_FEEDBACK', value: riskLevels[riskLevel] })
			} else {
				feedbackText = 'Je doelen zijn opgeslagen';
			}

			let alert: Alert = this.alertController.create({
				title: 'Doelen opslaan',
				subTitle: feedbackText,
				buttons: [{
					text: 'Aanpassen',
					role: 'cancel',
				}, {
					text: 'Afronden',
					handler: () => {
						let goals: any;
						if (noGoals) {
							goals = 'no-goals';
						} else {
							goals = {
								startDate: this.goalDates.startDate.raw.format(),
								endDate: this.goalDates.endDate.raw.format(),
								items: this.dayEntries,
								lastUpdated: moment().format(),
								logsUpdated: false
							}
						}
						this.goalDates.startDate.savedDate = goals.startDate;
						this.goalDates.endDate.savedDate = goals.endDate;
						this.storage.setItem(this.storageKey, goals);
						this.toggleEditing(true);
					}
				}]
			});
			if (hasGoals || noGoals) {
				alert.present();
			} else {
				let toast: Toast = this.toastController.create({
					message: 'Je hebt nog niet alle doelen ingevuld. Klik op \'wis doelen\' als je geen doelen wil instellen.',
					duration: 4000,
				});
				toast.present();
			}
		});
	}
}
