import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { StorageProvider } from '../../../../providers/utilities/storage-provider';
import { SituationsProvider } from '../../../../providers/situations-provider';
import { InfoProvider } from '../../../../providers/info-provider';
import { BoostMeAnalyticsProvider } from '../../../../providers/boost-me-analytics-provider';

@IonicPage({
	name: 'MyDifficultMoments'
})
@Component({
	selector: 'page-my-difficult-moments',
	templateUrl: 'my-difficult-moments.html',
	host: {
		'class': 'coloured-background coloured-background--yellow'
	}
})

export class MyDifficultMoments {
	public situations: any[] = [];
	public currentSituationIndex: number = 0;
	public currentSituation: any;
	public isCustomSituation: boolean = false;
	public customSituationValue: string;
	public showResult: boolean = false;
	public resultText: string;
	public canFinish: boolean = false;

	public myDifficultSituations: any = [];
	public customInput: any = {
		issues: []
	};

	constructor(
		private storage: StorageProvider,
		private situationsProvider: SituationsProvider,
		private infoProvider: InfoProvider,
		public boostMeAnalyticsProvider: BoostMeAnalyticsProvider,
		private nav: NavController
	) {}

	ionViewWillEnter(): void {
		this.infoProvider.getInfo('RESULT_DIFFICULT_SITUATIONS').subscribe((result: any) => {
			this.resultText = result.content;
		});

		this.boostMeAnalyticsProvider.track({ name: 'TEST_MOEILIJK_CHOSEN' });


		this.storage.getItem('myDifficultSituations').then((data: any) => {
			if (data) {
				this.showResult = true;
				this.myDifficultSituations = data;
			}
		});

		this.situationsProvider.fetch().then((data: any) => {
			this.situations = data.data;
			this.updateCurrentSituation();
		});
	}

	public updateCurrentSituation(): void {
		if (this.currentSituation) {
			this.fillMySituations();
		}
		this.currentSituation = this.situations[this.currentSituationIndex];

		if (this.currentSituation) {
			this.isCustomSituation = this.currentSituation.issues.filter((issue: any) => {
				return issue.title === '999';
			}).length > 0
		}
	}

	public addCustomSituation(): void {
		let newIssue: any = {
			title: this.customSituationValue,
			description: '',
			checked: true
		};
		this.currentSituation.issues.push(newIssue);
		this.customSituationValue = '';
		this.canFinish = true;
	}

	public fillMySituations(): void {
		let situationIndex: number = this.myDifficultSituations.findIndex((situation: any) => situation.title === this.currentSituation.situation);
		if (situationIndex === -1) {
			let newSituation: any = {
				title: this.currentSituation.situation,
				situations: this.currentSituation.issues.filter((situation: any) => situation.checked)
			};
			if (newSituation.situations.length > 0) {
				this.myDifficultSituations.push(newSituation);
			}
		} else {
			this.myDifficultSituations[situationIndex].situations = this.currentSituation.issues.filter((situation: any) => situation.checked);
		}
	}

	public updateState(back?: boolean, forceTo?: number): void {
		if (forceTo !== undefined) {
			this.currentSituationIndex = forceTo;
		} else {
			if (back) {
				this.currentSituationIndex--;
				if (this.currentSituationIndex < 0) {
					this.currentSituationIndex = 0;
				}
			} else {
				this.isFinishingAllowed();
				this.currentSituationIndex++;
				if (this.currentSituationIndex > this.situations.length) {
					this.currentSituationIndex = this.situations.length;
				}
			}
		}
		this.showResult = this.currentSituationIndex === this.situations.length;
		this.updateCurrentSituation();
		if (this.showResult) {
			this.storage.setItem('myDifficultSituations', this.myDifficultSituations);
			this.boostMeAnalyticsProvider.track({ name: 'TEST_MOEILIJK_KLAAR' });
		}
	}

	public edit(): void {
		this.updateState(false, 0);
		this.myDifficultSituations = [];
	}

	public onChange(event: any, index: number): void {
		this.currentSituation.issues[index]['checked'] = event.checked;
		if (event.checked) {
			this.canFinish = true;
		} else {
			this.isFinishingAllowed();
		}
	}

	private isFinishingAllowed(): void {
		if (this.myDifficultSituations.length > 0) {
			for (let i: number = 0; i < this.myDifficultSituations.length; i++) {
				if (this.myDifficultSituations[i].hasOwnProperty('situations') && this.myDifficultSituations[i].situations.length > 0) {
					this.canFinish = true;
					break;
				} else {
					this.canFinish = false;
				}
			}
		} else {
			this.canFinish = false;
		}
	}

	public open(situationId: number): void {
		// The keys are the issule id, the value is the analytics value
		let analyticsLabels: any = {
			4: 1,
			5: 2,
			6: 3,
			7: 4,
			10: 5,
			11: 6,
			12: 7,
			13: 8,
			14: 9,
			15: 10,
			9: 13,
			17: 14,
			18: 15,
			19: 16,
			20: 17,
			21: 18,
			22: 19,
			23: 20,
			24: 21,
			25: 22,
			26: 23,
			27: 24,
			28: 25,
			29: 26,
			30: 27,
			31: 28,
			32: 29,
			33: 30
		}
		this.boostMeAnalyticsProvider.track({ name: 'TEST_MOEILIJK_ADVIES', value: analyticsLabels[situationId] });
	}

	public openDifficultMoment(): void {
		this.nav.push('ModuleDifficultMomentsOverview');
		this.boostMeAnalyticsProvider.track({ name: 'MOEILIJK_CHOSEN', value: '2' });
	}
}
