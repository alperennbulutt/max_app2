/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prefer-const */
import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { StorageProvider } from './utilities/storage-provider';

import { UserProvider } from './user-provider';
import { AuthorizationProvider, Permissions } from './authorization-provider';
import { BoostMeAnalyticsProvider } from './boost-me-analytics-provider';

export enum SessionStatus {
  new = 0,
  started = 1,
  completed = 2,
}

export interface ISessionStatus {
  index: number;
  startDate: string;
  status: number;
  goals?: any;
  lessonId?: any;
}

@Injectable()
export class SessionProvider {
  private sessionStatuses: ISessionStatus[] = [];
  private firstSessionDate: string = moment().startOf('day').format();
  private sessionDurations: number[] = [7, 7, 7, 7, 7, 14, 14, 30, 30, 30];
  private currentSessionIndex: number;
  private lastCheckDate: string;
  private ready = false;

  constructor(
    private storage: StorageProvider,
    private userProvider: UserProvider,
    private authorizationProvider: AuthorizationProvider,
    private bmAnalytics: BoostMeAnalyticsProvider
  ) {
    this.init();
  }

  public init(): void {
    this.userProvider.fetch(false, true).then((data: any) => {
      this.ready = true;
      if (data) {
        this.setFirstDate(
          moment(data.reg_date, 'MMMM, DD YYYY HH:mm:ss ZZ', 'en').format()
        );
      }
    });
  }

  public isReady(): boolean {
    return this.ready;
  }

  private populateSessions(): void {
    this.sessionStatuses = [];
    let sessionStartDate: moment.Moment = moment(this.firstSessionDate).startOf(
      'day'
    );
    for (
      let iterator: number = 0;
      iterator < this.sessionDurations.length;
      iterator++
    ) {
      this.sessionStatuses.push({
        index: iterator,
        startDate: sessionStartDate.format(),
        status: 0,
      });
      sessionStartDate.add(this.sessionDurations[iterator], 'day');
    }
  }

  public getCurrentIndex(): number {
    if (
      this.sessionStatuses.length &&
      (this.currentSessionIndex === undefined ||
        !this.lastCheckDate ||
        moment(this.lastCheckDate).format('YYYY-MM-DD') <
          moment().format('YYYY-MM-DD'))
    ) {
      this.lastCheckDate = moment().format();

      this.currentSessionIndex = this.sessionStatuses.findIndex(
        (item: any, index: number) => {
          let itemStartDate: moment.Moment = moment(item.startDate);
          let itemEndDate: moment.Moment = moment(item.startDate).add(
            this.sessionDurations[index],
            'day'
          );
          if (itemStartDate < moment() && itemEndDate > moment()) {
            return true;
          }
          return false;
        }
      );
      if (this.currentSessionIndex === -1) {
        this.authorizationProvider.setPermission(Permissions.normal);
      }
    }
    return this.currentSessionIndex;
  }

  public _forceCurrentIndex(): void {
    this.currentSessionIndex++;
  }

  public setFirstDate(value: string): void {
    this.firstSessionDate = value;

    if (!this.sessionStatuses.length) {
      this.populateSessions();
      this.getCurrentIndex();
    }

    this.storage.getItem('sessions-list').then((storageData: any) => {
      if (storageData) {
        this.sessionStatuses = storageData;
        this.getCurrentIndex();
      }
    });
  }

  public getCompletedSessions(): ISessionStatus[] {
    return this.sessionStatuses.filter(
      (item: any) => item.status === SessionStatus.completed
    );
  }

  public getPrevious(): ISessionStatus {
    let sessionIndex: number = this.getCurrentIndex() - 1;
    if (sessionIndex !== -1 && sessionIndex > this.sessionDurations.length) {
      return undefined;
    }
    return this.sessionStatuses.find(
      (session: ISessionStatus, index: number) => index === sessionIndex
    );
  }

  public getCurrent(): ISessionStatus {
    let sessionIndex: number = this.getCurrentIndex();
    if (sessionIndex !== -1 && sessionIndex > this.sessionDurations.length) {
      return undefined;
    }
    return this.sessionStatuses.find(
      (session: ISessionStatus, index: number) => index === sessionIndex
    );
  }

  public getNext(): ISessionStatus {
    let sessionIndex: number = this.getCurrentIndex() + 1;
    if (sessionIndex !== -1 && sessionIndex > this.sessionDurations.length) {
      return undefined;
    }
    return this.sessionStatuses.find(
      (session: ISessionStatus, index: number) => index === sessionIndex
    );
  }

  public isFirstSessionCompleted(): boolean {
    return this.sessionStatuses[0].status === SessionStatus.completed;
  }

  public isCurrentSessionCompleted(): boolean {
    let session: ISessionStatus = this.getCurrent();
    if (session) {
      return session.status === SessionStatus.completed;
    } else {
      return false;
    }
  }

  public setCurrentSessionStarted(): void {
    let session: ISessionStatus = this.getCurrent();
    if (session) {
      session.status = SessionStatus.started;
      this.saveChanges();
    }
  }

  public setCurrentSessionCompleted(): void {
    let session: ISessionStatus = this.getCurrent();
    if (session) {
      session.status = SessionStatus.completed;
      this.saveChanges();
    }
  }

  public getNextSessionDate(): string {
    let session: ISessionStatus = this.getNext();
    if (!session) {
      return undefined;
    }
    if (session.status === SessionStatus.completed) {
      return this.sessionStatuses[this.getCurrentIndex() + 1].startDate;
    } else {
      return session.startDate;
    }
  }

  public saveChanges(): void {
    this.storage.setItem('sessions-list', this.sessionStatuses);
  }
}
