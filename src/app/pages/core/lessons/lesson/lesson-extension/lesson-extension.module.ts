import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { LessonExtension } from './lesson-extension';
import { SharedModule } from '../../../../../app/shared.module';

@NgModule({
	declarations: [
		LessonExtension,
	],
	imports: [
		IonicPageModule.forChild(LessonExtension),
		SharedModule,
	],
	exports: [
		LessonExtension,
	]
})
export class LessonExtensionModule {}
