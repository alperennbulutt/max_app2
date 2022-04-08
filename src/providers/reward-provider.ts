import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageProvider } from './utilities/storage-provider';
import { FileProvider } from './file-provider';

@Injectable()
export class RewardProvider {
  public currentReward: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public archivedReward: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private storageProvider: StorageProvider,
    private file: FileProvider
  ) {}

  public getCurrentReward(): void {
    this.storageProvider.getItem('currentReward').then((reward: any) => {
      // If image is a custom image
      if (reward && !!reward.image && reward.image.length > 50) {
        this.file.getFromLibrary('rewards').then((data: any) => {
          const fileName: string =
            reward.image.split('/')[reward.image.split('/').length - 1];
          const newImage: any = data.find(
            (file: any) => file.name === fileName
          );
          reward.image = newImage.nativeURL;
          this.currentReward.next(reward);
        });
      } else {
        this.currentReward.next(reward);
      }
    });
  }

  public getCurrentRewardValue(): any {
    return this.currentReward.value;
  }

  public updateReward(reward: any): void {
    this.storageProvider.setItem('currentReward', reward);
    return this.currentReward.next(reward);
  }

  public deleteCurrentReward(): void {
    this.storageProvider.deleteItem('currentReward');
    this.currentReward.next(null);
  }

  public archiveReward(reward: any): void {
    this.storageProvider.getItem('finishedRewards').then((rewardData: any) => {
      const rewards: any = rewardData || {};
      const newrewards: any = {
        ...rewards,
        reward,
      };
      this.storageProvider.setItem('finishedRewards', newrewards);
    });
  }
}
