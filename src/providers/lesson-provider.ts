import { Injectable } from '@angular/core';

import { CacheRequest } from './utilities/cache-request';
import { Settings } from './utilities/app-settings';
import { Observable, ReplaySubject } from 'rxjs';

export interface ILessonPageBlock {
  audio: string;
  audio_id: string;
  component: string;
  content: string;
  id: number;
  image: string;
  image_id: string;
  page: number;
  questiondef: string;
  rank: number;
  title: string;
  type: string;
  video: string;
}

export interface ILessonPage {
  content: string;
  duration: string;
  file: string;
  id: number;
  pageblocks: ILessonPageBlock[];
  rank: number;
  title: string;
  voiceover: string;
  workbook: boolean;
}

export interface ILessonLabel {}

export interface ILessonRelated {}

export interface ILesson {
  icon: string;
  id: number;
  labels: ILessonLabel[];
  pages: ILessonPage[];
  rank: number;
  related: ILessonRelated[];
  required: boolean;
  title: string;
  isFavorite?: boolean;
  completedCount?: number;
}

@Injectable()
export class LessonProvider {
  public lessons = new ReplaySubject<any>(1);
  public lessonData: any;

  constructor(private settings: Settings, private cacheRequest: CacheRequest) {
    this.getLessons();
  }

  public fetch(hideLoader?: boolean): Promise<ILesson[]> {
    let method: string = 'boostme.getLessons';
    return this.cacheRequest.fetch(
      this.settings.apiEndpoint,
      method,
      { appid: this.settings.appId },
      false,
      hideLoader,
      900 // @TODO: cache for longer than 1 second
      // 30 * 60 // Cache for 30 minutes
    );
  }

  public getLessons(): void {
    this.fetch().then((data: any) => {
      this.lessonData = data;
      this.lessons.next(this.lessonData);
    });
  }
}
