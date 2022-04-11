/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import { BoostMeAnalyticsProvider } from 'src/providers/boost-me-analytics-provider';
import { InfoProvider } from 'src/providers/info-provider';

@Component({
  selector: 'page-faq',
  templateUrl: 'faq.html',
  host: {
    class: 'coloured-background',
  },
})
export class Faq {
  public questions: any[] = [];
  public selectedQuestion: number;

  constructor(
    private infoProvider: InfoProvider,
    private boostMeAnalyticsProvider: BoostMeAnalyticsProvider
  ) {
    this.infoProvider.getFaq().then(
      (response: any) => {
        if (response) {
          this.questions = response.data;
        }
      },
      (error: any) => {
        console.log('error', error);
      }
    );
  }

  public open(id: number): void {
    this.boostMeAnalyticsProvider.track({ name: 'FAQ_ITEM', value: id });
  }
}
