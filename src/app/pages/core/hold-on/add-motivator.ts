/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { NavController } from '@ionic/angular/providers/nav-controller';
import { BoostMeAnalyticsProvider } from 'src/providers/boost-me-analytics-provider';
import { MotivatorsProvider } from 'src/providers/motivators-provider';

@Component({
  selector: 'page-add-motivator',
  templateUrl: 'add-motivator.html',
  host: {
    class: 'coloured-background coloured-background--red one-page',
  },
})
export class AddMotivator {
  public defaults: any;
  public motivatorId: number;
  public editorSteps: any = [
    {
      introText: '',
      placeholder: 'SCHRIJf HIER EEN MOTIVERENDE TEKST VOOR JOUW MOTIVATOR',
      showPreview: false,
      type: 'textarea',
    },
    {
      introText: '',
      showPreview: true,
      type: 'imagePicker',
      defaultImages: 'motivators',
      storageImages: 'motivators',
    },
  ];

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public motivatorsProvider: MotivatorsProvider,
    public boostMeAnalyticsProvider: BoostMeAnalyticsProvider
  ) {}

  ionViewWillEnter(): void {
    const motivator: any = this.navParams.get('motivator');
    if (motivator && motivator.hasOwnProperty('custom')) {
      this.motivatorId = motivator.id;
      this.defaults = motivator;
    }
  }

  public save(result: any): void {
    const motivator: any = {
      image: result.image,
      text: result.text,
      relativePath: result.relativePath,
      custom: true,
    };

    if (this.motivatorId) {
      motivator.id = this.motivatorId;
    }
    this.nav.pop();
    this.motivatorsProvider.saveMotivator(motivator);
    this.boostMeAnalyticsProvider.track({ name: 'HOUVOL_EIGENITEM_ADD' });
  }

  public goback(): void {
    this.nav.pop();
  }
}
