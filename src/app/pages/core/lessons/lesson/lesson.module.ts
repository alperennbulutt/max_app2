import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Lesson } from './lesson';
import { SharedModule } from '../../../../app/shared.module';

@NgModule({
	declarations: [
		Lesson,
	],
	imports: [
		IonicPageModule.forChild(Lesson),
		SharedModule,
	],
	exports: [
		Lesson,
	]
})
export class LessonModule {}
