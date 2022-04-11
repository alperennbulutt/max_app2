import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Survey } from './survey';
import { SharedModule } from '../../app/shared.module';

@NgModule({
	declarations: [
		Survey,
	],
	imports: [
		IonicPageModule.forChild(Survey),
		SharedModule,
	],
	exports: [
		Survey,
	]
})
export class SurveyModule {}
