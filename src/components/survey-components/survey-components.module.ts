import { NgModule, ModuleWithProviders } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormComponentsModule } from '../form-components/form-components.module';
import { DirectivesModule } from '../../directives/directives.module';

import { SurveyComponent } from './survey-component/survey-component';
import { ResultComponent } from './result-component/result-component';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormComponentsModule, DirectivesModule],
  declarations: [SurveyComponent, ResultComponent],
  exports: [SurveyComponent, ResultComponent],
})
export class SurveyComponentsModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SurveyComponentsModule,
    };
  }
}
