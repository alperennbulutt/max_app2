import { Component } from '@angular/core';
import { IonicPage, NavController, Alert, AlertController } from 'ionic-angular';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';


@IonicPage({
	name: 'Stats'
})
@Component({
	selector: 'page-stats',
	templateUrl: 'stats.html',
	host: {
		'class': 'coloured-background coloured-background--green one-page'
	}
})
export class Stats {
	public hasGoals: boolean = false;

	constructor(
		private nav: NavController,
		private storage: StorageProvider,
		private alertController: AlertController,
		private boostMeAnalyticsProvider: BoostMeAnalyticsProvider
	) {
	}

	ionViewWillEnter(): void {
		this.storage.getItem('drinking-goal').then((storageData: any) => {
			if (storageData) {
				this.hasGoals = true;
			}
		});
	}

	public toGoalsStats(): void {
		if (this.hasGoals) {
			this.toChartPage(2);
		} else {
			let alert: Alert = this.alertController.create({
				title: 'Geen doelen',
				message: 'Om te zien hoevaak je je doelen hebt gehaald moet je eerst doelen instellen. Wil je dit nu doen?',
				buttons: [
					{
						text: 'Ja',
						handler: () => {
							this.nav.push('ModulePlanningGoal');
						}
					},
					{
						text: 'Niet nu',
						role: 'cancel'
					}
				]
			});
			alert.present();
		}
	}

	public toChartPage(overviewType: number): void {
		let analyticsLabels: any = {
			0: 'VORDERINGEN_CHOSEN_WEEK',
			1: 'VORDERINGEN_CHOSEN_ZERO',
			2: 'VORDERINGEN_CHOSEN_SUCCESS',
		}
		this.boostMeAnalyticsProvider.track({ name: analyticsLabels[overviewType] });
		this.nav.push('ChartPage', {overviewType: overviewType});
	}
}
