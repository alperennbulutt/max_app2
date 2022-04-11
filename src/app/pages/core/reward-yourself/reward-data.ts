export const defaultRewardOptions: any = [
	{
		id: 1,
		label: 'Iets lekkers kopen'
	},
	{
		id: 2,
		label: 'Tijdschrift kopen'
	},
	{
		id: 3,
		label: 'Bloemetje kopen'
	},
	{
		id: 4,
		label: 'Naar de film'
	},
	{
		id: 5,
		label: 'Kleding kopen'
	},
	{
		id: 6,
		label: 'Uit eten'
	},
	{
		id: 7,
		label: 'Uitstapje maken'
	},
	{
		id: 8,
		label: 'Weekendje weg'
	},
];

export const goalOptions: any[] = [
	{
		id: 1,
		value: 'no-drinks',
		label: 'Als ik een aantal dagen geen alcohol heb gedronken',
		selected: true
	},
	{
		id: 2,
		value: 'goal-reached',
		label: 'Als ik een aantal dagen mijn dagdoel heb gehaald',
		selected: false
	},
	{
		id: 3,
		value: 'logbook-filled',
		label: 'Als ik een aantal dagen mijn logboek heb ingevuld',
		selected: false
	}
];

export const imagePicker: any[] = [
	{
		introText: '',
		showPreview: false,
		type: 'imagePicker',
		defaultImages: 'rewards',
		storageImages: 'rewards'
	}
];

export const introTexts: string[] = [
	'Een beloning voor je successen of inspanningen helpt je bij het minderen of stoppen. Hiermee hou je het beter vol! Bedenk wanneer jij een beloning verdient.',
	'Een beloning voor je successen of inspanningen helpt je bij het minderen of stoppen. Hiermee hou je het beter vol! Bedenk wanneer jij een beloning verdient.',
	'Hier staat jouw aangemaakte beloning. Vul dagelijks je logboek in en je krijgt bericht wanneer je je beloning hebt verdiend.',
];

export const goalTexts: any = {
	'no-drinks': {
		goalText: '[x] dagen geen alcohol drinken',
		countdownText: 'Nog [x] dagen geen alcohol drinken om je beloning te verdienen',
		finished: 'Gefeliciteerd! Je hebt [x] dagen geen alcohol gedronken.'
	},
	'goal-reached': {
		goalText: '[x] dagen het dagdoel halen',
		countdownText: 'Nog [x] dagen je dagdoel halen om je beloning te verdienen.',
		finished: 'Gefeliciteerd! Je hebt [x] dagen je dagdoel te gehaald.'
	},
	'logbook-filled': {
		goalText: '[x] dagen het logboek invullen',
		countdownText: 'Nog [x] dagen je logboek invullen om je beloning te verdienen.',
		finished: 'Gefeliciteerd! Je hebt [x] dagen je logboek ingevuld.'
	}
};