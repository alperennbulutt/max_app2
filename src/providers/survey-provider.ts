import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiGateway } from './utilities/api/api-gateway';
import { Settings } from './utilities/app-settings';
import { StorageProvider } from './utilities/storage-provider';

export enum EQuestionTypes {
  display = 0,
  radio = 1,
  checkbox = 2,
  range = 3,
  memo = 4,
}

export interface IQuestionnaire {
  button_text: string;
  name: string;
  outro: string;
  sections: {
    intro: string;
    name: string;
    questions: {
      id: number;
      label: string;
      note: string;
      options: {
        label: string;
        value: string;
        selected?: boolean;
      }[];
      ref_question: string;
      ref_value_show: string;
      required: boolean;
      text: string;
      textfield: boolean;
      title: string;
      type: string;
    }[];
  }[];
}

@Injectable()
export class SurveyProvider {
  public surveyResults;

  constructor(
    private settings: Settings,
    private apiGateway: ApiGateway,
    private storage: StorageProvider
  ) {
    this.getResultsFromStorage();
  }

  public get(QuestionnaireId: number, hideLoader?: boolean): Observable<any> {
    let method: string = 'list.getListById&list_id=' + QuestionnaireId;
    return this.apiGateway.get(
      this.settings.apiQuestionnaireEndpoint + method,
      {},
      hideLoader
    );
  }

  public saveAnswers(data: any, hideLoader?: boolean): Observable<any> {
    let method: string = 'list.saveList';
    return this.apiGateway.post(
      this.settings.apiQuestionnaireEndpoint + method,
      {},
      data,
      hideLoader
    );
  }

  public getResultsFromStorage(): Promise<any> {
    return new Promise((resolve: any) => {
      if (this.surveyResults) {
        resolve(this.surveyResults);
      } else {
        this.storage.getItem('surveyResults').then((results: any) => {
          this.surveyResults = results;
          resolve(this.surveyResults);
        });
      }
    });
  }

  public getResultById(id: number): Promise<any> {
    return new Promise((resolve: any) => {
      this.getResultsFromStorage().then(() => {
        if (this.surveyResults) {
          resolve(this.surveyResults[id]);
        } else {
          resolve('');
        }
      });
    });
  }

  public saveToStorage(id: number, result: any): void {
    if (!this.surveyResults) {
      this.surveyResults = {};
    }
    this.surveyResults[id] = result;
    this.storage.setItem('surveyResults', this.surveyResults);
  }
}
