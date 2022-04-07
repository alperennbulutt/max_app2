/**********************************************
 * Requires:                                  *
 * - 'moment' module                          *
 **********************************************/


import { Pipe, Injectable } from '@angular/core';
import moment from 'moment';

@Pipe({
	name: 'moment'
})
@Injectable()
export class PipeMoment {

	transform(value: (moment.Moment | string), args?: any): string {
		return moment.parseZone(value || null).format(args || 'D MMMM YYYY');
	}
}
