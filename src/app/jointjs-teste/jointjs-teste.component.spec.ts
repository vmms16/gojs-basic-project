import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JointjsTesteComponent } from './jointjs-teste.component';

describe('JointjsTesteComponent', () => {
  let component: JointjsTesteComponent;
  let fixture: ComponentFixture<JointjsTesteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JointjsTesteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JointjsTesteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
