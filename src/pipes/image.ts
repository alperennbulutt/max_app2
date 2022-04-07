import { Injectable, Pipe } from '@angular/core';

import { Settings } from '../providers/utilities/app-settings';

@Pipe({
  name: 'imageUrl',
})
@Injectable()
export class PipeImage {
  transform(value: string, args?: any[]): string {
    let res: string = Settings.ImgEndpoint + value;
    if (args.length > 0) {
      res += '&w=' + args[0];
    }
    if (args.length > 1) {
      res += '&h=' + args[1];
    }
    return res;
  }
}
