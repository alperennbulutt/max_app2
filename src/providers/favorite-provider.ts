import { Injectable } from '@angular/core';

import { StorageProvider } from './utilities/storage-provider';

export interface IFavorite {
	title: string;
	subtitle: string;
	lessonId: number;
	pageId: number;
	isFavorite?: boolean;
	clickCount?: number;
}

@Injectable()
export class FavoriteProvider {
	private storageKey: string = 'favorites';
	private favorites: IFavorite[] = [];
	private ready: boolean;

	constructor(
		private storage: StorageProvider,
	) {
		this.storage.getItem(this.storageKey).then((storageData: IFavorite[]) => {
			this.ready = true;
			this.favorites = storageData || [];
		});
	}

	public isReady(): boolean {
		return this.ready;
	}

	public getFavorites(): IFavorite[] {
		return this.favorites;
	}

	public isFavorite(lessonId: number): boolean {
		let favorite: IFavorite = this.favorites.find((item: IFavorite) => item.lessonId === lessonId && item.pageId === undefined);
		return favorite && favorite.isFavorite;
	}

	public isFavoriteExercise(lessonId: number, pageId: number): boolean {
		let favorite: IFavorite = this.favorites.find((item: IFavorite) => item.lessonId === lessonId && item.pageId === pageId);
		return favorite && favorite.isFavorite;
	}

	public toggleFavorite(favoriteItem: IFavorite): void {
		let favorite: IFavorite = this.favorites.find((item: IFavorite) => item.lessonId === favoriteItem.lessonId && item.pageId === favoriteItem.pageId);
		if (favorite) {
			favorite.isFavorite = !favorite.isFavorite;
		} else {
			favoriteItem.isFavorite = true;
			favoriteItem.clickCount = 0;
			this.favorites.push(favoriteItem);
		}
		this.storage.setItem(this.storageKey, this.favorites);
	}

	public addClick(favoriteItem: IFavorite): void {
		let favorite: IFavorite = this.favorites.find((item: IFavorite) => item.lessonId === favoriteItem.lessonId && item.pageId === favoriteItem.pageId);
		if (favorite) {
			favorite.clickCount++;
		}
		this.storage.setItem(this.storageKey, this.favorites);
	}
}
