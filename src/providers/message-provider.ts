/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';

import { AlertController } from '@ionic/angular';
import { CacheRequest } from './utilities/cache-request';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';
import { StrategyProvider, ISituation } from './strategy-provider';
import { StorageProvider } from './utilities/storage-provider';
import { UserProvider } from './user-provider';
import { InfoProvider } from './info-provider';
import * as moment from 'moment';
import { RewardProvider } from './reward-provider';
import { BoostMeAnalyticsProvider } from './boost-me-analytics-provider';
// burası
import { empty } from 'rxjs';
import { of } from 'rxjs';

export enum EMessageTypes {
  DIFFICULTSITUATIONS = 0,
  HOLDON = 1,
  GOALS = 2,
  DIARY = 3,
  HOW = 4,
  MESSAGES = 5,
}

export interface IMessage {
  title: string;
  content: string;
  type: number;
}

@Injectable()
export class MessageProvider {
  public messageObserver: Observer<any>;
  public messages: any;
  public appData: any = {
    goals: '',
    registrationDate: '',
    logs: '',
    todaySituations: '',
  };
  public currentReward: any;

  public feedback: any = {
    noGoals: {
      id: 1,
      title: 'Stel je doelen!',
      message:
        // eslint-disable-next-line max-len
        'Een doel geeft je houvast. Het helpt je om te bereiken wat je wilt. Wil je minderen of stoppen met drinken? Stel nu je doelen en vergroot je kans op succes.',
      addToMessages: true,
      buttons: [
        {
          text: 'Niet nu',
          action: '',
        },
        {
          text: 'Naar mijn doelen',
          action: 'ModulePlanningGoal',
        },
      ],
    },
    goalsExpired: {
      id: 2,
      title: 'Doelen stellen',
      message: {
        0: 'Ben je nog tevreden met je doelen? Je kunt ze zo nodig aanpassen',
        1: 'Kijk eens naar je doelen. Werken ze nog goed voor jou, of wil je ze aanpassen?',
        2: 'Hoe bevallen je doelen? Wil je ze voor langere tijd vast stellen. Of is het tijd voor nieuwe doelen?',
      },
      addToMessages: true,
      buttons: [
        {
          text: 'Niet nu',
          action: '',
        },
        {
          text: 'Naar mijn doelen',
          action: 'ModulePlanningGoal',
          params: { fromPopup: true },
        },
      ],
    },
    firstInputNotReached: {
      id: 3,
      title: 'Logboek ingevuld!',
      message:
        // eslint-disable-next-line max-len
        'Goed dat je je logboek bijhoudt! Lukt het niet meteen om je aan je max te houden? Geef niet op! Leer wat je een volgende keer anders kunt doen.',
      addToMessages: true,
      buttons: [
        {
          text: 'Sluiten',
          action: '',
        },
      ],
    },
    firstInputReached: {
      id: 4,
      title: 'Logboek ingevuld!',
      message: 'Je houdt je aan je max. Dat is een goede start. Houden zo!',
      addToMessages: true,
      buttons: [
        {
          text: 'Sluiten',
          action: '',
        },
      ],
    },
    logbookAndReached: {
      id: 5,
      title: 'Logboek ingevuld!',
      message: {
        0: 'Goed hoor! Je hield je aan je max!',
        1: 'Super! Het is je gelukt om je aan je max te houden!',
        2: 'Je mag trots zijn! Je hebt je aan je max gehouden!',
        3: 'Gefeliciteerd! Je hield je weer aan je max!',
        4: 'Fantastisch! Mooi binnen je max!',
        5: 'Goed gedaan! Je hield je goed aan je max.',
        6: 'Complimenten! Je zat weer binnen je max.',
        7: 'Goed bezig! Je hield je prima aan je max.',
        8: 'Super hoor! Je hield je aan je max.',
        9: 'Top! Goed gedaan! Weer binnen je max.',
        10: 'Heel mooi! Je doel gehaald.',
        11: 'Prachtig binnen je max!',
        12: 'Wat goed! Mooi binnen je max.',
        13: 'Mooi! Goed binnen je max.',
        14: 'Geweldig! Binnen je max!',
        15: 'Gefeliciteerd! Je doel gehaald.',
        16: 'Compliment! Weer binnen je max.',
      },
      addToMessages: true,
      buttons: [
        {
          text: 'Sluiten',
          action: '',
        },
      ],
    },
    logbookAndReachedWithSituations: {
      id: 6,
      title: 'Logboek ingevuld!',
      message: {
        0: 'Goed hoor! Je hield je aan je max! En dat met een moeilijke situatie deze dag.',
        1: 'Super! Het is je gelukt om je aan je max te houden! En dat met een moeilijke situatie vandaag.',
        2: 'Je mag trots zijn! Je hebt je aan je max gehouden! En dat met een moeilijke situatie deze dag.',
        3: 'Gefeliciteerd! Je hield je weer aan je max! Zelfs met een moeilijke situatie deze dag.',
        4: 'Fantastisch! Mooi binnen je max! Dat ondanks een moeilijke situatie deze dag.',
        5: 'Goed gedaan! Je hield je goed aan je max. En dat met een moeilijke situatie.',
        6: 'Complimenten! Je zat weer binnen je max. En dat ondanks een moeilijke situatie.',
        7: 'Goed bezig! Je hield je prima aan je max. En dat met een moeilijke situatie deze dag!',
      },
      addToMessages: true,
      buttons: [
        {
          text: 'Sluiten',
          action: '',
        },
      ],
    },
    welcomeBack: {
      id: 7,
      title: 'Welkom',
      message: 'Welkom terug! Goed dat je er weer bent!',
      addToMessages: false,
      buttons: [
        {
          text: 'Sluiten',
          action: '',
        },
      ],
    },
    lastSevenLogs: {
      id: 8,
      title: 'Logboek Resultaten',
      message: {
        0: 'Als je je logboek invult krijg je goed zicht op je alcoholgebruik',
        99: 'Als je je logboek vaker invult dan krijg je goed zicht op je alcoholgebruik en krijg je feedback.',
      },
      addToMessages: true,
      buttons: [
        {
          text: 'Sluiten',
          role: 'cancel',
        },
      ],
    },
    maxxEvaluation: {
      id: 9,
      title: 'Evaluatie van Max',
      message:
        'Wat vind je van Maxx? Heb je er iets aan? Laat het ons weten via enkele vragen',
      addToMessages: false,
      buttons: [
        {
          text: 'Niet nu',
          action: '',
        },
        {
          text: 'Naar de vragenlijst',
          action: 'Survey',
          params: { questionnaireId: 36 },
        },
      ],
    },
    logbookNotReached: {
      id: 10,
      title: 'Opgeslagen',
      message: {
        0: 'De gegevens zijn succesvol opgeslagen',
        1: 'De gegevens zijn succesvol opgeslagen',
        2: 'Meer dan je dagdoel. Pak het weer op!',
        3: 'De gegevens zijn succesvol opgeslagen',
        4: 'De gegevens zijn succesvol opgeslagen',
        5: 'Meer dan je maxx. Maar geef niet op! Je kunt het!',
        6: 'De gegevens zijn succesvol opgeslagen',
        7: 'De gegevens zijn succesvol opgeslagen',
        8: 'Helaas je dagdoel niet gehaald…Morgen beter!',
        9: 'De gegevens zijn succesvol opgeslagen',
        10: 'De gegevens zijn succesvol opgeslagen',
        11: 'Oeps. Meer dan je dagdoel. Let op je max!',
        12: 'De gegevens zijn succesvol opgeslagen',
        13: 'De gegevens zijn succesvol opgeslagen',
        14: 'Jammer, meer dan je maxx. Volgende keer beter!',
      },
      addToMessages: false,
      buttons: [
        {
          text: 'Sluiten',
          action: '',
        },
      ],
    },
  };

  public feedbackStatus: any = {
    1: {
      send: false,
      lastSend: '',
      version: -1,
      sendAmount: 0,
    },
    2: {
      send: false,
      lastSend: '',
      version: 0,
      sendAmount: 0,
    },
    3: {
      send: false,
      lastSend: '',
      version: -1,
      sendAmount: 0,
    },
    4: {
      send: false,
      lastSend: '',
      version: -1,
      sendAmount: 0,
    },
    5: {
      send: false,
      lastSend: '',
      version: 0,
      sendAmount: 0,
      resend: true,
    },
    6: {
      send: false,
      lastSend: '',
      version: 0,
      sendAmount: 0,
      resend: true,
    },
    7: {
      send: false,
      lastSend: '',
      version: -1,
      sendAmount: 0,
    },
    8: {
      send: false,
      lastSend: '',
      version: -1,
      sendAmount: 0,
    },
    9: {
      send: false,
      lastSend: '',
      version: -1,
      sendAmount: 0,
    },
    10: {
      send: false,
      lastSend: '',
      version: 0,
      sendAmount: 0,
      resend: true,
    },
  };

  public weekEvaluationVersionStatus: any = {
    1: {
      version: 0,
      versionLetters: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    },
    2: {
      version: 0,
      versionLetters: ['a', 'b', 'c', 'd', 'e', 'f'],
    },
    3: {
      version: 0,
      versionLetters: ['a', 'b', 'c', 'd'],
    },
    4: {
      version: 0,
      versionLetters: ['a', 'b', 'c', 'd', 'e'],
    },
    5: {
      version: 0,
      versionLetters: ['a', 'b', 'c', 'd'],
    },
    6: {
      version: 0,
      versionLetters: ['a', 'b', 'c'],
    },
    7: {
      version: 0,
      versionLetters: ['a', 'b', 'c'],
    },
    8: {
      version: 0,
      versionLetters: ['a', 'b', 'c'],
    },
    9: {
      version: 0,
      versionLetters: ['a', 'b', 'c', 'd'],
    },
    10: {
      version: 0,
      versionLetters: ['a', 'b', 'c'],
    },
    11: {
      version: 0,
      versionLetters: ['a', 'b', 'c'],
    },
    12: {
      version: 0,
      versionLetters: ['a', 'b', 'c'],
    },
  };

  constructor(
    private settings: Settings,
    private apiGateway: ApiGateway,
    private cacheRequest: CacheRequest,
    private strategyProvider: StrategyProvider,
    public storage: StorageProvider,
    public userProvider: UserProvider,
    public alertController: AlertController,
    public infoProvider: InfoProvider,
    public rewardProvider: RewardProvider,
    private bmAnalytics: BoostMeAnalyticsProvider
  ) {
    this.rewardProvider.currentReward.subscribe((reward: any) => {
      this.currentReward = reward;
    });
  }

  public async postMessage(
    data: IMessage,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'messages.save';
    return new Promise<any>(async (observer: any) => {
      (
        await this.apiGateway.post(
          this.settings.apiEndpoint + method,
          {},
          data,
          hideLoader
        )
      ).subscribe(async () => {
        await this.fetchUnreadMessages(hideLoader);
      });
    });
  }

  public getMessages(hideLoader?: boolean): Promise<Observable<any>> {
    this.resetMessages(false);
    const method = 'messages.get';

    return this.apiGateway.get(
      this.settings.apiEndpoint + method,
      {},
      hideLoader
    );
  }

  public async deleteMessage(
    id: number,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    //this.resetMessages(false);
    let method = 'messages.delete';
    method += `&id=${id}`;

    return await this.apiGateway.get(
      this.settings.apiEndpoint + method,
      {},
      hideLoader
    );
  }

  public getUnreadMessages(hideLoader?: boolean): Observable<any> {
    return new Observable((observer: any) => {
      this.messageObserver = observer;
      this.fetchUnreadMessages(hideLoader);
    });
  }

  public addLocalMessage(type: number): void {
    if (this.messages && this.messages.hasOwnProperty('unread_count')) {
      this.messages.unread_count[type] = this.messages.unread_count[type] + 1;
      this.messageObserver.next(this.messages);
    }
  }

  public async fetchUnreadMessages(hideLoader?: boolean): Promise<void> {
    const method = 'messages.getunreadcount';
    (
      await this.apiGateway.get(
        this.settings.apiEndpoint + method,
        {},
        hideLoader
      )
    ).subscribe((data) => {
      let messageData: any;
      // If there are already messages, dont overwrite it but add the amount of unread messages
      if (this.messages) {
        for (const key in this.messages.unread_count) {
          if (data && data.unread_count[key]) {
            this.messages.unread_count[key] =
              this.messages.unread_count[key] + data.unread_count[key];
          }
        }
        messageData = this.messages;
      } else {
        messageData = data;
        this.messages = JSON.parse(JSON.stringify(data));
      }
      this.messageObserver.next(messageData);
    });
  }

  public resetMessages(resetAll?: boolean): void {
    if (resetAll) {
      this.messages = undefined;
    } else if (this.messages) {
      this.messages.unread_count[EMessageTypes.MESSAGES] = 0;
    }
  }

  private async newMessage(
    data: any,
    hideLoader?: boolean
  ): Promise<Observable<any>> {
    const method = 'messages.save';
    const a = await this.apiGateway.post(
      this.settings.apiEndpoint + method,
      {},
      data,
      hideLoader
    );
    return a;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public getInfo(): Promise<any> {
    return new Promise((resolve: any) => {
      this.strategyProvider.situations.subscribe((situations: ISituation[]) => {
        if (situations) {
          this.appData.todaySituations =
            situations.filter(
              (situation: ISituation) =>
                moment().startOf('day').format() ===
                moment(situation.date).startOf('day').format()
            ).length > 0;
        }
        Promise.all([
          this.userProvider.getRegistrationDate(),
          this.storage.getItem('drinking-goal'),
          this.storage.getItem('drinks-log'),
          this.storeFeedbackStatus(true),
          this.getWeekEvaluationVersionStatus(),
        ]).then((data: any) => {
          this.appData.registrationDate = moment(
            data[0],
            'MMMM, DD YYYY HH:mm:ss ZZ',
            'en'
          ).format();
          this.appData.goals = data[1];
          if (data[2] && data[2].length > 0) {
            // sort logs on date
            this.appData.logs = data[2]
              .filter((log: any) => !log.disabled)
              .sort((a: any, b: any) => {
                if (moment(a.date).isBefore(moment(b.date))) {
                  return -1;
                } else if (moment(a.date).isAfter(moment(b.date))) {
                  return 1;
                }
                return 0;
              });
          } else {
            this.appData.logs = [];
          }

          resolve();
        });
      });
    });
  }

  private getWeekEvaluationVersionStatus(fetch?: boolean): Promise<any> {
    return new Promise((resolve: any) => {
      this.storage.getItem('weekEvaluationVersionStatus').then((data: any) => {
        if (data) {
          //overwire local saved data with the new data in case a version number is added. Otherwise new added data never accessed
          Object.keys(data).map((key: string) => {
            data[key].versionLetters =
              this.weekEvaluationVersionStatus[7].versionLetters;
          });
          this.weekEvaluationVersionStatus = data;
        }
        resolve();
      });
    });
  }

  private storeFeedbackStatus(fetch?: boolean): Promise<any> {
    //this.storage.setItem('feedbackStatus', '');
    return new Promise((resolve: any) => {
      if (fetch) {
        this.storage.getItem('feedbackStatus').then((data: any) => {
          if (data) {
            // merge existing feedback status from storage to the default feedback status.
            // If an feedback status is added later, it prevents errors for missing data in existing storage feedback
            this.feedbackStatus = Object.keys(this.feedbackStatus).reduce(
              (list: any, current: string) => {
                const hasFeedbackInStorage = !!data[current];
                return {
                  ...list,
                  [current]: hasFeedbackInStorage
                    ? data[current]
                    : this.feedbackStatus[current],
                };
              },
              {}
            );
          } else {
            this.storage.setItem('feedbackStatus', this.feedbackStatus);
          }
          resolve();
        });
      } else {
        this.storage.setItem('feedbackStatus', this.feedbackStatus);
        resolve();
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public checkforFeedback(
    nav?: any,
    checkByInit?: boolean,
    dateToCheck?: string
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.getInfo().then(async () => {
        let title: string;
        let message: string;
        const hasGoals: boolean =
          this.appData.goals && this.appData.goals !== 'no-goals';
        let key: string;
        let id: number;
        const buttons: any[] = [];
        const today: any = moment().startOf('day').format(this.timeFormat);
        let lastLogs: any[];

        if (hasGoals && this.appData.logs.length > 7) {
          lastLogs = this.appData.logs.slice(
            Math.max(this.appData.logs.length - 8)
          );
          //get logs if date is between yesterday and 8 days ago, and if has drinkcount
          lastLogs = lastLogs.filter(
            (log: any) =>
              moment(log.date).isBefore(moment().startOf('day')) &&
              moment(log.date).isSameOrAfter(
                moment().startOf('day').subtract(8, 'days')
              ) &&
              log.hasOwnProperty('drinkCount')
          );

          // If not today is filled in, all logs are added so it has a length of 8. To prevent this, strip the last log away
          if (lastLogs.length > 7) {
            lastLogs.shift();
          }
        }

        // Check if the evaluation message has a sendamount before checking.
        if (!this.feedbackStatus['9'].hasOwnProperty('sendAmount')) {
          this.feedbackStatus['9'].sendAmount = 0;
        }

        // checks by opening of the app
        if (checkByInit) {
          //if no goals and two days rgistered
          if (
            !this.feedbackStatus['1'].send &&
            moment().isSameOrAfter(
              moment(this.appData.registrationDate).add(2, 'days')
            ) &&
            !hasGoals
          ) {
            key = 'noGoals';
          }
          // If 6 weeks after registration or survey not finished, message is 3 or less times send, and 3 days after last notification
          else if (
            (moment().isSameOrAfter(
              moment(this.appData.registrationDate).add(6, 'weeks')
            ) &&
              !this.feedbackStatus['9'].send) ||
            (moment().isSameOrAfter(
              moment(this.appData.registrationDate).add(6, 'weeks')
            ) &&
              this.feedbackStatus['9'].sendAmount <= 3 &&
              localStorage.getItem('surveyFinished_36') !== 'true' &&
              moment().isSameOrAfter(
                moment(this.feedbackStatus['9'].lastSend).add(3, 'days')
              ))
          ) {
            key = 'maxxEvaluation';
          }
          // if lastlogs exists, has goals, if today is after 7 days from last send
          else if (
            lastLogs &&
            (!this.feedbackStatus['8'].send ||
              moment().isAfter(
                moment(this.feedbackStatus['8'].lastSend).add(7, 'days')
              ))
          ) {
            key = 'lastSevenLogs';
          }
          // If 14 days after begin goal, has goals and at least 2 weeks after this message is last send
          else if (
            !this.feedbackStatus['2'].send &&
            hasGoals &&
            moment().isAfter(
              moment(this.appData.goals.startDate).add(14, 'days')
            ) &&
            (!this.feedbackStatus['2'].lastSend ||
              moment().isAfter(moment(this.feedbackStatus['2'].lastSend)))
          ) {
            key = 'goalsExpired';
          }
          // When user returns and the app not used for 5 days
          else if (
            moment()
              .startOf('day')
              .isAfter(
                moment(localStorage.getItem('activityDate')).add(5, 'days')
              )
          ) {
            key = 'welcomeBack';
          } else {
            resolve(false);
            return;
          }
        } else {
          const dateForFeedback: any = this.appData.logs.find(
            (log: any) =>
              moment(log.date).format(this.timeFormat) === dateToCheck
          );
          const dateForFeedbackHasDrinkcount = !!(
            dateForFeedback &&
            (dateForFeedback.drinkCount || dateForFeedback.drinkCount === 0)
          );
          const firstLog: any = this.appData.logs.length === 1;
          //First time logbook filled, has goals but goal not reached
          if (
            firstLog &&
            hasGoals &&
            dateForFeedbackHasDrinkcount &&
            dateForFeedback.drinkCount > dateForFeedback.goal
          ) {
            key = 'firstInputNotReached';
          } else if (
            firstLog &&
            hasGoals &&
            dateForFeedbackHasDrinkcount &&
            dateForFeedback.drinkCount <= dateForFeedback.goal
          ) {
            //First time logbook filled, has goals and goal reached
            key = 'firstInputReached';
          }
          //logbook filled, has goals and goal reached
          else if (
            hasGoals &&
            dateForFeedbackHasDrinkcount &&
            dateForFeedback.drinkCount <= dateForFeedback.goal
          ) {
            // check if there are situations planned today
            key = this.appData.todaySituations
              ? 'logbookAndReachedWithSituations'
              : 'logbookAndReached';
          }
          // logbook filled, has goals and goal not reached
          else if (
            hasGoals &&
            dateForFeedbackHasDrinkcount &&
            dateForFeedback.drinkCount > dateForFeedback.goal
          ) {
            key = 'logbookNotReached';
          } else {
            resolve(false);
            return;
          }
        }

        // Update status, fill title and message based on version and id
        // eslint-disable-next-line prefer-const
        id = this.feedback[key].id;

        // if there is feedback for logbook, stop this function and check for feedback from logbook
        if (key === 'lastSevenLogs') {
          this.feedbackStatus[id].lastSend = today;
          this.feedbackStatus[id].send = true;
          this.storeFeedbackStatus();
          this.getLogbookFeedback(lastLogs);
          resolve(false);
          return;
        }

        //if message is send or today is already send a message
        if (
          (this.feedbackStatus[id].send && key !== 'maxxEvaluation') ||
          today ===
            moment(this.feedbackStatus[id].lastSend)
              .startOf('day')
              .format(this.timeFormat)
        ) {
          resolve(false);
          return;
        }

        this.feedbackStatus[id].lastSend = today;
        // eslint-disable-next-line prefer-const
        title = this.feedback[key].title;
        this.feedback[key].buttons.forEach((button: any) => {
          let params: any = {};
          if (button.hasOwnProperty('params')) {
            params = button.params;
          }

          button = { ...button };
          if (!button.action) {
            button.role = 'cancel';
          } else {
            const link: string = button.action;
            button.handler = () => {
              nav.push(link, params);
            };
          }
          delete button.action;
          buttons.push(button);
        });

        if (this.feedbackStatus[id].version > -1) {
          message = this.feedback[key].message[this.feedbackStatus[id].version];
          this.feedbackStatus[id].version++;

          // If all versions are showed check if the message has to show again or not
          const allVersionsAreShowed: boolean =
            this.feedbackStatus[id].version >=
            Object.keys(this.feedback[key].message).length;

          // This variable is for the apps which status is already saved whithout the resend property
          const resendFeedback: boolean =
            allVersionsAreShowed &&
            (key === 'logbookAndReached' ||
              key === 'logbookAndReachedWithSituations');
          if (
            (allVersionsAreShowed &&
              this.feedbackStatus[id].hasOwnProperty('resend')) ||
            resendFeedback
          ) {
            this.feedbackStatus[id].version = 0;
          } else {
            this.feedbackStatus[id].send = allVersionsAreShowed;
          }
          this.feedbackStatus[id].send =
            this.feedbackStatus[id].version >=
            Object.keys(this.feedback[key].message).length;
        } else {
          message = this.feedback[key].message;
          this.feedbackStatus[id].send = true;
        }

        if (!this.feedbackStatus[id].hasOwnProperty('sendAmount')) {
          this.feedbackStatus[id]['sendAmount'] = 0;
        } else {
          this.feedbackStatus[id].sendAmount++;
        }
        //Only a few messages of id 10 are posted in messagebox
        if (id === 10 && message !== 'De gegevens zijn succesvol opgeslagen') {
          (
            await this.postMessage({
              title,
              content: message,
              type: 5,
            })
          ).subscribe();
        }
        // Send message
        if (this.feedback[key].addToMessages) {
          const listOfLogbookEntries: any[] = [4, 5, 6];
          let titleForMessageBox: string = title;
          let messageForMessageBox: string = message;
          if (listOfLogbookEntries.indexOf(id) > 0) {
            const date: any = moment(dateToCheck).format('D MMM YYYY');
            // titleForMessageBox = `<span class="thumb-icon"></span> ${title}`;
            titleForMessageBox = `<img class="thumb-icon" src="assets/img/thumb.svg"> ${title}`;
            messageForMessageBox = `${messageForMessageBox}<br><strong>${date}</strong>`;
          }

          (
            await this.postMessage({
              title: titleForMessageBox,
              content: messageForMessageBox,
              type: 5,
            })
          ).subscribe();
        }

        // Build and display feedback
        this.storeFeedbackStatus();
        const alert: any = this.alertController.create({
          header: title,
          message,
          buttons,
        });
        alert.present();
        alert.onDidDismiss((res: any) => {
          this.checkGoals(nav);
        });

        resolve(true);
      });
    }).catch((err) => {
      console.log('there is no feedback');
    });
  }

  get timeFormat(): string {
    return 'YYYY-MM-DDT00:00:00';
  }

  private getLogbookFeedback(lastLogs: any): void {
    let version: number;
    const logsAmount: number = lastLogs.length;
    let daysWithSuccess = 0;
    let daysWithNoSucces = 0;
    let noDrinkDays = 0;
    let maxDrinkAmount = 0;
    let minDrinkAmount = 5;
    const beginDate: any = moment().subtract(1, 'day').format('DD-MM-YYYY');
    const weekAgo: any = moment().subtract(7, 'days').format('DD-MM-YYYY');

    // double check if there are at least 7 logs.
    // since this is a weekly message, return if there are less than 8 logs
    if (this.appData.logs.length < 8) {
      return;
    }

    lastLogs.forEach((log: any) => {
      if (log.goal > -1 && log.drinkCount <= log.goal) {
        daysWithSuccess++;
        if (log.drinkCount === 0) {
          noDrinkDays++;
        }
      } else {
        daysWithNoSucces++;
      }

      maxDrinkAmount =
        log.drinkCount > maxDrinkAmount ? log.drinkCount : maxDrinkAmount;
      minDrinkAmount =
        log.drinkCount < minDrinkAmount ? log.drinkCount : minDrinkAmount;
    });
    const allDaySuccess: boolean =
      logsAmount > 1 && logsAmount === daysWithSuccess;
    const allDayUnSuccess: boolean =
      logsAmount > 1 && logsAmount === daysWithNoSucces;

    // with no logs
    if (logsAmount === 0) {
      version = 0;
    }
    // With just one log
    else if (logsAmount === 1) {
      version = 99;
    }
    // feedback when more succes than unsuccess
    else if (daysWithSuccess && daysWithSuccess >= daysWithNoSucces) {
      // All days are nodrinkdays
      if (noDrinkDays === logsAmount) {
        version = 1;
      }
      // Max drinks is 2 and all days success
      else if (maxDrinkAmount <= 2 && allDaySuccess) {
        version = 2;
      }
      // all days succes with a max drink of 3 or 4
      else if (
        allDaySuccess &&
        (maxDrinkAmount === 3 || maxDrinkAmount === 4)
      ) {
        version = 3;
      }
      // all succes but maxDrink is 5 or higher
      else if (allDaySuccess && maxDrinkAmount >= 5) {
        version = 4;
      }
      // maxDrink not more than 5
      else if (maxDrinkAmount < 5) {
        version = 5;
      }
      // maxDrink more or equil than 5
      else {
        version = 6;
      }
    }
    // more unsucess than success
    else {
      // Maxdrink not more then 2, at least 1 success and 2 unsuccess days
      if (
        maxDrinkAmount <= 2 &&
        daysWithSuccess >= 1 &&
        daysWithNoSucces >= 2
      ) {
        version = 7;
      }
      // Maxdrink less than 5, at least 1 success and 2 unsuccess days
      else if (
        maxDrinkAmount < 5 &&
        daysWithSuccess >= 1 &&
        daysWithNoSucces >= 2
      ) {
        version = 8;
      }
      // mindrink is less than 5, Maxdrink is more than 5, at least 1 success and 2 unsuccess days
      else if (
        minDrinkAmount < 5 &&
        maxDrinkAmount >= 5 &&
        daysWithSuccess >= 1 &&
        daysWithNoSucces >= 2
      ) {
        version = 9;
      }
      // maxdrink is less than 5, no successfull days
      else if (maxDrinkAmount < 5 && allDayUnSuccess) {
        version = 10;
      } else if (minDrinkAmount < 5 && maxDrinkAmount >= 5 && allDayUnSuccess) {
        version = 11;
      }
      // all days 5 or more and no success
      else if (minDrinkAmount >= 5 && allDayUnSuccess) {
        version = 12;
      } else {
        return;
      }
    }

    if (version === 0 || version === 99) {
      const alert: any = this.alertController.create({
        header: this.feedback['lastSevenLogs'].title,
        message: this.feedback['lastSevenLogs'].message[version],
        buttons: this.feedback['lastSevenLogs'].buttons,
        cssClass: 'logbook-feedback',
      });
      alert.present();
    } else {
      let versionCounter: number =
        this.weekEvaluationVersionStatus[version].version;
      // Add one for getting the right letter based on the versionCounter. Ie 5 is the first feedback and 5A the second
      const versionLetters: any = [
        '',
        ...this.weekEvaluationVersionStatus[version].versionLetters,
      ];
      if (versionCounter > versionLetters.length - 1) {
        versionCounter = 0;
      }
      // getting the right letter based on the versioncounter
      const finalVersionNumber: string =
        versionCounter > 0
          ? version.toString() + versionLetters[versionCounter].toUpperCase()
          : version.toString();
      const logbookCode: string = 'LOGBOEK_' + finalVersionNumber;
      this.infoProvider
        .getInfo(logbookCode)
        .subscribe(async (textData: any) => {
          if (textData) {
            const feedbackText: string = textData.content;
            const message = `
					Afgelopen week (${weekAgo} t/m ${beginDate}) heb je ${logsAmount} keer je logboek ingevuld.
					<div class="divider"></div>
					${feedbackText} `;

            const alert: any = this.alertController.create({
              header: this.feedback['lastSevenLogs'].title,
              message,
              buttons: this.feedback['lastSevenLogs'].buttons,
              cssClass: 'logbook-feedback',
            });
            alert.present();

            // Send message
            if (this.feedback['lastSevenLogs'].addToMessages) {
              (
                await this.postMessage({
                  title: this.feedback['lastSevenLogs'].title,
                  content: message.replace('<div class="divider"></div>', ''),
                  type: 5,
                })
              ).subscribe();
            }
          }
        });
      //Save new version
      versionCounter++;
      this.weekEvaluationVersionStatus[version].version = versionCounter;
      this.storage.setItem(
        'weekEvaluationVersionStatus',
        this.weekEvaluationVersionStatus
      );
      //send to anallytics
      this.bmAnalytics.track({ name: 'WEEKLOG', value: finalVersionNumber });
    }
  }

  public async checkGoals(nav: any): Promise<void> {
    const todayLog: any = JSON.parse(localStorage.getItem('lastLog'));
    if (!todayLog) {
      return;
    }
    const logdate: any = todayLog.date;

    // if there is no reward, or its already finished, break
    if (!this.currentReward || this.currentReward.finished === true) {
      return;
    }
    let successmessage = `Je verdient je beloning want je hebt ${
      this.currentReward.totalDaysUntilGoal
    } ${this.currentReward.totalDaysUntilGoal === '1' ? 'dag' : 'dagen'} `;

    // if date is before reward date, break
    if (moment(logdate).isBefore(this.currentReward.beginDate)) {
      return;
    }

    let hasReachedGoal: boolean;
    if (this.currentReward.goal === 'no-drinks') {
      hasReachedGoal = todayLog.drinkCount === 0;
      successmessage += 'geen alcohol gedronken.';
    } else if (this.currentReward.goal === 'goal-reached') {
      hasReachedGoal = todayLog.drinkCount <= todayLog.goal;
      successmessage += 'je dagdoel gehaald.';
    } else if (this.currentReward.goal === 'logbook-filled') {
      hasReachedGoal = true;
      successmessage += 'je logboek ingevuld.';
    }

    if (hasReachedGoal) {
      const newDaysOfReachedGoals: number =
        // eslint-disable-next-line radix
        parseInt(this.currentReward.daysReached) - 1;
      if (newDaysOfReachedGoals === 0) {
        this.currentReward.finished = true;

        const messageText: string =
          successmessage +
          ` Je beloning: ${this.currentReward.rewardName.label}`;

        const alert = await this.alertController.create({
          header: 'Gefeliciteerd!',
          message: messageText,
          buttons: [
            {
              text: 'Naar je beloning',
              handler: () => {
                nav.push('reward-yourself');
              },
            },
            {
              text: 'Sluiten',
              role: 'cancel',
            },
          ],
        });
        alert.present();

        (
          await this.postMessage({
            title: 'Gefeliciteerd!',
            content:
              (successmessage += `<br>Je hebt hiermee de volgende beloning verdiend: ${this.currentReward.rewardName.label}`),
            type: 5,
          })
        ).subscribe();
      }
      this.currentReward.daysReached = newDaysOfReachedGoals.toString();
      this.rewardProvider.updateReward(this.currentReward);
    }
  }
}
