/********************************************
 * Default configuration for some providers *
 ********************************************/


import { Injectable } from '@angular/core';

@Injectable()
export class Config {

	public readonly image: any = {
		width: 400,
		height: 400
	};
}
