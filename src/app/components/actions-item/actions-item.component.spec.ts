import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsItemComponent } from './actions-item.component';

describe('ActionsItemComponent', () => {
  let component: ActionsItemComponent;
  let fixture: ComponentFixture<ActionsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
