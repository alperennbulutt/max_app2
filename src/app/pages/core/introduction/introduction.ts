import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { InfoProvider } from '../../../providers/info-provider';

@IonicPage({
	name: 'IntroductionPage',
	segment: 'IntroductionPage/:fromMenu'
})
@Component({
	selector: 'page-introduction',
		templateUrl: 'introduction.html',
	host: {
		'class': 'coloured-background one-page'
	}
})
export class IntroductionPage {
	public fromMenu: boolean = this.navParams.get('fromMenu') === 'true' ? true : false;
	public introductionSlides: any[] = [
		{
			title: 'Home',
			text: 'Maxx ondersteunt je bij het stoppen of minderen met het drinken van alcohol.',
			image: 'assets/img/home.PNG'
		},
		{
			title: 'Doelen',
			text: 'Doelen stellen geeft je houvast en richting. Wat wordt jouw max per dag?',
			image: 'assets/img/doelen.PNG'
		},
		{
			title: 'Logboek',
			text: 'Houd bij hoeveel je drinkt. Zo zie je hoe het gaat en krijg je van Maxx feedback en advies.',
			image: 'assets/img/logbook.PNG'
		},
		{
			title: 'Moeilijke situaties',
			text: 'Maxx helpt je om jouw moeilijke situaties aan te pakken en geeft je een herinnering als jij dat wilt. Je kunt ook bijhouden hoe succesvol je was.',
			image: 'assets/img/moeilijke-momenten.PNG'
		},
		{
			title: 'Hoe vol omdat...',
			text: 'Heb je het even lastig? Dan laat Maxx je zien waarom jij je alcoholgebruik wilt aanpakken! Kies jouw favoriete motivatie-kaartjes of maak er zelf één.',
			image: 'assets/img/motivators.PNG'
		},
		{
			title: 'Hoe?',
			text: 'Maxx helpt je met praktische oefeningen, testjes en tips om je aan je max te houden, bijvoorbeeld over het omgaan met stress en terugval.',
			image: 'assets/img/hoe.PNG'
		},
		{
			title: 'Berichten',
			text: 'Maxx laat je weten hoe je het doet, moedigt je aan en geeft je tips.',
			image: 'assets/img/berichten.png'
		}
	];

	constructor(
		private navParams: NavParams,
		private InfoProvider: InfoProvider
	) {
	}
}
