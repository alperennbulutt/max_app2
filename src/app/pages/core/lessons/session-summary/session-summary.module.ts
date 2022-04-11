import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SessionSummary } from './session-summary';
import { SharedModule } from '../../../../app/shared.module';

@NgModule({
	declarations: [
		SessionSummary,
	],
	imports: [
		IonicPageModule.forChild(SessionSummary),
		SharedModule,
	],
	exports: [
		SessionSummary,
	]
})
export class SessionSummaryModule {}
