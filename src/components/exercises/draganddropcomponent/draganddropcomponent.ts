/* eslint-disable prefer-const */
/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/component-selector */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';

interface IDnDValues {
  left: any[];
  right: any[];
}

interface IDnDAnswer {
  moved: any[];
}

@Component({
  selector: 'draganddropcomponent',
  templateUrl: 'draganddropcomponent.html',
})
export class DragAndDropComponent {
  private _exercise: any = {};
  private _storageData: IDnDAnswer;

  public _visibleValues: IDnDValues = {
    left: [],
    right: [],
  };
  public isDirty: boolean = false;

  @Input() canEdit: boolean;
  @Input()
  get exercise(): any {
    return this._exercise;
  }
  set exercise(val: any) {
    this._exercise = JSON.parse(val) || undefined;

    if (this.exercise) {
      this._storageData = {
        moved: [],
      };
    }
    this.setCorrectValues();
  }

  @Input()
  get data(): any {
    return this._storageData;
  }
  set data(val: any) {
    if (val) {
      this._storageData = val;
      if (!this._storageData.moved) {
        this._storageData.moved = [];
      }
    }
    this.setCorrectValues();
  }
  @Output() dataChange: any = new EventEmitter();
  @Output() onValueChange: any = new EventEmitter();

  constructor(private modalController: ModalController) {}

  async openModal() {
    const modal = await this.modalController.create({
      component: DragAndDropComponent,
      componentProps: {
        title: 'Drag and Drop',
        exercise: this._exercise,
        answerData: this._storageData,
      },
    });
    await modal.present();
  }

  private setCorrectValues(): void {
    this._visibleValues = { left: [], right: [] };
    if (this._exercise && this.exercise.options) {
      this._exercise.options.forEach((option: any) => {
        if (
          !this._storageData ||
          this._storageData.moved.indexOf(option.label) === -1
        ) {
          this._visibleValues.left.push(option);
        } else {
          this._visibleValues.right.push(option);
        }
      });
    }
  }
}
