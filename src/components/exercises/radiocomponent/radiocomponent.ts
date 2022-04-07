import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController, Alert } from '@ionic/angular';

interface IRadioExercise {
  options: {
    label: string;
    value: string;
    custom: boolean;
    feedback?: string;
    type?: number;
  }[];
  meta: {
    allowAdd: boolean;
    maxAllowAdd: number;
  };
}

interface IRadioAnswer {
  inputs: string[];
  customLabels: string[];
  customInputs?: string[];
  selected?: number;
}

@Component({
  selector: 'radiocomponent',
  templateUrl: 'radiocomponent.html',
})
export class RadioComponent {
  private _customInputCount: number = 0;

  public _exercise: IRadioExercise;
  public _storageData: IRadioAnswer;

  @Input() canEdit: boolean;
  @Input()
  get exercise(): any {
    return this._exercise;
  }
  set exercise(val: any) {
    this._exercise = val
      ? JSON.parse(val)
      : {
          meta: {},
          options: [],
        };
  }

  @Input()
  get data(): any {
    return this._storageData;
  }
  set data(val: any) {
    let initialData: any = this._storageData;
    this._storageData = val || {
      selected: -1,
      customInputs: [],
    };
    this._storageData.customInputs.forEach((item: any) => {
      if (item) {
        this.addCustomInput(item);
      }
    });
    if (initialData) {
      this.dataChange.emit(this._storageData);
    }
  }
  @Output() dataChange: any = new EventEmitter();
  @Output() onValueChange: any = new EventEmitter();

  constructor(private alertController: AlertController) {}

  public onSelectChange(index: number): void {
    this._storageData.selected = index;
    this.dataChange.emit(this._storageData);

    if (this._storageData.customInputs[index]) {
      this._exercise.options[index].label =
        this._storageData.customInputs[index];
    }
    if (index >= this._exercise.options.length) {
      this.onValueChange.emit(
        this._storageData.customInputs[
          index - this._exercise.options.length - 1
        ]
      );
    } else {
      this.onValueChange.emit(this._exercise.options[index].label);
    }

    this.showFeedbackAlert(index);
  }

  private showFeedbackAlert(index: number): void {
    if (this._exercise.options[index].feedback) {
      let alert: Alert = this.alertController.create({
        title: this._exercise.options[index].label,
        subTitle: this._exercise.options[index].feedback,
        buttons: ['Ok'],
      });
      alert.present();
    }
  }

  private addCustomAllowed(): boolean {
    return (
      this.canEdit &&
      this._exercise.meta.allowAdd &&
      this._customInputCount < this._exercise.meta.maxAllowAdd
    );
  }

  public addInputValue(): void {
    if (this.addCustomAllowed()) {
      this.addCustomInput('');
    }
  }

  public addCustomInput(value: string): void {
    this._exercise.options.push({ label: value, value: '', custom: true });
    this._customInputCount++;
  }

  public removeCustomInput(index: number): void {
    if (this._storageData.selected === index) {
      this._storageData.selected = -1;
    }
    this._storageData.customInputs.splice(index, 1);
    this._exercise.options.pop();
    this._customInputCount--;
  }
}
