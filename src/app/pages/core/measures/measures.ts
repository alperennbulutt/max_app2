import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

interface IMeasure {
	image: string;
	key: string;
	volume: number;
	alcohol: number;
	standard: number;
}

@IonicPage()
@Component({
	selector: 'page-measures',
	templateUrl: 'measures.html',
	host: {
		'class': 'coloured-background'
	}
})
export class Measures {
	public measures: IMeasure[] = [
		{
			image: 'assets/img/measures/beer-glass.svg',
			key: 'beer-glass',
			volume: 25,
			alcohol: 5,
			standard: 1
		}, {
			image: 'assets/img/measures/beer-pint.svg',
			key: 'beer-pint',
			volume: 50,
			alcohol: 5,
			standard: 2
		}, {
			image: 'assets/img/measures/beer-can.svg',
			key: 'beer-can',
			volume: 33,
			alcohol: 5,
			standard: 1.3
		}, {
			image: 'assets/img/measures/beer-bottle.svg',
			key: 'beer-bottle',
			volume: 33,
			alcohol: 5,
			standard: 1.3
		}, {
			image: 'assets/img/measures/beer-bottle-light.svg',
			key: 'beer-bottle-light',
			volume: 33,
			alcohol: 2.5,
			standard: 0.7
		}, {
			image: 'assets/img/measures/wine-glass.svg',
			key: 'wine-glass',
			volume: 10,
			alcohol: 12,
			standard: 1
		}, {
			image: 'assets/img/measures/wine-bottle.svg',
			key: 'wine-bottle',
			volume: 75,
			alcohol: 12,
			standard: 7
		}, {
			image: 'assets/img/measures/sherry-glass.svg',
			key: 'sherry-glass',
			volume: 5,
			alcohol: 15,
			standard: 1
		}, {
			image: 'assets/img/measures/mix-bottle.svg',
			key: 'mix-bottle',
			volume: 33,
			alcohol: 4,
			standard: 1
		}, {
			image: 'assets/img/measures/distilled-glass.svg',
			key: 'distilled-glass',
			volume: 3.5,
			alcohol: 35,
			standard: 1
		}, {
			image: 'assets/img/measures/distilled-bottle.svg',
			key: 'distilled-bottle',
			volume: 100,
			alcohol: 35,
			standard: 28.5
		}, {
			image: 'assets/img/measures/mix-glass2.svg',
			key: 'mix-glass2',
			volume: 25,
			alcohol: 5,
			standard: 1
		}, {
			image: 'assets/img/measures/flugel.png',
			key: 'flugel',
			volume: 2,
			alcohol: 10,
			standard: 0.3
		}
	];

	constructor(
		private view: ViewController
	) {}

	public close(): void {
		this.view.dismiss();
	}
}