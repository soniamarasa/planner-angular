import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  weekDay = format(new Date(), 'EEEE', { locale: ptBR });
  wD: any;

  today() {
    const day = format(new Date(), 'dd', { locale: ptBR });
    const month = format(new Date(), 'LLLL', { locale: ptBR });
    const year = format(new Date(), 'yyyy', { locale: ptBR });

    this.wD = this.weekDay.split('-')[0];
    this.weekDay = this.weekDay.charAt(0).toUpperCase() + this.weekDay.slice(1);

    return this.weekDay + ', ' + day + ' de ' + month + ' de ' + year;
  }
  constructor() {}
}
