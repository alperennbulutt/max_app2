import { Injectable } from '@angular/core';

import { StorageProvider } from './utilities/storage-provider';

@Injectable()
export class ProgressProvider {
	private storageKey: string = 'progress_';
	private currentProgress: string = localStorage.getItem(this.storageKey + this.storage.getUserId());

	constructor(
		private storage: StorageProvider,
	) {}

	public getCurrentProgress(): string {
		return this.currentProgress || 'IntroLetsMeet';
	}

	public setCurrentProgress(value: string): void {
		// Don't update progress after 'Tabs'-page is reached
		if (this.currentProgress !== 'Tabs') {
			this.currentProgress = value;
			localStorage.setItem(this.storageKey + this.storage.getUserId(), this.currentProgress);
		}
	}

	public resetCurrentProgress(): void {
		this.currentProgress = 'IntroLetsMeet';
		localStorage.setItem(this.storageKey + this.storage.getUserId(), this.currentProgress);
	}
}
