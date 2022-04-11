import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared.module';

import { Login } from './login';

@NgModule({
  declarations: [Login],
  imports: [SharedModule],
  exports: [Login],
})
export class LoginModule {}
