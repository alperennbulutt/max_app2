import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides, AlertController, Alert, Modal, ModalController } from 'ionic-angular';
import moment from 'moment';
import { Keyboard } from '@ionic-native/keyboard';
import { StorageProvider } from '../../../providers/utilities/storage-provider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate, query } from '@angular/animations';
import { MessageProvider } from '../../../providers/message-provider';

import { DiaryProvider } from '../../../providers/diary-provider';
import { BoostMeAnalyticsProvider } from '../../../providers/boost-me-analytics-provider';
import { UserProvider } from '../../../providers/user-provider';
import { FCMProvider } from '../../../providers/fcm-provider';
import { RewardProvider } from '../../../providers/reward-provider';

export interface IDayRegistry {
    date: string;
    disabled: boolean;
    isEditDisabled?: boolean;
    goal: number;
    drinkCount: number;
    notes?: string;
}

@IonicPage({
    name: 'Log',
    segment: 'Log/:date',
})
@Component({
    selector: 'page-log',
    templateUrl: 'log.html',
    host: {
        class: 'coloured-background coloured-background--green one-page',
    },
})
export class Log {
    @ViewChild(Slides) slider: Slides;
    private storageKey: string = 'drinks-log';

    private logs: IDayRegistry[];
    private goals: any;
    private currentPageIndex: number = 0;
    private startReached: boolean = false;

    public weeks: IDayRegistry[][] = [];
    public selectedDay: IDayRegistry;
    public selectedDayBackup: IDayRegistry;
    public changedLogs: IDayRegistry[] = [];
    public openedDate: string = '';
    public startDate: string;
    public pageIsLoaded: boolean = false;
    public registeryNote: string;
    public leaveToPage: string;
    public getLogsFromServer: any;
    public currentReward: any;

    constructor(
        private nav: NavController,
        private alertController: AlertController,
        private storage: StorageProvider,
        private bmAnalytics: BoostMeAnalyticsProvider,
        private diaryProvider: DiaryProvider,
        private userProvider: UserProvider,
        private messageProvider: MessageProvider,
        private keyboard: Keyboard,
        private fcmProvider: FCMProvider,
        private rewardProvider: RewardProvider,
        private modalController: ModalController
    ) {
        this.keyboard.show();
    }

    ionViewWillEnter(): void {
        Promise.all([
            this.diaryProvider.getLogs(),
            this.userProvider.getRegistrationDate(),
            this.storage.getItem('drinking-goal'),
        ]).then((resolvedPromoses: any) => {
            let logs: any = resolvedPromoses[0];
            let startDate: string = moment(resolvedPromoses[1], 'MMMM, DD YYYY HH:mm:ss ZZ', 'en').format();
            let goals: any = resolvedPromoses[2] === 'no-goals' ? '' : resolvedPromoses[2];

            this.startDate = startDate;
            this.logs = logs || [];
            this.goals = goals || {
                items: [],
            };
            if (goals && !this.goals.logsUpdated) {
                this.updateLogGoals();
            }
            this.loadPage();
        });

        if (!this.openedDate) {
            this.slider.slideTo(this.currentPageIndex, 0);
        }
    }

    ionViewWillLeave(): void {
        // if this variabe is true, it will prevent the date slider from slading back in time.
        // Every time you leave this page, reset it to prevent that the date is 'locked' unintentionally.
        this.startReached = false;
    }

    ionViewCanLeave(): boolean {
        let buttons: any = [
            {
                text: 'Ja, terug',
                role: 'cancel',
            },
            {
                text: 'Nee, niet opslaan',
                handler: () => {
                    this.selectedDayBackup = JSON.parse(JSON.stringify(this.selectedDay));
                    this.leavePage(this.leaveToPage);
                    this.leaveToPage = '';
                },
            },
        ];
        this.checkForChanges(buttons);
        return !this.registryIsChanged();
    }

    public updateLogGoals(): void {
        this.logs.forEach((log: any) => {
            if (
                moment(log.date).isSameOrAfter(moment(this.goals.startDate).startOf('day')) &&
                moment(log.date).isSameOrBefore(this.goals.endDate)
            ) {
                log.goal = this.goals.items[moment(log.date).weekday()].value;
            }
        });
        this.storage.setItem(this.storageKey, this.logs);
    }

    public leavePage(page?: string): void {
        if (page) {
            this.leaveToPage = page;
            if (page === 'Stats') {
                this.bmAnalytics.track({ name: 'VORDERINGEN_CHOSEN', value: '2' });
            }
            this.nav.push(page);
        } else {
            this.nav.pop();
        }
    }

    public resetDay(): void {
        this.selectedDay.drinkCount = undefined;
    }

    public onSlideWillChange(event: any): void {
        this.currentPageIndex = this.slider.getActiveIndex();
        if (this.currentPageIndex > this.slider.length() - 1) {
            this.currentPageIndex = this.slider.length() - 1;
        }
    }

    public onSlideDidChange(event: any): void {
        let availableDays: IDayRegistry[] = this.weeks[this.currentPageIndex].filter(
            (dayRegistry: IDayRegistry) => !dayRegistry.disabled
        );
        this.selectDay(
            availableDays.find(
                (dayRegistry: IDayRegistry) =>
                    moment(dayRegistry.date).format('dd') ===
                    moment(this.selectedDay ? this.selectedDay.date : null).format('dd')
            ) || availableDays[availableDays.length - 1]
        );

        // Check if the startPoint is reached to disable loading of new slides
        if (moment().subtract(this.weeks.length, 'week') <= moment(this.startDate)) {
            this.startReached = true;
        }
        if (this.currentPageIndex === 0 && !this.startReached) {
            this.prependWeekToSlider(this.getWeekForDate(moment().subtract(this.weeks.length, 'week')));
        }
    }

    private loadPage(): void {
        this.weeks = [];
        this.currentPageIndex = 0;
        this.selectedDay = undefined;

        // Add the current week
        this.weeks.unshift(this.getWeekForDate(moment()));
        // Add previous week
        if (moment(this.startDate).startOf('week').isSameOrBefore(moment().subtract(1, 'week'))) {
            this.prependWeekToSlider(this.getWeekForDate(moment().subtract(1, 'week')));
        }
        // Make today the selected day
        if (!this.openedDate) {
            this.selectDay(this.weeks[this.currentPageIndex][moment().weekday()]);
        } else {
            let logRegistry: IDayRegistry = this.logs.find((log: IDayRegistry) => {
                return moment(log.date).format(this.timeFormat) === moment().startOf('day').format(this.timeFormat);
            });
            let goal: any = this.goals.items.find(
                (goal: any) => goal.dateString === moment(this.openedDate).format('dddd')
            );
            this.selectDay(
                logRegistry || {
                    date: moment().startOf('day').format(this.timeFormat),
                    disabled: false,
                    goal: goal ? goal.value : -1,
                    drinkCount: undefined,
                }
            );
        }
        this.pageIsLoaded = true;
    }

    private prependWeekToSlider(week: IDayRegistry[]): void {
        this.weeks.unshift(week);
        this.currentPageIndex++;

        if (this.slider) {
            let immediateSlideInterval: any = setInterval(() => {
                if (this.slider.length() === this.weeks.length) {
                    this.slider.slideTo(this.currentPageIndex, 0);
                    clearInterval(immediateSlideInterval);
                }
            });
        }
    }

    private getWeekForDate(date: string | moment.Moment): IDayRegistry[] {
        let day: moment.Moment = moment(date).startOf('week');
        let week: IDayRegistry[] = [];
        for (let iterator: number = 0; iterator < 7; iterator++) {
            let logRegistry: IDayRegistry = this.logs.find(
                (log: any) =>
                    moment.parseZone(log.date).format(this.timeFormat) === moment.parseZone(day).format(this.timeFormat)
            );
            if (logRegistry) {
                logRegistry.disabled = day < moment(this.startDate).startOf('day') || day > moment();
                week.push(logRegistry);
            } else {
                let goal: any = this.goals.items.find(
                    (dayGoal: any) => moment(dayGoal.date).format('dd') === day.format('dd')
                );
                week.push({
                    date: day.format(this.timeFormat),
                    disabled: day.isBefore(moment(this.startDate).startOf('day')) || day.isAfter(moment()),
                    goal: goal ? goal.value : -1,
                    drinkCount: undefined,
                });
            }
            day.add(1, 'day');
        }
        return week;
    }

    public selectDay(dayRegistry: IDayRegistry): void {
        this.registeryNote = dayRegistry.notes || '';

        if (this.selectedDay && this.selectedDayBackup) {
            this.checkForChanges();
        }

        if (dayRegistry && !dayRegistry.disabled) {
            this.selectedDay = dayRegistry;
            this.selectedDayBackup = JSON.parse(JSON.stringify(dayRegistry));
        }
    }

    public registryIsChanged(): boolean {
        return JSON.stringify(this.selectedDay) !== JSON.stringify(this.selectedDayBackup);
    }

    public checkForChanges(buttons?: any): void {
        let selectedDayBackup: any = JSON.parse(JSON.stringify(this.selectedDayBackup));
        let currSelectedDay: any = JSON.parse(JSON.stringify(this.selectedDay));
        buttons = buttons || [
            {
                text: 'Ja, opslaan',
                handler: () => {
                    this.saveLog(currSelectedDay);
                },
            },
            {
                text: 'Nee, niet opslaan',
                handler: () => {
                    let prevDate: number;
                    let weekIndex: number;
                    for (let i: number = 0; i <= this.weeks.length; i++) {
                        prevDate = this.weeks[i].findIndex(
                            (registry: any) =>
                                moment(registry.date).format(this.timeFormat) ===
                                moment(selectedDayBackup.date).format(this.timeFormat)
                        );
                        if (prevDate > -1) {
                            weekIndex = i;
                            break;
                        }
                    }
                    this.weeks[weekIndex][prevDate] = selectedDayBackup;
                },
            },
        ];

        if (this.registryIsChanged()) {
            let alert: Alert = this.alertController.create({
                title: 'Niet opgeslagen',
                message: 'Je hebt wijzigen gedaan maar deze zijn nog niet opgeslagen. Wil je dit alsnog doen?',
                buttons: buttons,
            });
            alert.present();
        }
    }

    public registeryNoteChange(): void {
        this.selectedDay['notes'] = this.registeryNote;
    }

    public updateDrinkCount(add?: boolean): void {
        let dayRegistry: IDayRegistry = this.selectedDay;
        if (dayRegistry.drinkCount !== undefined) {
            if (add) {
                dayRegistry.drinkCount++;
                if (dayRegistry.drinkCount > 99) {
                    dayRegistry.drinkCount = 99;
                }
            } else if (dayRegistry.drinkCount > 0) {
                dayRegistry.drinkCount--;
            }
        } else {
            dayRegistry.drinkCount = 0;
        }
    }

    private saveLog(logToSave?: any): void {
        logToSave = logToSave || this.selectedDay;
        localStorage.setItem('lastLog', JSON.stringify(logToSave));
        // If log is from today, delete the push notification reminder
        if (
            moment(logToSave.date).startOf('day').format(this.timeFormat) ===
            moment().startOf('day').format(this.timeFormat)
        ) {
            this.fcmProvider.cancelTodayLogreminder().subscribe();
        }

        // check if log exist and add it.
        let logIndex: number = this.logs.findIndex(
            (log: IDayRegistry) =>
                moment(log.date).format('YYYY-MM-DDTHH:mm:ss') === moment(logToSave.date).format('YYYY-MM-DDTHH:mm:ss')
        );
        if (logIndex > -1) {
            this.logs[logIndex] = logToSave;
        } else {
            // Add to logs and sort the logs by date
            this.logs.push(logToSave);
            this.logs.sort(
                (a: any, b: any) => parseInt(moment(a.date).format('X')) - parseInt(moment(b.date).format('X'))
            );
        }

        this.storage.setItem(this.storageKey, this.logs);
        //Save to server
        let todayLog: any = {
            diary: {
                score: logToSave.drinkCount,
                date: logToSave.date,
                custom: JSON.stringify(logToSave),
                description: logToSave.notes,
            },
        };

        // get success value for analytics
        let succesValue: number;
        if (logToSave === -1) {
            succesValue = 9;
        } else if (logToSave.drinkCount <= logToSave.goal) {
            succesValue = 1;
        } else {
            succesValue = 0;
        }
        this.bmAnalytics.track({ name: 'LOGBOEK_SUCCESS', value: succesValue });

        this.bmAnalytics.track({ name: 'LOGBOEK_ADD', value: logToSave.drinkCount });
        this.bmAnalytics.track({ name: 'LOGBOEK_DATE', value: moment(logToSave.date).format('D MMMM YYYY') });
        if (logToSave.notes) {
            this.bmAnalytics.track({ name: 'LOGBOEK_NOTE' });
        }

        this.diaryProvider.saveDiaryData(todayLog, true).subscribe();

        setTimeout(() => {
            this.messageProvider
                .checkforFeedback(this.nav, false, this.selectedDay.date)
                .then((hasFeedback: boolean) => {
                    if (!hasFeedback) {
                        let alert: Alert = this.alertController.create({
                            title: 'Opgeslagen',
                            message: 'De gegevens zijn succesvol opgeslagen',
                            buttons: [
                                {
                                    text: 'Ok',
                                    role: 'cancel',
                                },
                            ],
                        });
                        alert.present();
                        alert.onDidDismiss((res: any) => {
                            this.messageProvider.checkGoals(this.nav);
                        });
                    }
                });
        }, 100);
        this.selectedDayBackup = JSON.parse(JSON.stringify(this.selectedDay));
    }

    public openDefaultGlas(): void {
        let measuresModal: Modal = this.modalController.create('Measures');
        measuresModal.present();
    }

    get timeFormat(): string {
        return 'YYYY-MM-DDT00:00:00';
    }
}
