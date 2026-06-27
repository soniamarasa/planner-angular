import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { ItemsFacade } from 'src/app/facades/items.facade';
import { Item } from 'src/app/models/item';
import { Project } from 'src/app/models/project';
import { ProjectsService } from 'src/app/services/projects.service';
import { getStoredUserId } from 'src/app/utils/stored-user.util';
import { projectIconClass } from 'src/app/utils/project-icon.util';

@Component({
  selector: 'app-chart',
  standalone: false,
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  projects: Project[] = [];

  started = 0;
  finished = 0;
  important = 0;
  canceled = 0;
  notStarted = 0;
  total = 0;

  datatasks: number[] = [];

  private readonly subs = new SubSink();

  constructor(
    private facade: ItemsFacade,
    private projectsService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.facade.itemsState$
        .pipe(
          map((state) =>
            state.items.filter((item) => item.type === 'task')
          )
        )
        .subscribe((data) => {
          this.items = data;
          this.dataChart();
        })
    );

    const userId = getStoredUserId();
    if (userId) {
      this.subs.add(
        this.projectsService.getProjects(userId, true).subscribe({
          next: (projects) => {
            this.projects = (projects ?? []).filter((project) => !project.archived);
          },
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  iconClass(icon?: string): string {
    return projectIconClass(icon);
  }

  formatFocusTime(seconds?: number): string {
    const total = seconds ?? 0;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

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
    labels: ['Not started', 'Started', 'Completed', 'Canceled', 'Important'],
    datasets: [
      {
        data: [] as number[],
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

  private dataChart(): void {
    this.started = 0;
    this.finished = 0;
    this.important = 0;
    this.canceled = 0;
    this.notStarted = 0;
    this.total = 0;

    this.items.forEach((item) => {
      if (item.started) {
        this.started += 1;
      } else if (item.finished) {
        this.finished += 1;
      } else if (item.canceled) {
        this.canceled += 1;
      } else if (item.important) {
        this.important += 1;
      } else if (!item.important && !item.finished && !item.started && !item.canceled) {
        this.notStarted += 1;
      }
      this.total += 1;
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
