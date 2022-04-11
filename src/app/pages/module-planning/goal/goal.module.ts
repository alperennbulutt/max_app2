import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ModulePlanningGoal } from './goal';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		ModulePlanningGoal,
	],
	imports: [
		IonicPageModule.forChild(ModulePlanningGoal),
		SharedModule,
	],
	exports: [
		ModulePlanningGoal,
	]
})
export class ModulePlanningGoalModule {}
