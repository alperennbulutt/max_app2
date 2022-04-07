import { NgModule } from '@angular/core';

import { PipeMoment } from './moment';
import { PipeObjectToArray } from './object-to-array';
import { PipeArrayFilterBy } from './array-filter-by';
import { PipeArrayOrderBy } from './array-order-by';
import { PipeAudioUrl } from './audio';
import { PipeVideoUrl } from './video';
import { PipeImage } from './image';
import { PipeMediaTime } from './media-time';
import { NoSanitizePipe } from './no-sanitize';
import { PipeURLSanitizer } from './image-sanitizer';

@NgModule({
    declarations: [
        PipeMoment,
        PipeObjectToArray,
        PipeArrayFilterBy,
        PipeArrayOrderBy,
        PipeAudioUrl,
        PipeVideoUrl,
        PipeImage,
        PipeMediaTime,
        NoSanitizePipe,
        PipeURLSanitizer,
    ],
    exports: [
        PipeMoment,
        PipeObjectToArray,
        PipeArrayFilterBy,
        PipeArrayOrderBy,
        PipeAudioUrl,
        PipeVideoUrl,
        PipeImage,
        PipeMediaTime,
        NoSanitizePipe,
        PipeURLSanitizer,
    ],
})
export class PipesModule {}
