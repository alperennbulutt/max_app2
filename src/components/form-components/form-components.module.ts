import { NgModule, ModuleWithProviders } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { RadioComponent } from './radio-component/radio-component';
import { CheckboxComponent } from './checkbox-component/checkbox-component';
import { TextAreaComponent } from './textarea-component/textarea-component';
import { InputComponent } from './input-component/input-component';

import { FormComponentLoader } from './form-component-loader/form-component-loader';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    RadioComponent,
    CheckboxComponent,
    TextAreaComponent,
    InputComponent,
    FormComponentLoader,
  ],
  exports: [
    RadioComponent,
    CheckboxComponent,
    TextAreaComponent,
    InputComponent,
    FormComponentLoader,
  ],
  entryComponents: [
    RadioComponent,
    TextAreaComponent,
    CheckboxComponent,
    InputComponent,
  ],
})
export class FormComponentsModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: FormComponentsModule,
    };
  }
}
