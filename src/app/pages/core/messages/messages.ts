import { Component } from '@angular/core';
import { IonicPage, Alert, AlertController } from 'ionic-angular';
import { MessageProvider, EMessageTypes } from '../../../providers/message-provider';
import moment from 'moment';
import { Subscription } from 'rxjs';

@IonicPage({
    name: 'PageMessages',
    segment: 'MessagesPage',
})
@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html',
    host: {
        class: 'coloured-background',
    },
})
export class PageMessages {
    public messageItems: any = [];
    public messages: any = [];
    public activeMessageId: number;
    public itemsToBeAdd: number = 10;
    public addedItemCount: number = 0;
    public allItemsLoaded: boolean = false;
    public messageSubscribtion: Subscription;

    constructor(private messageProvider: MessageProvider, private alertController: AlertController) {}

    ionViewWillEnter(): void {
        this.messageSubscribtion = this.messageProvider.getMessages().subscribe((messages: any) => {
            if (messages && messages.status === 'success') {
                this.messages = messages.messages.map((message: any) => {
                    if (message.title === 'Maxx' && message.content.search('Herinnering van Maxx') > -1) {
                        message = {
                            ...message,
                            ['title']: 'Moeilijke situatie',
                        };
                    }
                    return message;
                });
                this.getNewTimelineItems();
            }
        });
    }

    ionViewWillLeave(): void {
        this.messageSubscribtion.unsubscribe();
    }

    private buildMessageList(messages: any[]): void {
        let recentTimeLabels: any = {
            0: 'Vandaag',
            1: 'Gisteren',
            2: 'Eergister',
        };

        messages.forEach((message: any) => {
            const hasThumbIcon: boolean = message.title.search('thumb-icon') > -1;
            message = {
                ...message,
                hasThumbIcon: hasThumbIcon,
            };
            let messageDate: string = message.entry_date;
            let timeMoment: any;
            let label: string;
            if (moment(messageDate).isBefore(moment().subtract(3, 'days'))) {
                timeMoment = this.messageItems.find(
                    (item: any) => this.formatDate(item.label) === this.formatDate(messageDate)
                );
                label = this.formatDate(messageDate);
            } else {
                let today: moment.Moment = moment().startOf('day');
                let daysAgo: any = today.diff(moment(messageDate).startOf('day'), 'days');
                timeMoment = this.messageItems.find((item: any) => item.label === recentTimeLabels[daysAgo]);
                label = recentTimeLabels[daysAgo];
            }
            if (timeMoment) {
                timeMoment.items.push(message);
            } else {
                let timeLabel: any = {
                    label: label,
                    items: [message],
                };
                this.messageItems.push(timeLabel);
            }
        });
    }

    public getNewTimelineItems(): void {
        let begin: number = this.itemsToBeAdd * this.addedItemCount;
        let end: number = begin + this.itemsToBeAdd;
        let timelineItems: any[] = this.messages.slice(begin, end);

        if (timelineItems.length) {
            this.buildMessageList(timelineItems);
            this.addedItemCount++;
        }

        if (this.messages.length - end < 0) {
            this.allItemsLoaded = true;
        }
    }

    public addItems(event): void {
        setTimeout(() => {
            this.getNewTimelineItems();
            event.complete();
        }, 500);
    }

    public openMessage(message: any): void {
        if (this.activeMessageId === message.id) {
            this.activeMessageId = undefined;
        } else {
            this.activeMessageId = message.id;
        }
    }

    private formatDate(date: any): string {
        return moment(date).format('D MMMM YYYY');
    }

    public removeMessage(message: any, dateIndex: number, messageIndex: number): void {
        let alert: Alert = this.alertController.create({
            title: 'Bericht verwijderen',
            message: 'Weet je zeker dat je dit bericht wilt verwijderen?',
            buttons: [
                {
                    text: 'Ja',
                    handler: () => {
                        const messageSubscribtion: Subscription = this.messageProvider
                            .deleteMessage(message.id)
                            .subscribe((messages: any) => {
                                if (messages && messages.status === 'success') {
                                    this.messageItems[dateIndex].items.splice(messageIndex, 1);
                                    if (this.messageItems[dateIndex].items.length === 0) {
                                        this.messageItems.splice(dateIndex, 1);
                                    }
                                }
                            });
                        setTimeout(() => {
                            messageSubscribtion.unsubscribe();
                        }, 500);
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
