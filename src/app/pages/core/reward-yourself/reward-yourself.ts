import { Component } from '@angular/core';
import { IonicPage, NavController, Events, AlertController, Alert } from 'ionic-angular';
import moment from 'moment';

import { AuthorizationProvider } from '../../../providers/authorization-provider';
import { RewardProvider } from '../../../providers/reward-provider';
import { defaultRewardOptions, goalOptions, imagePicker, introTexts, goalTexts } from './reward-data';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';
import { trigger, style, state, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@IonicPage({
	name: 'reward-yourself'
})
@Component({
	selector: 'page-reward-yourself',
	templateUrl: 'reward-yourself.html',
	host: {
		'class': 'coloured-background coloured-background--yellow'
	},
	animations: [
		trigger('fadeOut', [
			transition('* => void', [
				style({ opacity: 1 }),
				animate(400, style({ opacity: 0 }))
			])
		])
	]
})
export class RewardYourself {
	public days: string = '0001';
	public reward: any = {
		rewardName: '',
		image: '',
		goal: '',
		daysReached: '',
		totalDaysUntilGoal: '',
		beginDate: '',
		finished: false
	};
	public currentIntro: string;
	public isEditing: boolean = false;
	public introTexts: string[] = introTexts;
	public priceOptions: any[] = defaultRewardOptions;
	public imagePicker: any = imagePicker;
	public options: any = goalOptions;
	public rewardState: number = 0;
	public hasGoals: boolean;
	public showConfetti: boolean;
	//Add a datetime string to the url for reloading the gif from the beginning
	private gifUrl: string = 'assets/img/confetti.gif?' + new Date().getTime();
	public rewardSubscription: Subscription;

	constructor(
		public authorizationProvider: AuthorizationProvider,
		public rewardProvider: RewardProvider,
		public alertController: AlertController,
		public storage: StorageProvider,
		private bmAnalytics: BoostMeAnalyticsProvider
	) {
	}

	ionViewWillEnter(): void {
		this.bmAnalytics.track({ name: 'BELONEN_CHOSEN' });
		this.bmAnalytics.track({ name: 'EXERCISE_CHOSEN', value: 361 });
		this.storage.getItem('drinking-goal').then((storageData: any) => {
			this.hasGoals = !!(storageData && storageData !== 'no-goals');
		});
		this.getIntroText(0);


		this.rewardSubscription = this.rewardProvider.currentReward.subscribe((rewards: any) => {
			if (rewards !== null) {
				if (rewards) {
					this.rewardState = 2;
					this.getIntroText(2);
					this.reward = rewards;

					if (rewards.finished && !!!rewards['isCelebrated']) {
						this.celebrate();
						this.reward['isCelebrated'] = true;
						this.rewardProvider.updateReward(this.reward);
					}
				}
			}
		});
	}

	public ionViewDidLeave(): void {
		this.rewardSubscription.unsubscribe();
		this.reward = undefined;
	}

	public setState(direction: string): void {
		if (direction === 'next') {
			this.rewardState++;
			if (this.rewardState === 2) {
				this.saveReward();
			}
		} else {
			this.rewardState--;
		}

		this.getIntroText(this.rewardState);
	}

	public getIntroText(state: number): void {
		const text: string = this.introTexts[state];
		this.currentIntro = text;
	}

	public buildReward(key: string, value: any): void {
		// convert date picker value for usage
		if (key === 'totalDaysUntilGoal') {
			value = value.replace('00', '');
			value = value.charAt(0) === '0' ? value.substr(1) : value;
			this.buildReward('daysReached', value);
		}

		if (key === 'goal' && value === 'goal-reached' && this.hasGoals === false) {
			let alert: Alert = this.alertController.create({
				title: 'Geen doelen',
				message: 'Je kan niet op deze manier je beloning verdienen want je hebt geen doelen gesteld. Ga naar het onderdeel \'doelen\' om deze in te stellen.',
				buttons: [{ text: 'Sluiten', role: 'cancel' }]
			});
			alert.present();
			this.reward[key] = undefined;
		}
		if (key === 'image') {
			this.reward[key] = value;
		} else {
			this.reward[key] = value;
		}

	}

	public saveReward(): void {
		this.buildReward('beginDate', moment().format('YYYY-MM-DDT00:00:00'));
		this.rewardProvider.updateReward(this.reward);
		if (this.isEditing === false) {
			const rewardChosen: any = goalOptions.find((option: any) => option.value === this.reward.goal);
			if (rewardChosen) {
				this.bmAnalytics.track({ name: 'BELONEN_NEW', value: rewardChosen.id });
			}
			const goalOption: any = goalOptions.find((option: any) => option.value === this.reward.goal);
			if (goalOption) {
				this.bmAnalytics.track({ name: 'PROFILE_EDIT', value: goalOption.id });
			}
		}
		this.isEditing = false;
	}

	get onRewardPage(): boolean {
		return this.rewardState === 2;
	}

	public editReward(): void {
		this.isEditing = true;
		this.rewardState = 1;
		this.getIntroText(0);
		// set the days to the right format for the datepicker
		this.days = this.reward.totalDaysUntilGoal.length === 1 ? `000${this.reward.totalDaysUntilGoal}` : `00${this.reward.totalDaysUntilGoal}`;
		// Add custom options to the price options
		if (!!this.reward.rewardName['custom'] && !this.priceOptions.find((option: any) => option.id === this.reward.rewardName.id)) {
			this.priceOptions.push(this.reward.rewardName);
		}
	}

	public deleteReward(): void {
		const alert: Alert = this.alertController.create({
			title: 'Beloning verwijderen',
			message: 'Weet je zeker dat je deze beloning wilt verwijderen? Het aftellen stopt daarmee ook',
			buttons: [
				{
					text: 'Ja',
					handler: () => {
						this.reset();
					}
				},
				{
					text: 'Nee',
					role: 'cancel'
				}
			]
		});
		alert.present();
	}

	public nextAllowed(state: number): boolean {
		return (state === 1 && !!this.reward['image'] && !!this.reward['rewardName']) || (state === 0 && !!this.reward['goal'] && !!this.reward['daysReached']);
	}

	public reset(archive?: boolean): void {
		if (archive) {
			this.rewardProvider.archiveReward(this.reward);
		}
		this.rewardState = 0;
		this.reward = {};
		this.rewardProvider.deleteCurrentReward();
	}

	public addItem(event: any): void {
		const newItem: any = {
			id: + new Date(),
			label: event,
			custom: true
		};
		this.buildReward('rewardName', newItem);
		this.priceOptions.push(newItem);
	}

	public getGoalLine(key: string): string {
		if (!this.reward || !!!this.reward['goal']) {
			return '';
		}
		let text: string = goalTexts[this.reward.goal][key];
		if (key === 'goalText') {
			text = text.replace('[x]', this.reward.totalDaysUntilGoal);
		}
		if (key === 'countdownText') {
			text = text.replace('[x]', this.reward.daysReached);
		}

		if (this.reward.totalDaysUntilGoal === '1') {
			text = text.replace('dagen', 'dag');
		}
		return text;
	}

	public celebrate(): void {
		localStorage.setItem('rewardFinishedButNotArchived', JSON.stringify(true));
		setTimeout(() => {
			this.showConfetti = true;
			this.bmAnalytics.track({ name: 'BELONEN_GEHAALD' });
		}, 200);

		setTimeout(() => {
			this.showConfetti = false;
			this.gifUrl = 'assets/img/confetti.gif?' + new Date().getTime();
		}, 8500);
	}
}
