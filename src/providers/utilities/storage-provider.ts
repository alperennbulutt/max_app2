/*****************************
 * Requires:                 *
 * - `@ionic/storage` module *
 *****************************/


import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageProvider {
	private userIdKey: string = 'userId';

	constructor(
		private storage: Storage,
	) {}

	/**
	 * Get a user-unique key for storage
	 * @return string - User-unique key
	 */
	public getUserId(): string {
		return (localStorage.getItem(this.userIdKey) || '-1');
	}

	/**
	* Invalidate Cache
	* @returns {Promise<any>}
	*/
	public cacheInvalidate(): Promise<any> {
		return this.storage.clear();
	}

	/**
	* Get Cached Item
	* @param {string} name - Key name of item from store
	* @returns {Promise<any>}
	*/
	public getItem(name: string): Promise<any> {
		let userId: any = this.getUserId();

		return new Promise((resolve: any, reject: any) => {
			this.storage.get(name + '_' + userId).then((cachedResult: string) => {
				if (cachedResult) {
					let data: any = JSON.parse(cachedResult);
					resolve(data.data);
				} else {
					resolve(undefined);
				}
			}).catch((err: any) => reject(err));
		});
	}

	/**
	* Set Cached Item
	* @param {string} name - Key name of item to store
	* @param {any} data - Value of data to store
	* @returns {Promise<any>}
	*/
	public setItem(name: string, data: any): Promise<any> {
		let userId: any = this.getUserId();

		let value: string = JSON.stringify({ data: data });
		return this.storage.set(name + '_' + userId, value);
	}

	/**
	* Delete Cached Item
	* @param {string} name - Key name of item to delete
	* @returns {Promise<any>}
	*/
	public deleteItem(name: string): Promise<any> {
		let userId: any = this.getUserId();

		return this.storage.remove(name + '_' + userId);
	}
}
