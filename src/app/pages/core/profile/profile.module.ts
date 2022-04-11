import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { Profile } from './profile';
import { SharedModule } from '../../../app/shared.module';

@NgModule({
	declarations: [
		Profile,
	],
	imports: [
		IonicPageModule.forChild(Profile),
		SharedModule,
	],
	exports: [
		Profile,
	]
})
export class ProfileModule {}
