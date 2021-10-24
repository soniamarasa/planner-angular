import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsPlannerComponent } from './actions-planner.component';

describe('ActionsPlannerComponent', () => {
  let component: ActionsPlannerComponent;
  let fixture: ComponentFixture<ActionsPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsPlannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
