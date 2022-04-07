import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { DragAndDropModal } from './draganddrop-modal';
import { SharedModule } from '../../../../app/shared.module';

@NgModule({
  declarations: [DragAndDropModal],
  imports: [IonicPageModule.forChild(DragAndDropModal), SharedModule],
  exports: [DragAndDropModal],
})
export class DragAndDropModalModule {}
