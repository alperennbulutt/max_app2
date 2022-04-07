import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EventService {
  private formRefreshAnnouncedSource = new Subject();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  formRefreshSource$ = this.formRefreshAnnouncedSource.asObservable();

  menuContentUpdate(data: any) {
    this.formRefreshAnnouncedSource.next();
  }

  getObservable(): Subject<any> {
    return this.formRefreshAnnouncedSource;
  }
}
