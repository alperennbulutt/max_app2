/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/component-selector */
import { Component, ViewChild } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  AlertController,
  IonSlides,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { MotivatorsProvider } from 'src/providers/motivators-provider';
import { InfoProvider } from 'src/providers/info-provider';
import { BoostMeAnalyticsProvider } from 'src/providers/boost-me-analytics-provider';
import { EventService } from 'src/app/events-service';

@Component({
  selector: 'page-hold-on',
  templateUrl: 'hold-on.html',
  host: {
    class: 'coloured-background coloured-background--red one-page',
  },
  animations: [
    trigger('explanationState', [
      state('showExplanation', style({ opacity: '1' })),
      transition('* => void', [
        style({ opacity: '1' }),
        animate(200, style({ opacity: '0' })),
      ]),
      transition('void => *', [
        style({ opacity: '0' }),
        animate(300, style({ opacity: '1' })),
      ]),
    ]),
  ],
})
export class HoldOn {
  @ViewChild('motivatorSlider') motivatorSlider: IonSlides;
  @ViewChild('motivatorPagination') motivatorPagination: any;
  public ratingStates: string[] = ['unrated', 'liked', 'disliked'];
  public activeMotivatorId: number;
  public activeMotivatorRating: any;
  public slideInterval: any = null;
  public isCustom: boolean;
  public motivators: any[] = [];
  public showExplanation = true;
  public motivatorRatings: any;
  public currentSlideIndex = 0;
  public isRated: string;

  public explanationText: string;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public motivatorsProvider: MotivatorsProvider,
    public events: EventService,
    public alertController: AlertController,
    public infoProvider: InfoProvider,
    public boostMeAnalyticsProvider: BoostMeAnalyticsProvider
  ) {}

  ionViewWillEnter(): void {
    if (localStorage.getItem('visitMotivatorsPage')) {
      this.showExplanation = false;
    }
    this.getMotivators();

    this.infoProvider.getInfo('HOU-VOL-UITLEG').subscribe((text: any) => {
      this.explanationText = text.content;
    });
  }

  ionViewWillLeave(): void {
    this.motivatorsProvider.reorderMotivators();
    if (!localStorage.getItem('visitMotivatorsPage')) {
      localStorage.setItem('visitMotivatorsPage', 'true');
    }
  }

  public toDifficultMoments(): void {
    this.nav.navigateRoot('DifficultMoments', {
      animated: true,
      animationDirection: 'forward',
    });
  }

  public getMotivators(): void {
    this.motivatorsProvider.getMotivators().subscribe((motivatorsData: any) => {
      if (motivatorsData) {
        this.motivators = motivatorsData.motivators;
        this.motivatorRatings = motivatorsData.ratings;
        this.activeMotivatorId = this.motivators[0].id;
        this.isCustomMotivator();
        this.goToSlide(0);
        this.activeMotivatorRating =
          this.motivatorRatings[this.activeMotivatorId].likeStatus;
      }
    });
  }

  public rateMotivation(like: boolean): void {
    const rating: any = this.motivatorRatings[this.activeMotivatorId];
    if (like) {
      if (rating.likeStatus !== 1) {
        this.boostMeAnalyticsProvider.track({
          name: 'HOUVOL_LIKE ',
          value: this.activeMotivatorId,
        });
      }
      rating.likeStatus = 1;
      this.isRated = 'like';
    } else {
      if (rating.likeStatus !== 2) {
        this.boostMeAnalyticsProvider.track({
          name: 'HOUVOL_NOTLIKE ',
          value: this.activeMotivatorId,
        });
      }
      rating.likeStatus = 2;
      this.isRated = 'dislike';
      rating.isFavorite = false;
    }
    setTimeout(() => {
      this.motivatorSlider.slideNext();
    }, 400);
    this.motivatorsProvider.rateMotivation(this.activeMotivatorId, rating);
    this.activeMotivatorRating =
      this.motivatorRatings[this.activeMotivatorId].likeStatus;
  }

  public toggleFavorite(): void {
    const motivatorRating: any = this.motivatorRatings[this.activeMotivatorId];
    motivatorRating.isFavorite = !motivatorRating.isFavorite;
    if (motivatorRating.isFavorite) {
      this.rateMotivation(true);
      this.boostMeAnalyticsProvider.track({
        name: 'HOUVOL_FAVORITE ',
        value: this.activeMotivatorId,
      });
    } else {
      this.motivatorsProvider.rateMotivation(
        motivatorRating.id,
        motivatorRating
      );
    }
  }

  public async slideWillChange(): Promise<void> {
    this.isRated = '';
    if (this.showExplanation) {
      this.showExplanation = false;
    }
    let slideIndex = Number(this.motivatorSlider.getActiveIndex());
    if ((await slideIndex) > this.motivators.length - 1) {
      slideIndex = this.motivators.length - 1;
    }
    if (slideIndex < 0) {
      slideIndex = 0;
    }
    this.activeMotivatorId = this.motivators[Number(slideIndex)].id;
    this.isCustomMotivator();
    this.activeMotivatorRating =
      this.motivatorRatings[this.activeMotivatorId].likeStatus;
    this.currentSlideIndex = slideIndex;
  }

  private isCustomMotivator(): void {
    const isCustom: any = this.motivators.find(
      (motivator: any) =>
        motivator.id === this.activeMotivatorId && motivator.custom
    );
    if (isCustom) {
      this.isCustom = true;
    } else {
      this.isCustom = false;
    }
  }

  public goToSlide(slideIndex: number): void {
    if (this.motivatorSlider) {
      this.motivatorSlider.slideTo(slideIndex);
    }
  }

  public isFavorite(): boolean {
    if (this.motivatorRatings) {
      return this.motivatorRatings[this.activeMotivatorId].isFavorite;
    } else {
      return false;
    }
  }

  public editMotivator(): void {
    this.nav.navigateForward('AddMotivator');
    this.boostMeAnalyticsProvider.track({ name: 'HOUVOL_EDIT' });
  }

  public async deleteMotivator(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Motivator verwijderen',
      message: 'Weet je zeker dat je deze motivator wilt verwijderen?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            const motivatorIndex: number = this.motivators.findIndex(
              (motivator: any) => motivator.id === this.activeMotivatorId
            );
            this.motivatorsProvider.deleteMotivator(this.activeMotivatorId);
            this.motivatorSlider.slideNext();
            this.motivators.splice(motivatorIndex, 1);
            this.motivatorSlider.slideTo(0, 0);
            this.boostMeAnalyticsProvider.track({
              name: 'HOUVOL_EIGENITEM_DEL',
            });
          },
        },
        {
          text: 'Nee',
          role: 'cancel',
        },
      ],
    });
    alert.present();
  }
}
