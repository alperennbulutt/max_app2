import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
	selector: 'slide-down',
	templateUrl: 'slide-down.html',
	animations: [
		trigger('slideDown', [
			transition(':enter', [
				style({ height: 0 }),
				animate(300, style({ height: '*' }))
			]),
			transition(':leave', [
				style({ height: '*' }),
				animate(300, style({ height: 0 }))
			])
		])
	]
})
export class SlideDown {
	public isOpen: boolean = false;
	@Input() title: string;
	@Input() hidden: string;
	@Input() forceToOpen: boolean = true;
	@Output() onOpen: EventEmitter<any> = new EventEmitter<any>();

	public toggle(): void {
		this.isOpen = !this.isOpen;
		if (this.isOpen) {
			this.onOpen.emit();
		}
	}
}
