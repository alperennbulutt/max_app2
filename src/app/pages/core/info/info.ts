import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';

import { InfoProvider } from '../../../providers/info-provider';

@IonicPage({
	name: 'Info',
	segment: 'Info/:code'
})
@Component({
	selector: 'page-info',
	templateUrl: 'info.html',
	host: {
		'class': 'coloured-background'
	}
})
export class Info {
	private pageCode: string = this.navParams.get('code');

	public page: any;

	constructor(
		private navParams: NavParams,
		private infoProvider: InfoProvider,
	) {}

	ionViewWillEnter(): void {
		this.infoProvider.getInfo(this.pageCode).subscribe((intro: any) => {
			this.page = intro;
		});
	}
}
