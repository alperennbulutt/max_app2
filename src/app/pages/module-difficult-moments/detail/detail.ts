import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { IonicPage, NavController, Alert, AlertController, ModalController, Content, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { StrategyProvider, ISituation } from '../../../providers/strategy-provider';
import { FormValidator } from '../../../providers/utilities/form-validator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, query, stagger, style, transition, animate, keyframes } from '@angular/animations';
import { FCMProvider } from '../../../providers/fcm-provider';

import moment from 'moment';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';

@IonicPage({
	name: 'ModuleDifficultMomentsDetail',
	segment: 'module-difficult-moments-detail/:edit'
})
@Component({
	selector: 'page-module-difficult-moments-detail',
	templateUrl: 'detail.html',
	host: {
		'class': 'coloured-background coloured-background--blue'
	},
	animations: [
		trigger('listAnimation', [
			transition('* => *', [
				query(':enter', style({ opacity: 0 }), { optional: true }),

				query(':enter', stagger('300ms', [
					animate('800ms ease-in', keyframes([
						style({ opacity: 0, transform: 'translateY(-75%)', offset: 0 }),
						style({ opacity: .5, transform: 'translateY(35px)', offset: 0.3 }),
						style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
					]))
				]), { optional: true }),

				query(':leave', stagger('300ms', [
					animate('500ms ease-in-out', keyframes([
						style({ opacity: 1, transform: 'translateX(0)', offset: 0 }),
						style({ opacity: .5, transform: 'translateX(-5px)', offset: 0.2 }),
						style({ opacity: 0, transform: 'translateX(20%)', offset: 1.0 }),
					]))
				]), { optional: true })
			])
		])
	]
})


export class ModuleDifficultMomentsDetail {
	@ViewChild(Content) content: Content;

	public form: FormGroup;
	public strategies: Array<any> = [];
	public isSubmitted: boolean = false;
	public myStrategies: Array<any> = [];
	public strategyIndex: number;
	public isEditing: boolean = this.navParams.get('edit') === 'true' ? true : false;
	public noSituations: boolean = this.navParams.get('noSituations') ? this.navParams.get('noSituations') : false;
	public openForm: boolean = false;
	public canBeReviewed: boolean = false;
	public minDate: any = moment().format();
	public maxDate: string = moment().add(2, 'year').format();
	public pageData: any = {
		title: 'Moeilijke situaties',
		intro: 'Bereid je voor op een situatie waarin je het lastig vindt om niet (te veel) te drinken.'
	};
	public dateTime: string;
	public openMore: boolean = false;
	public hasStrategies: boolean = false;
	public myDate: any;
	public canLeave: boolean = false;
	public situationModel: ISituation = {
		strategies: [],
		description: '',
		date: '',
		notificationAt: '',
		who: '',
		inTheFuture: true,
		note: '',
		rating: -1
	};
	public situation = { ...this.situationModel };
	public motivatorRating: number;
	constructor(
		public nav: NavController,
		public formBuilder: FormBuilder,
		public formValidator: FormValidator,
		public translate: TranslateService,
		public storageProvider: StorageProvider,
		public alertController: AlertController,
		public modalController: ModalController,
		public strategyProvider: StrategyProvider,
		public navParams: NavParams,
		public fcmProvider: FCMProvider,
		public boostMeAnalyticsProvider: BoostMeAnalyticsProvider
	) {
		this.form = this.formBuilder.group({
			event_date: ['', [Validators.required]],
			description: ['', [Validators.required]],
			// strategies field is a hidden checkbox which is checked if there are strategies chosen
			strategies: [this.isEditing, [Validators.required, this.formValidator.strategyValidator()]],
			guests: ['', []],
			reminder: ['', []]
		});
	}

	ionViewWillEnter(): void {
		if (this.isEditing) {
			this.situation = { ...this.navParams.get('situation') };
			this.canBeReviewed = this.situation.inTheFuture === true ? false : true;
			this.pageData.title = 'Hoe ging het?';
			this.pageData.intro = 'Je kunt hier aangeven hoe het is gegaan.';
			this.myStrategies = this.situation.strategies;
		}

		this.strategyProvider.getStrategies().then((res: Array<any>) => {
			this.strategies = res || [];
			if (!this.isEditing) {
				this.strategies.forEach((strategy: any, index: number) => {
					this.myStrategies[index] = { name: strategy.name }
				});
			}
		});
	}

	ionViewCanLeave(): boolean {
		let alert: Alert = this.alertController.create({
			title: 'Niet opgeslagen',
			message: 'Je hebt wijzigen gedaan maar deze zijn nog niet opgeslagen. Wil je dit alsnog doen?',
			enableBackdropDismiss: false,
			buttons: [
				{
					text: 'Ja, terug',
					role: 'cancel'
				},
				{
					text: 'Nee, niet opslaan',
					handler: () => {
						this.canLeave = true;
						this.nav.pop();
					}
				}
			]
		});

		if (this.canBeReviewed && !this.canLeave && (this.motivatorRating || this.situation.note)) {
			this.canLeave = false;
		} else {
			this.canLeave = true;
		}

		if (this.canLeave) {
			return true;
		} else {
			alert.present();
			return false;
		}
	}

	public leavePage(page?: string): void {
		this.nav.pop();
	}

	public presentStrategies(index: number): void {
		let currentstrategy: any;
		let hasChosenStrategies: boolean = this.myStrategies[index].hasOwnProperty('data');
		this.strategyIndex = index;

		// If there are strategies chosen, get those
		if (hasChosenStrategies) {
			currentstrategy = this.myStrategies[index];
		} else {
			currentstrategy = JSON.parse(JSON.stringify({ ...this.strategies[index] }));
		}

		let modal: any = this.modalController.create('ModuleDifficultMomentsModal',
			{
				theme: currentstrategy.name,
				strategies: currentstrategy.data
			});
		modal.onDidDismiss(data => {
			if (data && data.length) {
				//If there already chosen strategies, add them to the list, otherwise make a new list
				if (hasChosenStrategies) {
					this.myStrategies[this.strategyIndex]['strategies'] = this.myStrategies[this.strategyIndex].strategies.concat(data.filter((strategy: any) => strategy.checked));
				} else {
					this.myStrategies[this.strategyIndex]['strategies'] = data.filter((strategy: any) => strategy.checked);
				}
				this.hasStrategies = true;
				this.myStrategies[this.strategyIndex]['data'] = data.filter((strategy: any) => !strategy.checked);
			}
		});
		modal.present();
	}

	public sendToAnalytics(): void {
		let analyticsIds: number[] = [];
		let customIds: number[] = [];
		this.myStrategies.forEach((strategySection: any, index: number) => {
			let strategySectionId: number = index + 1;
			if (strategySection.hasOwnProperty('strategies')) {
				strategySection.strategies.forEach((strategy: any) => {
					if (!strategy.custom) {
						analyticsIds.push(strategy.id);
					} else {
						customIds.push(strategySectionId);
					}
				});
			}
		});
		this.boostMeAnalyticsProvider.track({ name: 'MOEILIJKSIT_ADD_AANPAK', value: analyticsIds.join() });
		if (customIds.length > 0) {
			this.boostMeAnalyticsProvider.track({ name: 'MOEILIJKSIT_ADD_EIGEN', value: customIds.join() });
		}
	}

	public save(event: any): void {
		if (this.situation.date) {
			this.situation.date = this.situation.date.replace(':00Z', '');
		}
		if (event) {
			event.preventDefault();
		}
		this.isSubmitted = true;
		if (this.form.valid || this.canBeReviewed) {
			this.situation.strategies = this.myStrategies;
			if (!this.canBeReviewed && parseInt(this.situation.notificationAt) >= 0) {
				this.schedule();
			} else {
				this.strategyProvider.saveSituation(this.situation);
			}
			this.nav.pop();
		} else {
			this.content.scrollToTop();
		}
	}

	public done(): void {
		this.canLeave = true;
		this.boostMeAnalyticsProvider.track({ name: 'MOEILIJKSIT_ADD' });
		if (this.motivatorRating) {
			this.boostMeAnalyticsProvider.track({ name: 'MOEILIJKSIT_EVALUATIE', value: this.motivatorRating });
		}
		this.sendToAnalytics();
		this.save('');
	}

	public schedule(): void {
		let reminderTime = parseInt(this.situation.notificationAt);
		let notificationDate: any = moment(this.situation.date).subtract(reminderTime, 'minutes');
		let notification: any = {
			id: this.situation.hasOwnProperty('notificationId') ? this.situation.notificationId : -1,
			data: {
				title: 'Maxx',
				message: 'Herinnering van Maxx aan je plan voor: ' + this.situation.description,
				date_to_send: notificationDate.format()
			}
		};
		this.fcmProvider.scheduleNotification(notification).subscribe((data: any) => {
			if (data.status === 'success') {
				this.situation['notificationId'] = data.message_id;
				this.strategyProvider.saveSituation(this.situation);
			} else {
				this.strategyProvider.saveSituation(this.situation);
			}
		});
	}

	public onCancel(): void {
		this.nav.pop();
	}

	public delete(): void {
		let alert: Alert = this.alertController.create({
			title: 'Situatie verwijderen',
			message: 'Weet je zeker dat je de situatie wil verwijderen?',
			buttons: [
				{
					text: 'Nee, toch niet',
					role: 'cancel'
				},
				{
					text: 'Ja',
					handler: () => {
						this.strategyProvider.deleteSituation(this.situation);
						if (this.situation.notificationId) {
							this.fcmProvider.removeScheduledNotification(this.situation.notificationId).subscribe();
						}
						this.boostMeAnalyticsProvider.track({ name: 'MOEILIJKSIT_DEL' });
						this.nav.pop();
					}
				}
			]
		});
		alert.present();
	}

	public removeStrategy(strategyIndex: number, index: number, strategy: any): void {
		this.myStrategies[strategyIndex].strategies.splice(index, 1);
		strategy.checked = false;
		this.myStrategies[strategyIndex].data.push(strategy);

		// If this is the last strategy in this category, check if the other strategies has content. if all is empty, validation is activated
		if (this.myStrategies[strategyIndex].strategies.length === 0) {
			for (let i = 0; i < this.myStrategies.length; i++) {
				if (i === strategyIndex) {
					continue;
				} else if (this.myStrategies[i].hasOwnProperty('strategies') && this.myStrategies[i].strategies.length > 0) {
					this.hasStrategies = true;
					break;
				} else {
					this.hasStrategies = false;
				}
			}
		}
	}

	public ratingChange(rating: number): void {
		this.motivatorRating = rating + 1;
	}
}

