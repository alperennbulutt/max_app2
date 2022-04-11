import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared.module';

import { AddMotivator } from './add-motivator';

@NgModule({
  declarations: [AddMotivator],
  imports: [SharedModule],
  exports: [AddMotivator],
})
export class AddMotivatorModule {}
