import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Lessons } from './lessons';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Lessons,
	],
	imports: [
		IonicPageModule.forChild(Lessons),
		SharedModule,
	],
	exports: [
		Lessons,
	]
})
export class LessonsModule {}
