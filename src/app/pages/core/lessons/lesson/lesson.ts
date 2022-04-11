import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Modal, Slides} from 'ionic-angular';

import { Keyboard } from '@ionic-native/keyboard';

import { StorageProvider } from '../../../../providers/utilities/storage-provider';

import { LessonProvider, ILesson, ILessonPage, ILessonPageBlock } from '../../../../providers/lesson-provider';
import { FavoriteProvider } from '../../../../providers/favorite-provider';
import { SessionProvider } from '../../../../providers/session-provider';
import { BoostMeAnalyticsProvider } from '../../../../providers/boost-me-analytics-provider';
import { PodcastProvider } from '../../../../providers/podcast-provider';

@IonicPage({
    name: 'Lesson',
    segment: 'lesson/:id/:getAnswers'
})
@Component({
    selector: 'page-lesson',
    templateUrl: 'lesson.html',
    host: {
        class: 'coloured-background coloured-background--yellow'
    }
})
export class Lesson {
    private replaceObject: any[] = [];
    private originalLesson: ILesson;
    private lessonCompletedCounters: any;

    @ViewChild(Slides) slider: Slides;
    public initialSlideIndex: number = 0;

    public continuePage: string = this.navParams.get('continuePage');
    public getAnswers: boolean = this.navParams.get('getAnswers') === 'false'
        ? false
        : true;
    public continuePageParams: any = JSON.parse(
        this.navParams.get('continuePageParams') || '{}'
    );
    public lessonId: number = parseInt(this.navParams.get('id'));
    public pageId: number = parseInt(this.navParams.get('pageId'));
    public isLessonLoaded: boolean = false;
    public lesson: ILesson;
    public answers: any = {};
    public showExplanationIcon: boolean = false;
    public answersCanBeDeleted: boolean = false;

    constructor(
        private nav: NavController,
        private navParams: NavParams,
        private modalController: ModalController,
        private keyboard: Keyboard,
        private storage: StorageProvider,
        private lessonProvider: LessonProvider,
        private favoriteProvider: FavoriteProvider,
        private sessionProvider: SessionProvider,
        private bmAnalytics: BoostMeAnalyticsProvider,
        private podcastProvider: PodcastProvider
    ){
        this.storage
            .getItem('lesson-completed-counter')
            .then((storageData: any) => {
                this.lessonCompletedCounters = storageData || {};

                this.lessonProvider.lessons.subscribe(
                    (data: ILesson[]) => {
                        if (data) {
                            this.isLessonLoaded = true;
                            this.lesson = data.find(
                                (lesson: any) => lesson.id === this.lessonId
                            );
                            if (this.lessonId === 370) {
                                this.showExplanationIcon = true;
                            }

                            this.lesson.pages.forEach((page: any) => {
                                page.pageblocks.sort((a: any, b: any) => {
                                    if (a.rank < b.rank) {
                                        return -1;
                                    }
                                    if (a.rank > b.rank) {
                                        return 1;
                                    }
                                    return 0;
                                });
                            });
                            this.lesson.pages.sort((a: any, b: any) => {
                                if (a.rank < b.rank) {
                                    return -1;
                                }
                                if (a.rank > b.rank) {
                                    return 1;
                                }
                                return 0;
                            });

                            if (this.pageId) {
                                if (this.pageId === 99999999999) {
                                    this.initialSlideIndex =
                                        this.lesson.pages.length - 1;
                                } else {
                                    this.initialSlideIndex = this.lesson.pages.findIndex(
                                        (page: ILessonPage) =>
                                            page.id === this.pageId
                                    );
                                }
                            }

                            this.originalLesson = JSON.parse(
                                JSON.stringify(this.lesson)
                            );

                            this.lesson.pages.forEach((page: any) => {
                                page.pageblocks.forEach((pageblock: any) => {
                                    if (
                                        pageblock.title &&
                                        pageblock.title.substr(0, 1) === '_'
                                    ) {
                                        this.addReplaceItem(
                                            '[' +
                                                pageblock.title.slice(1) +
                                                ']',
                                            ''
                                        );
                                    }
                                });
                            });

                            for (let key in this.answers) {
                                if (
                                    this.answers.hasOwnProperty(key) &&
                                    isNaN(parseInt(key))
                                ) {
                                    this.addReplaceItem(
                                        '[' + key + ']',
                                        this.answers[key]
                                    );
                                }
                            }
                        }
                    },
                    (error: any) => {
                        console.log('error', error);
                    }
                );
            });
    }

    ionViewWillEnter(): void {
        if (this.lessonId == 370) {
            this.answersCanBeDeleted = true;
        }
        if (this.getAnswers) {
            this.storage.getItem('lesson-answers').then((storageData: any) => {
                if (storageData) {
                    this.answers = storageData;
                }
            });
        } else {
            this.answers = {};
        }
    }

    ionViewDidEnter(): void {
        this.bmAnalytics.track({ name: 'EXERCISE_CHOSEN', value: this.lessonId });

        // Wait for sessionProvider to be ready
        let timeout: number = 500;
        let interval: number = setInterval(() => {
            if (this.sessionProvider.isReady() || timeout <= 0) {
                if (this.sessionProvider.getCurrent()) {
                    this.sessionProvider.getCurrent().lessonId = this.lessonId;
                }
                this.sessionProvider.saveChanges();
                clearInterval(interval);
            }
            timeout--;
        });
    }

    public hasExercise(page: ILessonPage): boolean {
        return !!page.pageblocks.find(
            (pageblock: ILessonPageBlock) =>
                pageblock.component !== 'PageComponent'
        );
    }

    public openPageExtension(page: any): void {
        let modal: Modal = this.modalController.create('LessonExtension', {
            page: page
        });
        modal.present();
        this.bmAnalytics.track({ name: 'TEVEEL_EXAMPLE' });
    }

    public onSlideWillChange(event: any): void {
        this.podcastProvider.stop();
        if (this.slider.isEnd()) {
            this.bmAnalytics.track({ name: 'EXERCISE_END', value: this.lessonId });
        }

        this.keyboard.hide();
    }

    public onSlideDidChange(event: any): void {
        this.storage.setItem('lesson-answers', this.answers);
    }

    public onValueChange(key: string, value: any): void {
        if (key && key.substr(0, 1) === '_') {
            this.answers[key.slice(1)] = value;
            this.addReplaceItem('[' + key.slice(1) + ']', value);
        }
    }

    public addReplaceItem(key: string, value: any): void {
        let item: any = this.replaceObject.find(
            (object: any) => object.key === key
        );
        if (item) {
            item.value = value;
        } else {
            this.replaceObject.push({
                key: key,
                value: value,
                regex: key.replace('[', '\\[').replace(']', '\\]')
            });
        }

        this.originalLesson.pages.forEach((page: any) => {
            page.pageblocks.forEach((pageblock: any) => {
                let lessonPage: any = this.lesson.pages.find(
                    (item: any) => item.id === page.id
                );
                let lessonPageblock: any = lessonPage.pageblocks.find(
                    (item: any) => item.id === pageblock.id
                );

                lessonPageblock.title = this.replaceString(pageblock.title);
                lessonPageblock.content = this.replaceString(pageblock.content);
            });
        });
    }

    public replaceString(text: string): string {
        let regex: RegExp = new RegExp(
            this.replaceObject.map((item: any) => item.regex).join('|'),
            'gi'
        );
        return text.replace(regex, (matched: string) => {
            let match: any = this.replaceObject.find(
                (item: any) => item.key === matched
            );
            if (match) {
                return match.value || '-';
            }
            return '-'; //match.key;
        });
    }

    public deleteAnswers(): void {
        for (let key in this.answers) {
            this.answers[key].inputs = [];
        }
        this.storage.setItem('lesson-answers', this.answers);
    }

    public startPodcast(podcastId: number): void {
        let analyticsLabels: any = {
            24: 'STRESS_ADEM_START',
            28: 'STRESS_SPIER_START'
        }
        this.bmAnalytics.track({ name: analyticsLabels[podcastId] });
    }

    public finish(): void {
        this.storage.setItem('lesson-answers', this.answers);
        if (this.slider.length() === 1) {
            this.bmAnalytics.track({ name: 'EXERCISE_END', value: this.lessonId });
        }

        if (!this.lessonCompletedCounters[this.lessonId]) {
            this.lessonCompletedCounters[this.lessonId] = 0;
        }
        this.lessonCompletedCounters[this.lessonId]++;
        this.storage.setItem(
            'lesson-completed-counter',
            this.lessonCompletedCounters
        );

        this.nav.pop();
    }
}
