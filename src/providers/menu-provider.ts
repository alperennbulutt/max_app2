import { Injectable } from '@angular/core';
import { MenuController } from '@ionic/angular';
// import { Events, MenuController } from '@ionic/angular';
import { EventService } from 'src/app/events-service';

export interface IMenuContent {
  title: string;
  header: string;
  content: string;
}

@Injectable()
export class MenuProvider {
  constructor(
    private events: EventService,
    private menuController: MenuController
  ) {}

  openMenuWithContent(content: IMenuContent): void {
    this.events.menuContentUpdate(content);
    this.menuController.toggle('right');
  }
}
