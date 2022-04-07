/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/component-selector */
import {
  Component,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { IonSlides } from '@ionic/angular';

export interface IBarChartPoint {
  title?: string;
  subtitle?: string;
  value: number;
  color?: string;
  shaded?: boolean;
  disabled?: boolean;
  customParams?: any;
  goal?: number;
}

export interface IBarChartPage {
  pageTitle: string;
  data: IBarChartPoint[];
}

export interface IBarChartData {
  title?: string;
  xAxis?: {
    visible?: boolean;
    titleSize?: number;
    subtitleSize?: number;
  };
  yAxis?: {
    visible?: boolean;
  };
  initialPage?: number;
  data: IBarChartPage[];
  showThumbs?: boolean;
  hideDayData?: boolean;
}

@Component({
  selector: 'column-chart',
  templateUrl: 'chart.html',
})
export class ComponentChart {
  @ViewChild(IonSlides) slider: IonSlides;

  @Input()
  get chartData(): IBarChartData {
    return this._chartData;
  }
  set chartData(value: IBarChartData) {
    this._chartData = value;
    this.updateYAxis();
  }
  @Input() selectedBar: number;

  @Output() slideDidChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() barClicked: EventEmitter<any> = new EventEmitter<any>();

  private _chartData: IBarChartData = { data: [] };
  private currentSlide: number = 0;

  public highestValue: number = 1;
  public yAxisValues: number[];

  constructor() {
    this.updateYAxis();
  }

  public onSlideDidChange(event?: any): void {
    this.currentSlide = Number(this.slider.getActiveIndex());
    if (this.currentSlide > Number(this.slider.length()) - 1) {
      this.currentSlide = Number(this.slider.length()) - 1;
    }
    this.updateYAxis();

    this.slideDidChange.emit(this.slider);
  }

  public onBarClick(data: any, index: number): void {
    this.selectedBar = index;
    this.barClicked.emit({ data, index });
  }

  private updateYAxis(): void {
    this.highestValue = 1;
    if (this._chartData.data[this.currentSlide]) {
      this._chartData.data[this.currentSlide].data.forEach((item: any) => {
        if (item.value > this.highestValue) {
          this.highestValue = item.value;
        }
        if (item.goal > this.highestValue) {
          this.highestValue = item.goal;
        }
      });
    }

    this.yAxisValues = Array.apply(null, { length: this.highestValue + 1 })
      .map(Number.call, Number)
      .reverse();
  }
}
