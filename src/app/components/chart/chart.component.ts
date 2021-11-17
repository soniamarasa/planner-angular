import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  items: Item[] | undefined;

  started = 0;
  finished = 0;
  important = 0;
  canceled = 0;
  notStarted = 0;
  total = 0;

  datatasks: any;

  constructor(private facade: ItemsFacade) {
    const items$ = this.facade.itemsState$
      .pipe(map((state) => state.items))
      .subscribe((data: Item[]) => (this.items = data));

    this.dataChart();
  }

  ngOnInit(): void {}

  public pieChartOptions = {
    responsive: true,
    scales: {},
    plugins: {
      legend: {
        labels: {
          color: '#808080',
        },
      },
    },
  };

  public data = {
    labels: ['Not started', 'Started', 'Finished', 'Canceled', 'Important'],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FFA500',
          '#b995b9',
          '#4AB915',
          '#5C5C5E',
          '#f52d55',
        ],
        hoverBackgroundColor: [
          '#FFB324',
          '#CDB4CD',
          '#72E938',
          '#979799',
          '#F8708B',
        ],
      },
    ],
  };

  dataChart() {
    this.items?.forEach((items) => {
      if (items.type === 'task') {
        if (items.started) {
          this.started += 1;
        } else if (items.finished) {
          this.finished += 1;
        } else if (items.canceled) {
          this.canceled += 1;
        } else if (items.important) {
          this.important += 1;
        } else if (
          !items.important &&
          !items.finished &&
          !items.started &&
          !items.canceled
        ) {
          this.notStarted += 1;
        }
        this.total += 1;
      }
    });

    this.datatasks = [
      this.notStarted,
      this.started,
      this.finished,
      this.canceled,
      this.important,
    ];

    this.data.datasets[0].data = this.datatasks;
  }
}
