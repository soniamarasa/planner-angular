import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDayComponent } from './card-day.component';

describe('CardDayComponent', () => {
  let component: CardDayComponent;
  let fixture: ComponentFixture<CardDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
