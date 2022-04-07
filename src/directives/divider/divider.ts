import {Input, Directive, Renderer2, ElementRef } from '@angular/core';

@Directive({
	selector: '[divider]'
})
export class DividerDirective {
	@Input() gaps: number = 1;
	@Input() nospace: boolean = false;
	constructor(
		private renderer: Renderer2,
		private el: ElementRef
	) {}

	ngOnInit() {
		this.renderer.addClass(this.el.nativeElement, 'divider');
		this.renderer.addClass(this.el.nativeElement, 'gaps--' + this.gaps);
		if (this.nospace) {
			this.renderer.addClass(this.el.nativeElement, 'no-space');
		}
		for (let i: number = 0; i < this.gaps; i++) {
			let gap: any = this.renderer.createElement('div');
			this.renderer.addClass(gap, 'gap');
			let divInner: any = this.renderer.createElement('div');
			this.renderer.appendChild(this.el.nativeElement, gap);
			this.renderer.appendChild(gap, divInner);
		}
	}
}