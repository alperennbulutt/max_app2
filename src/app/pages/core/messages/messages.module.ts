import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PageMessages } from './messages';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		PageMessages,
	],
	imports: [
		IonicPageModule.forChild(PageMessages),
		SharedModule,
	],
	exports: [
		PageMessages,
	]
})
export class PageMessagesModule {}
