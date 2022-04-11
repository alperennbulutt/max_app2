import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Content } from 'ionic-angular';

import { StorageProvider } from '../../providers/utilities/storage-provider';
import { InfoProvider } from '../../providers/info-provider';

import { SurveyProvider, IQuestionnaire } from '../../providers/survey-provider';
import { UserProvider } from '../../providers/user-provider';
import { BoostMeAnalyticsProvider } from '../../providers/boost-me-analytics-provider';

@IonicPage({
  name: 'Survey',
  segment: 'Survey/:questionnaireId'
})
@Component({
  selector: 'page-survey',
  templateUrl: 'survey.html',
  host: {
    'class': 'coloured-background coloured-background--yellow'
  }
})
export class Survey {
  private storageKey: string = 'survey';
  private surveyId: number = this.navParams.get('questionnaireId');
  //private surveyId: number = 36;
  private answers: any;
  private userId: number;
  private hideBackButton: boolean = false;

  public survey: IQuestionnaire;
  public showResult: boolean = false;
  public result: any;
  public feedback: string;
  public surveyStarted: boolean = false;

  @ViewChild(Content) content: Content;
  @ViewChild('surveyComponent') surveyComponent: any;

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private view: ViewController,
    private storage: StorageProvider,
    private surveyProvider: SurveyProvider,
    private userProvider: UserProvider,
    private infoProvider: InfoProvider,
    private bmAnalytics: BoostMeAnalyticsProvider
  ) {
    this.getUserId();

    this.userProvider.fetch().then((data: any) => {
      if (data) {
        this.userId = data.id;
      }
    });

    if (this.surveyId == 35) {
      this.storage.getItem('surveyFeedback').then((feedback: any) => {
        if (feedback) {
          this.showResult = true;
          this.feedback = feedback.feedback;
        }
      });
    } else if (this.surveyId == 36) {
      this.hideBackButton = true;
    }

    this.surveyProvider.get(this.surveyId).subscribe((data: IQuestionnaire) => {
      if (data) {
        this.survey = data;
        this.survey.name = this.survey.name.replace(/(Maxx|controle|experimentele|\s\-\s)/g, '');
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  public restartTest(): void {
    this.showResult = false;
    setTimeout(() => {
      this.surveyComponent.restart();
    }, 200);
  }

  public done(): void {
    this.nav.setRoot('Home');
  }

  public getUserId(): void {
    this.userProvider.fetch().then((data: any) => {
      if (data) {
        this.userId = data.id;
      }
    });
  }

  public saveResultsToStorage(): void {
    this.result = {
      id: this.surveyId,
      result: '',
      showResult: true,
      answers: this.answers
    }
    this.surveyProvider.saveToStorage(this.surveyId, this.result);
  }

  public finish(event): void {
    event = { ...event };
    this.answers = [];
    for (let key in event) {
      if (Array.isArray(event[key].value)) {
        let value: any = event[key].value.filter((answer) => answer.selected || answer.checked).map((answer: any) => answer.value);
        this.answers.push(value[0]);
        event[key].value = value.join();
      }
    }
    this.showResult = true;
    if (this.surveyId == 35) {
      this.calculateResult();
      this.bmAnalytics.track({ name: 'HOEERVOOR_END' });
    }
    localStorage.setItem('surveyFinished_' + this.surveyId, 'true');

    let answersToSave: any = {
      list: this.surveyId,
      user_id: this.userId,
      data: event
    };
    this.surveyProvider.saveAnswers(answersToSave, true).subscribe();
  }

  public calculateResult(): void {
    let feedbackIndex: number;
    let totalPoints: number = this.answers.reduce((oldValue: any, newValue: any) => {
      return oldValue + newValue;
    }, 0);

    if (this.getAnswer(0) === 0) {
      feedbackIndex = 1;
    } else if (this.getAnswer(0) !== 0 && totalPoints >= 0 && totalPoints <= 7) {
      feedbackIndex = 2;
    } else if (this.getAnswer(0) !== 0 && totalPoints >= 8 && totalPoints <= 15) {
      feedbackIndex = 3;
    } else if (this.getAnswer(0) !== 0 && totalPoints >= 16 && totalPoints <= 25) {
      feedbackIndex = 4;
    } else if (this.getAnswer(0) !== 0 && totalPoints >= 26 && totalPoints <= 40) {
      feedbackIndex = 5;
    }

    this.infoProvider.getInfo('HOE_ERVOOR_' + feedbackIndex).subscribe((feedback: any) => {
      if (feedback) {
        this.feedback = feedback.content;
        let data: any = {
          totalPoints,
          answers: this.answers,
          feedback: this.feedback
        };
        this.storage.setItem('surveyFeedback', data);
      }
    });
  }
  public toNextQuestion(): void {
    if (this.surveyId == 35 && this.surveyComponent.isFirstQuestion() && !this.surveyStarted) {
      this.bmAnalytics.track({ name: 'HOEERVOOR_START' });
      this.surveyStarted = true;
    }
    this.surveyComponent.nextQuestion();
  }

  private getAnswer(questionNumber: number): any {
    return this.answers[questionNumber];
  }

}
