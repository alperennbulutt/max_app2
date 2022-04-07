import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'pagecomponent',
	templateUrl: 'pagecomponent.html'
})
export class PageComponent {
	@Input() pageContent: any;
	@Output() onPodcastStart: EventEmitter<any> = new EventEmitter;

	constructor(

	) {}

	public startPodcast(podcast): void {
		this.onPodcastStart.emit(podcast.audio_id);
	}
}
