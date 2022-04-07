import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from '@ionic/angular';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

export interface IDragAndDropModalData {
  title: string;
  exercise: any;
  answerData: any;
}

@IonicPage({
  name: 'DragAndDropModal',
  segment: 'draganddrop-modal',
})
@Component({
  selector: 'page-drag-and-drop-modal',
  templateUrl: 'draganddrop-modal.html',
})
export class DragAndDropModal {
  private _exercise: any = this.navParams.get('exercise') || {};
  private _storageData: any = this.navParams.get('answerData') || {
    moved: [],
  };

  public title: string = this.navParams.get('title') || '';
  public _visibleValues: any = {
    left: [],
    right: [],
  };
  public isDragging: boolean = false;

  constructor(
    private view: ViewController,
    private navParams: NavParams,
    private dragulaService: DragulaService
  ) {
    this.dragulaService.setOptions('draganddropcomponent', {
      revertOnSpill: true,
      moves: (): any => {
        return false;
      },
    });

    this.setCorrectValues();

    dragulaService.drag.subscribe((value: any) => {
      this.isDragging = true;
    });
    dragulaService.drop.subscribe((value: any) => {
      this.isDragging = false;
    });
    dragulaService.over.subscribe((value: any) => {
      this.isDragging = true;
    });
    dragulaService.out.subscribe((value: any) => {
      this.isDragging = false;
    });

    this.dragulaService.drop.subscribe(() => {
      this._storageData.moved = [];
      this._visibleValues.right.forEach((item: any) => {
        this._storageData.moved.push(item.label);
      });
    });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy('draganddropcomponent');
  }

  private setCorrectValues(): void {
    this._visibleValues = { left: [], right: [] };
    this._exercise.options.forEach((option: any) => {
      if (this._storageData.moved.indexOf(option.label) === -1) {
        this._visibleValues.left.push(option);
      } else {
        this._visibleValues.right.push(option);
      }
    });
  }

  public done(): void {
    this.view.dismiss(this._visibleValues);
  }

  public close(): void {
    this.view.dismiss();
  }
}
