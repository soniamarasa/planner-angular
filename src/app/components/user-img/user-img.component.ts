import { Component, Input, OnChanges } from '@angular/core';
import { getGravatarUrl } from 'src/app/utils/gravatar.util';

@Component({
  selector: 'app-user-img',
  standalone: false,
  templateUrl: './user-img.component.html',
  styleUrls: ['./user-img.component.scss'],
})
export class UserImgComponent implements OnChanges {
  @Input() gender!: string;
  @Input() email?: string;
  @Input() size = 96;

  gravatarUrl = '';

  ngOnChanges(): void {
    this.gravatarUrl = getGravatarUrl(this.email, this.size);
  }
}
