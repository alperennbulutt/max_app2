import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared.module';

import { HoldOn } from './hold-on';

@NgModule({
  declarations: [HoldOn],
  imports: [SharedModule],
  exports: [HoldOn],
})
export class HoldOnModule {}
