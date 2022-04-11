import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';

@IonicPage({
	name: 'LessonExtension',
	segment: 'lesson-extension'
})
@Component({
	selector: 'page-lesson-extension',
	templateUrl: 'lesson-extension.html',
	host: {
		'class': 'coloured-background coloured-background--yellow'
	}
})
export class LessonExtension {
	public editable: Boolean = false;
	public textareaExample: any = [
		{
			label: '1. Waar het gebeurde',
			example: 'Verjaardagsfeestje'
		},
		{
			label: '2. Met wie',
			example: 'Vrienden en kennissen van de jarige'
		},
		{
			label: '3. Hoe je je voelde',
			example: 'Onzeker en gespannen'
		},
		{
			label: '4. Wat dacht je waardoor je ging drinken?',
			example: 'Het is niet gezellig als ik niet meedrink. Met anderen praten is makkelijker als ik gedronken heb'
		},
		{
			label: '5. Gevolg, wat deed je?',
			example: 'Ik begon met één wijntje en dronk vervolgens meer dan ik had gepland'
		},
		{
			label: '6. Wat doe, denk of zeg je een volgende keer?',
			example: 'Ik drink helemaal geen alcohol, want als ik eenmaal begin kan ik niet ophouden. Ik kan heus wel met anderen praten zonder alcohol.'
		},
	];

	constructor(
		private view: ViewController,
		private navParams: NavParams,
	) {
	}

	public close(): void {
		this.view.dismiss();
	}
}
