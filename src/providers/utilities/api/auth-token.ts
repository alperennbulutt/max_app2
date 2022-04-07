import { Injectable } from '@angular/core';

@Injectable()
export class AuthToken {
	private key: string = 'auth-token';
	private userIdKey: string = 'userId';

	constructor() {}

	/**
	 * Get token for Authorization
	 * @return string [description]
	 */
	public getToken(): string {
		return localStorage.getItem(this.key);
	}

	/**
	 * Set or remove token for Authorization
	 * @param {string} token [description]
	 */
	public setToken(token?: string): void {
		if (token) {
			localStorage.setItem(this.key, token);
		} else {
			localStorage.removeItem(this.key);
		}
	}

	/**
	 * Set a user-unique key for storage
	 * @return string - User-unique key
	 */
	public getUserId(): string {
		return (localStorage.getItem(this.userIdKey) || '-1');
	}

	/**
	 * Set a user-unique key for storage
	 * @return string - User-unique key
	 */
	public setUserId(id?: number): void {
		if (id) {
			localStorage.setItem(this.userIdKey, '' + id);
		} else {
			localStorage.removeItem(this.userIdKey);
		}
	}
}
