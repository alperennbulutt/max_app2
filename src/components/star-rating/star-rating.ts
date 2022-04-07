import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'star-rating',
	templateUrl: 'star-rating.html'
})
export class StarRating {
	@Input() edit: boolean = true;
	@Input() rating: number = 0;
	@Output() ratingChange: any = new EventEmitter();

	constructor(
	) {}

	public rate(rating: number): void {
		if (this.edit === true) {
			this.rating = rating;
			this.ratingChange.emit(this.rating);
		}
	}
}