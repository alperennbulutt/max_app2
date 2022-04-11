import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Measures } from './measures';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Measures,
	],
	imports: [
		IonicPageModule.forChild(Measures),
		SharedModule,
	],
	exports: [
		Measures,
	]
})
export class MeasuresModule {}
