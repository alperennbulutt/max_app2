import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { StorageProvider } from './utilities/storage-provider';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';

export interface INotification {
  id?: number;
  title: string;
  body: string;
  date: string;
  type?: number;
  data?: any;
}

@Injectable()
export class NotificationProvider {
  public notifications: INotification[];
  public storageKey = 'notifications';
  public notificationObserver: Observer<any>;

  constructor(private storage: StorageProvider, private platform: Platform) {
    this.platform.ready().then(() => {
      this.getNotifications();
    });
  }

  public getNotifications(): Promise<any> {
    return new Promise((resolve: any) => {
      if (this.notifications) {
        resolve(this.notifications);
      } else {
        this.storage
          .getItem(this.storageKey)
          .then((notifications: INotification[]) => {
            this.notifications = notifications || [];
            resolve(this.notifications);
          });
      }
    });
  }

  public saveNotifications(): void {
    this.storage.setItem(this.storageKey, this.notifications);
  }

  public triggerNotification(): void {
    this.notificationObserver.next(this.notifications[0]);
  }

  public onNotification(): Observable<INotification> {
    return new Observable((observer: any) => {
      this.notificationObserver = observer;
    });
  }

  public setNotification(notification: INotification): void {
    let id = 1;
    while (
      this.notifications.find(
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (notification: INotification) => notification.id === id
      )
    ) {
      id++;
    }
    notification.date = moment(notification.date).startOf('hour').format();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    notification['id'] = id;
    this.notifications.push(notification);
    this.saveNotifications();
  }
}
