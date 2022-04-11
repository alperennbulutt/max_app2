import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ModuleDifficultMomentsDetail } from './detail';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		ModuleDifficultMomentsDetail,
	],
	imports: [
		IonicPageModule.forChild(ModuleDifficultMomentsDetail),
		SharedModule,
	],
	exports: [
		ModuleDifficultMomentsDetail,
	]
})
export class ModuleDifficultMomentsDetailModule {}
