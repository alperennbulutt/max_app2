import { Component } from '@angular/core';
import { IonicPage, NavController, Alert, AlertController } from 'ionic-angular';
import { NotificationProvider } from '../../../providers/notification-provider';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { MessageProvider, EMessageTypes } from '../../../providers/message-provider';
import { StrategyProvider } from '../../../providers/strategy-provider';
import moment from 'moment';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';

@IonicPage({
	name: 'Home'
})
@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
	host: {
		'class': 'coloured-background one-page'
	}
})
export class Home {
	public notificationsList: any = {};
	public todayGoal: string;
	public messageTypes: any = EMessageTypes;
	public expiredSituations: any;
	public unreadMessages: any;

	constructor(
		public navController: NavController,
		public notificationProvider: NotificationProvider,
		public alertController: AlertController,
		public storage: StorageProvider,
		public messageProvider: MessageProvider,
		public strategyProvider: StrategyProvider,
		public boostMeAnalyticsProvider: BoostMeAnalyticsProvider
	) { }

	ionViewWillLeave() {
		this.unreadMessages.unsubscribe();
		this.expiredSituations.unsubscribe();
	};

	ionViewWillEnter() {
		this.unreadMessages = this.messageProvider.getUnreadMessages(true).subscribe((notification: any) => {
			this.notificationsList = notification.unread_count;
		});

		this.showGoalsMessage();

		this.expiredSituations = this.strategyProvider.getExpiredSituations().subscribe((situations: any) => {
			if (situations && situations.length > 0) {
				this.notificationsList[EMessageTypes.DIFFICULTSITUATIONS] = situations.length;

				// add message for each situation
				situations.forEach((situation: any) => {
					this.messageProvider.postMessage({
						title: 'Hoe ging het?',
						content: `Je had een moeilijke situatie: ${situation.description}. Hoe ging het? Noteer het in Moeilijke situaties`,
						type: 5
					}).subscribe();
				});
			}
		});

		this.storage.getItem('drinking-goal').then((goals: any) => {
			if (goals && goals !== 'no-goals') {
				let todayGoal: any = goals.items.find((goal: any) => goal.dateString === moment().startOf('day').format('dddd'));
				if (todayGoal) {
					this.todayGoal = todayGoal.value;
				} else {
					this.todayGoal = '?';
				}
			} else {
				this.todayGoal = '?';
			}
		});
	}

	private showGoalsMessage(): void {
		let userId: string = localStorage.getItem('userId');
		let key: string = userId + '_goalsMessageShown';
		if (!JSON.parse(localStorage.getItem(key))) {
			let alert: Alert = this.alertController.create({
				title: 'Welkom!',
				message: 'Een idee voor een goede start is het stellen van doelen. Dit helpt je te bereiken wat je wilt. Wil je nu je doelen stellen?',
				buttons: [
					{
						text: 'Ja',
						handler: () => {
							this.navController.push('ModulePlanningGoal');
							this.boostMeAnalyticsProvider.track({ name: 'DOELEN_CHOSEN', value: '2' });
						}
					}, {
						text: 'Niet nu',
						role: 'cancel'
					}
				]
			});

			localStorage.setItem(key, JSON.stringify(true));
			alert.present();

			this.messageProvider.postMessage({
				title: 'Hartelijk welkom bij Maxx!',
				content: 'Mooi dat je aan de slag gaat met je alcoholgebruik! We hopen dat Maxx je biedt wat je zoekt. Veel succes met Maxx!',
				type: 5
			}).subscribe();
		}
	}

	public goToPage(pageName: string, params?: any, type?: any): void {
		let analyticsLabels: any = {
			HoldOn: 'HOUVOL_CHOSEN',
			ModuleDifficultMomentsOverview: 'MOEILIJK_CHOSEN',
			ModulePlanningGoal: 'DOELEN_CHOSEN',
			Log: 'LOGBOOK_CHOSEN',
			Lessons: 'HOE_CHOSEN',
			PageMessages: 'BERICHT_CHOSEN',
		}

		if (analyticsLabels[pageName]) {
			if (analyticsLabels[pageName] === 'ModulePlanningGoal') {
				this.boostMeAnalyticsProvider.track({ name: analyticsLabels[pageName], value: '1' });
			} else if (analyticsLabels[pageName] === 'MOEILIJK_CHOSEN') {
				this.boostMeAnalyticsProvider.track({ name: analyticsLabels[pageName], value: '1' });
			} else {
				this.boostMeAnalyticsProvider.track({ name: analyticsLabels[pageName] });
			}
		}

		if (type === 0) {
			this.strategyProvider.resetExpiredSituations();
		}

		if (type !== undefined) {
			type = type.toString();
			this.notificationsList[type] = 0;
		}
		if (params) {
			this.navController.push(pageName, params);
		} else {
			this.navController.push(pageName);
		}
	}

	public hasMark(type: number): boolean {
		if (this.notificationsList) {
			return this.notificationsList[type] > 0 || false;
		}
	}
}
