import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ModuleDifficultMomentsModal } from './modal';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		ModuleDifficultMomentsModal,
	],
	imports: [
		IonicPageModule.forChild(ModuleDifficultMomentsModal),
		SharedModule,
	],
	exports: [
		ModuleDifficultMomentsModal,
	]
})
export class ModuleDifficultMomentsModalModule { }
