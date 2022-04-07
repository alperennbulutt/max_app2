import { Component, AfterViewInit, AfterContentInit ,Input, Output, EventEmitter, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { RadioComponent } from '../radio-component/radio-component';
import { CheckboxComponent } from '../checkbox-component/checkbox-component';
import { TextAreaComponent } from '../textarea-component/textarea-component';
import { InputComponent } from '../input-component/input-component';

@Component({
	selector: 'form-component-loader',
	templateUrl: 'form-component-loader.html'
})
export class FormComponentLoader implements AfterContentInit {
	private radioValue: string;
	@ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

	@Input() type: string;
	@Input() options: any;
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();

	public componentMap: any = {
		radio: RadioComponent,
		checkbox: CheckboxComponent,
		textArea: TextAreaComponent,
		input: InputComponent
	};

	public valueChanged(): void {
		this.onChange.emit(this.radioValue);
	}

	constructor(
		public viewContainerRef: ViewContainerRef,
		public componentFactoryResolver: ComponentFactoryResolver
	) {}

	ngAfterContentInit() {
		this.loadComponent();
	}

	ngOnChanges(): void {
		this.loadComponent();
	}

	loadComponent(): void {
		if (this.componentMap.hasOwnProperty(this.type)) {
			let component = this.componentFactoryResolver.resolveComponentFactory(this.componentMap[this.type]);
			this.container.clear();
			let componentRef: any = this.container.createComponent(component);
			componentRef.instance.items = this.options;
			componentRef.instance.custom = 'true';
			componentRef.instance.onChange.subscribe((data: any) => {
				this.onChange.emit(data);
			});
		} else {
			this.container.clear();
		}
	}
}
