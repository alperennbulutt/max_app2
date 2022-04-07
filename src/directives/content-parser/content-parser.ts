import {Input, Directive, ElementRef } from '@angular/core';
import { WebPopup } from '../../providers/utilities/web-popup';

@Directive({
	selector: '[contentParser]'
})
export class ContentParserDirective {
	public _content: string;
	public tag = '[code]='

	@Input()
	get content(): any {
		return this._content;
	}
	set content(value: any) {
		if (value) {
			this._content = value;
			this.el.nativeElement.innerHTML = this._content;
			this.parseLinks();
		}
	}
	constructor(
		private el: ElementRef,
		private webPopup: WebPopup
	) {}

	ngOnInit() {
		if (this.el.nativeElement.innerHTML) {
			this.parseLinks();
		}
	}

	public parseLinks(): void {
		let links: Element[] = Array.from(this.el.nativeElement.getElementsByTagName('a'));
		links.forEach((link: Element) => {
			let location: string;
			if (link.hasAttribute('href')) {
				location = link.getAttribute('href');
			} else {
				location = link.innerHTML;
				location = location.replace('www', 'http://www');
			}
			link.addEventListener('click', (e) => {
				e.preventDefault();
				this.webPopup.open(location);
			});
		});
	}
}