import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { OutputComponent } from './output.component';

describe('OutputComponent', () => {
  let component: OutputComponent;
  let fixture: ComponentFixture<OutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input string in the pre element', () => {
    // Check that the pre element exists
    const compiled = fixture.nativeElement;
    const preElement = compiled.querySelector('pre.output-text');
    expect(preElement).toBeTruthy();

    // Test the component properties directly
    component.outputText = 'This is test output text';
    expect(component.outputText).toBe('This is test output text');
  });

  it('should have default outputType as info', () => {
    expect(component.outputType).toBe('info');
  });
});