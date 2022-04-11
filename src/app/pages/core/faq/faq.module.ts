import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared.module';

import { Faq } from './faq';

@NgModule({
  declarations: [Faq],
  imports: [SharedModule],
  exports: [Faq],
})
export class FaqModule {}
