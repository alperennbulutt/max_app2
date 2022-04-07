import { Injectable } from '@angular/core';

export const Permissions: any = {
	unauthorized: 0,
	control: 1,
	normal: 2,
};

@Injectable()
export class AuthorizationProvider {
	private urlPermissions: any = {
		'Intro':						Permissions.unauthorized,
		'Login':						Permissions.unauthorized,
		'PasswordForgot':				Permissions.unauthorized,
		'Faq':							Permissions.unauthorized,
		'About':						Permissions.unauthorized,
		'AboutResearch':				Permissions.unauthorized,
		'Info':							Permissions.unauthorized,

		'Favorites':					Permissions.normal,
		'LessonExtension':				Permissions.normal,
		'Lesson':						Permissions.normal,
		'Lessons':						Permissions.normal,
		'Log':							Permissions.control,
		'Profile':						Permissions.control,
		'ChartPage':					Permissions.normal,
		'TabsPage':						Permissions.control,
		'IntroLetsMeet':				Permissions.normal,
		'IntroStartPoint':				Permissions.unauthorized,
		'IntroStartPointFeedback':		Permissions.unauthorized,
		'IntroStartPointOverview':		Permissions.unauthorized,
		'IntroStartPointSituations':	Permissions.unauthorized,
		'Measures':						Permissions.unauthorized,
		'Survey':						Permissions.unauthorized,

		'ModuleIntro':					Permissions.normal,
		'ModuleOutro':					Permissions.normal,
		'ModuleExercises':				Permissions.normal,
		'ModuleSelect':					Permissions.normal,
		'ModulePlanningIntro':			Permissions.normal,
		'ModulePlanningGoal':			Permissions.normal,
		'ModuleRelapseIntro':			Permissions.normal,
	};
	private userPermission: number = JSON.parse(localStorage.getItem('permission')) || Permissions.control;

	constructor() {}

	public setPermission(permission: number): void {
		this.userPermission = permission;
		localStorage.setItem('permission', JSON.stringify(permission));
	}

	public getPermission(): number {
		return this.userPermission;
	}

	public isPageAuthorized(page: string): boolean {
		if (!this.urlPermissions.hasOwnProperty(page)) {
			return true;
		}
		return this.urlPermissions[page] <= this.userPermission;
	}
}
