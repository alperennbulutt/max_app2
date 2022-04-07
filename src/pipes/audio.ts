import { Injectable, Pipe } from '@angular/core';

import { Settings } from '../providers/utilities/app-settings';

@Pipe({
  name: 'audioUrl',
})
@Injectable()
export class PipeAudioUrl {
  transform(value: string): string {
    let res: string = Settings.FileEndpoint + value;
    return res;
  }
}
