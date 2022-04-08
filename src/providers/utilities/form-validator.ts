import { Injectable } from '@angular/core';
import { Utilities } from './app-utilities';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Injectable()
export class FormValidator {
  private errorMessages: any = {};

  constructor(private translate: TranslateService) {
    this.translate.get('INPUT-ERRORS').subscribe((translation: string) => {
      this.errorMessages = translation;
    });
  }

  public getValidatorErrorMessage(
    validatorName: string,
    validatorValue?: any
  ): string {
    return this.errorMessages[validatorName];
  }

  public checkboxCheckedValidator(): any {
    return (control: any) => {
      if (control.value) {
        return null;
      } else {
        return { checkboxRequired: true };
      }
    };
  }

  public strategyValidator(): any {
    return (control: any) => {
      if (control.value) {
        return null;
      } else {
        return { noStrategies: true };
      }
    };
  }

  public buttonSelectedValidator(undefinedValue: string): any {
    return (control: any) => {
      if (control.value && control.value !== undefinedValue) {
        return null;
      } else {
        return { selectionRequired: true };
      }
    };
  }

  public emailValidator(): any {
    return (control: any) => {
      if (control.value.match(Utilities.regexEmail)) {
        return null;
      } else {
        return { invalidEmailAddress: true };
      }
    };
  }

  public passwordValidator(): any {
    return (control: any) => {
      if (control.value.match(Utilities.regexPassword)) {
        return null;
      } else {
        return { invalidPassword: true };
      }
    };
  }

  public minimumAgeValidator(minimumAge: number): any {
    return (control: any) => {
      if (
        control.value &&
        moment().diff(moment(control.value), 'years') >= minimumAge
      ) {
        return null;
      } else {
        return { invalidAge: true };
      }
    };
  }

  public phoneValidator(): any {
    return (control: any) => {
      const value: string = control.value.replace(/\ /g, '');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const regex_phone: RegExp = Utilities.regexPhone;
      if (value.match(regex_phone) || !value) {
        return null;
      } else {
        return { invalidPhoneNumber: true };
      }
    };
  }
}
