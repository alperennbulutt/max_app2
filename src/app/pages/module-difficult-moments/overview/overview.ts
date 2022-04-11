import { Component } from '@angular/core';
import { IonicPage, NavController, Alert, AlertController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { StrategyProvider, ISituation } from '../../../providers/strategy-provider';
import { FCMProvider } from '../../../providers/fcm-provider';
import moment from 'moment';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';

@IonicPage({
	name: 'ModuleDifficultMomentsOverview',
	segment: 'module-difficult-moments-overview'
})
@Component({
	selector: 'page-module-difficult-moments-overview',
	templateUrl: 'overview.html',
	host: {
		'class': 'coloured-background coloured-background--blue'
	}
})
export class ModuleDifficultMomentsOverview {
	public situations: Array<any> = [];
	public strategies: Array<any> = [];

	constructor(
		public nav: NavController,
		public translate: TranslateService,
		public storageProvider: StorageProvider,
		public alertController: AlertController,
		public strategyProvider: StrategyProvider,
		public navParams: NavParams,
		public fcm: FCMProvider,
		private boostMeAnalyticsProvider: BoostMeAnalyticsProvider
	) {
		this.strategyProvider.situations.subscribe((data: ISituation[]) => {
			this.situations = data || [];
			let upcomingSituations: any = [];
			let expiredSituations: any = [];
			this.situations.forEach((situation: any) => {
				if (situation.inTheFuture) {
					upcomingSituations.push(situation);
				} else {
					expiredSituations.push(situation);
				}
			});

			upcomingSituations.sort((a: any, b: any) => {
				if (moment(a.date).isBefore(moment(b.date))) {
					return -1;
				} else if (moment(a.date).isAfter(moment(b.date))) {
					return 1;
				}
				return 0;
			});

			expiredSituations.sort((a: any, b: any) => {
				if (moment(a.date).isBefore(moment(b.date))) {
					return 1;
				} else if (moment(a.date).isAfter(moment(b.date))) {
					return -1;
				}
				return 0;
			});

			this.situations = upcomingSituations.concat(expiredSituations);
		});
	}

	public goToDetail(event?: any, params?: any): void {
		params = params || {};
		if (event) {
			params = {edit: 'true', situation: event};
		} else {
			this.boostMeAnalyticsProvider.track({ name: 'MOEILIJKSIT_PLANCHOSEN' })
		}
		this.nav.push('ModuleDifficultMomentsDetail', params);
	}
}
