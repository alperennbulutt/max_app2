import { NgModule } from '@angular/core';
import { DividerDirective } from './divider/divider';
import { ContentParserDirective } from './content-parser/content-parser';

@NgModule({
	declarations: [
		DividerDirective,
		ContentParserDirective
	],
	exports: [
		DividerDirective,
		ContentParserDirective
	]
})
export class DirectivesModule {}
