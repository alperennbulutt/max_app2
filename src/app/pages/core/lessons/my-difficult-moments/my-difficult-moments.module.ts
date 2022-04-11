import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { MyDifficultMoments } from './my-difficult-moments';
import { SharedModule } from '../../../../app/shared.module';

@NgModule({
	declarations: [
		MyDifficultMoments,
	],
	imports: [
		IonicPageModule.forChild(MyDifficultMoments),
		SharedModule,
	],
	exports: [
		MyDifficultMoments,
	]
})
export class MyDifficultMomentsModule {}
