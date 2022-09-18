import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverDialogComponent } from './recover-dialog.component';

describe('RecoverDialogComponent', () => {
  let component: RecoverDialogComponent;
  let fixture: ComponentFixture<RecoverDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecoverDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
