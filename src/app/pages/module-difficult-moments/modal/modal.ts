import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { StorageProvider } from '../../../providers/utilities/storage-provider';

@IonicPage({
	name: 'ModuleDifficultMomentsModal',
	segment: 'module-difficult-moments-modal'
})
@Component({
	selector: 'page-module-difficult-moments-modal',
	templateUrl: 'modal.html',
	host: {
		'class': 'coloured-background coloured-background--blue'
	}
})
export class ModuleDifficultMomentsModal {
	@ViewChild('checkbox') checkbox: any;
	public strategies: Array<any> = [];
	public selectedStrategies: Array<any> = [];
	public theme: string;
	public model: any = {
		label: 'title',
	}

	constructor(
		public nav: NavController,
		public storageProvider: StorageProvider,
		public viewController: ViewController,
		public navParams: NavParams
	) {
		this.theme = this.navParams.get('theme');
		this.strategies = this.navParams.get('strategies');
	}

	addStrategies(): void {
		this.viewController.dismiss(this.selectedStrategies);
	}

	dismiss(): void {
		this.viewController.dismiss();
	}

	public changedItems(data: any): void {
		this.selectedStrategies = data;
	}
}
