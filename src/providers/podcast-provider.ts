/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */

import { Injectable } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Settings } from './utilities/app-settings';
import { Subject } from 'rxjs';

export interface IPodcastProgress {
  progress: number;
  percentage: number;
  duration: number;
}

@Injectable()
export class PodcastProvider {
  private _podcast: MediaObject;
  private _isPlaying = false;
  private _progress = 0;
  private _duration = 0;
  private _progressInterval: any;

  public progressObservable: Subject<any> = new Subject();
  public playingObservable: Subject<any> = new Subject();

  constructor(private media: Media) {}

  public setUrl(url: string): void {
    if (this._podcast) {
      this._podcast.release();
    }

    this._podcast = this.media.create(Settings.FileEndpoint + url);
    this._progress = 0;
    this._duration = this._podcast.getDuration();
  }

  private timeToPercent(time: number): number {
    return Math.max(
      Math.round((100 / Math.max(this._duration, 1)) * this._progress * 1000) /
        1000,
      0
    );
  }

  public play(url?: string): void {
    clearInterval(this._progressInterval);
    if (this._podcast) {
      this._progressInterval = setInterval(() => {
        if (this._podcast) {
          this._duration = this._podcast.getDuration();
          this._podcast.getCurrentPosition().then((position: number) => {
            position = Math.round(position);
            if (position !== this._progress && this._isPlaying) {
              const progress: IPodcastProgress = {
                progress: position,
                percentage: this.timeToPercent(position),
                duration: this._duration,
              };
              this.progressObservable.next(progress);
            }
            this._progress = position;
          });
        }
      }, 100);
      this._podcast.play();
      this.playingObservable.next(true);
      this._isPlaying = true;
    } else {
      this.setUrl(url);
      this.play();
    }
  }

  public pause(): void {
    clearInterval(this._progressInterval);
    this._isPlaying = false;
    this.playingObservable.next(false);
    if (this._podcast) {
      this._podcast.pause();
    }
  }

  public stop(): void {
    clearInterval(this._progressInterval);
    this._isPlaying = false;
    this.playingObservable.next(false);
    this._progress = 0;
    this._duration = 0;
    const progress: IPodcastProgress = {
      progress: 0,
      percentage: this.timeToPercent(0),
      duration: 0,
    };
    this.progressObservable.next(progress);

    if (this._podcast) {
      this._podcast.stop();
      this._podcast.release();
      this._podcast = undefined;
    }
  }
}
