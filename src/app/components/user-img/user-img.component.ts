import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-img',
  templateUrl: './user-img.component.html',
  styleUrls: ['./user-img.component.scss'],
})
export class UserImgComponent implements OnInit {
  constructor() {}

  @Input() gender!: any

  ngOnInit(): void {}
}
