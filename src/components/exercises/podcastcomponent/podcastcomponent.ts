/* eslint-disable no-underscore-dangle */
/* eslint-disable @angular-eslint/no-output-native */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  PodcastProvider,
  IPodcastProgress,
} from '../../../providers/podcast-provider';
import * as moment from 'moment';

@Component({
  selector: 'podcastcomponent',
  templateUrl: 'podcastcomponent.html',
})
export class PodcastComponent {
  private _isPlaying: boolean = false;
  private _progress: any = '00:00';
  private _progressPercentage: number = 0;
  private _duration: any = '00:00';
  public startFromBeginning: boolean = true;

  @Input() url: string;
  @Output() progress: EventEmitter<any> = new EventEmitter<any>();
  @Output() progressPercentage: EventEmitter<any> = new EventEmitter<any>();
  @Output() playFromStart: EventEmitter<any> = new EventEmitter<any>();

  constructor(private podcast: PodcastProvider) {
    this.podcast.progressObservable.subscribe((data: IPodcastProgress) => {
      this._progress = moment.utc(data.progress * 1000).format('mm:ss');
      this._progressPercentage = data.percentage;
      this._duration = moment.utc(data.duration * 1000).format('mm:ss');
    });

    this.podcast.playingObservable.subscribe((isPlaying: boolean) => {
      this._isPlaying = isPlaying;
    });
  }

  public play(): void {
    this.podcast.play(this.url);
    if (this.startFromBeginning) {
      this.playFromStart.emit();
      this.startFromBeginning = false;
    }
  }

  public pause(): void {
    this.podcast.pause();
  }

  public stop(): void {
    this.podcast.stop();
  }
}
