import { Injectable } from '@angular/core';
import { EventService } from 'src/app/events-service';

import { ApiGateway } from './api-gateway';

@Injectable()
export class HttpErrorHandler {
  constructor(private events: EventService, private apiGateway: ApiGateway) {
    this.apiGateway.errors$.subscribe((value: any) => {
      console.group('HttpErrorHandler');
      console.log(value.status, 'status code detected.');
      console.dir(value);
      console.groupEnd();

      if (value.status === 400) {
        console.log('Invalid Authorization Code');
      }
      if (value.status === 401) {
        console.log('Not Authorized');
        this.events.menuContentUpdate('user:logout');
      }
    });
  }
}
