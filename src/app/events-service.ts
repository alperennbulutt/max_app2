/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EventService {
  [x: string]: any;
  private formRefreshAnnouncedSource = new Subject();
  formRefreshSource$ = this.formRefreshAnnouncedSource.asObservable();

  menuContentUpdate(data: any) {
    this.formRefreshAnnouncedSource.next();
  }

  getObservable(): Subject<any> {
    return this.formRefreshAnnouncedSource;
  }
}
