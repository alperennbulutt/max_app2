import { Injectable, Pipe } from '@angular/core';

import { Settings } from '../providers/utilities/app-settings';

@Pipe({
  name: 'videoUrl',
})
@Injectable()
export class PipeVideoUrl {
  transform(value: string, args?: any[]): string {
    let res: string = Settings.VideoEndpoint + value + '-720.mp4';
    return res;
  }
}
