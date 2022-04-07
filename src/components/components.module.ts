import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { PipesModule } from '../pipes/pipes.module';

import { FormComponentsModule } from './form-components/form-components.module';
import { SurveyComponentsModule } from './survey-components/survey-components.module';

import { ComponentScrollShadow } from './scroll-shadow/scroll-shadow';
import { ComponentSelectSwitch } from './select-switch/select-switch';
import { ComponentFormControlMessage } from './form-error-message/form-error-message';
import { ComponentPasswordViewer } from './password-viewer/password-viewer';
import { ComponentNumberInput } from './number-input/number-input';
import { ComponentHorizontalOverflowContainer } from './horizontal-overflow-container/horizontal-overflow-container';
import { ComponentChart } from './chart/chart';
import { Editor } from './editor/editor';
import { SlideDown } from './slide-down/slide-down';
import { StarRating } from './star-rating/star-rating';

// Exercises
import { AnswerDisplayComponent } from './exercises/answerdisplaycomponent/answerdisplaycomponent';
import { CheckboxComponent } from './exercises/checkboxcomponent/checkboxcomponent';
import { DragAndDropComponent } from './exercises/draganddropcomponent/draganddropcomponent';
import { PageComponent } from './exercises/pagecomponent/pagecomponent';
import { PodcastComponent } from './exercises/podcastcomponent/podcastcomponent';
import { QuestionnaireComponent } from './exercises/questionnairecomponent/questionnairecomponent';
import { RadioComponent } from './exercises/radiocomponent/radiocomponent';
import { SliderComponent } from './exercises/slidercomponent/slidercomponent';
import { TextareaComponent } from './exercises/textareacomponent/textareacomponent';
import { TextfieldComponent } from './exercises/textfieldcomponent/textfieldcomponent';
import { WordgridComponent } from './exercises/wordgridcomponent/wordgridcomponent';

@NgModule({
  declarations: [
    ComponentScrollShadow,
    ComponentSelectSwitch,
    ComponentFormControlMessage,
    ComponentPasswordViewer,
    ComponentNumberInput,
    ComponentHorizontalOverflowContainer,
    ComponentChart,
    Editor,
    StarRating,
    SlideDown,
    // Exercises
    AnswerDisplayComponent,
    CheckboxComponent,
    DragAndDropComponent,
    PageComponent,
    PodcastComponent,
    QuestionnaireComponent,
    RadioComponent,
    SliderComponent,
    TextareaComponent,
    TextfieldComponent,
    WordgridComponent,
  ],
  imports: [
    IonicModule,
    PipesModule,
    FormComponentsModule.forRoot(),
    SurveyComponentsModule,
  ],
  exports: [
    ComponentScrollShadow,
    ComponentSelectSwitch,
    ComponentFormControlMessage,
    ComponentPasswordViewer,
    ComponentNumberInput,
    ComponentHorizontalOverflowContainer,
    ComponentChart,
    Editor,
    SlideDown,
    StarRating,
    // Exercises
    AnswerDisplayComponent,
    CheckboxComponent,
    DragAndDropComponent,
    PageComponent,
    PodcastComponent,
    QuestionnaireComponent,
    RadioComponent,
    SliderComponent,
    TextareaComponent,
    TextfieldComponent,
    WordgridComponent,
    FormComponentsModule,
    SurveyComponentsModule,
  ],
})
export class ComponentsModule {}
