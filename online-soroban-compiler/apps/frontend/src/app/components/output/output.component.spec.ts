import { OutputComponent } from './output.component';

describe('OutputComponent', () => {
  let component: OutputComponent;

  beforeEach(() => {
    component = new OutputComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty output text', () => {
    expect(component.outputText).toBe('');
  });

  it('should initialize with info output type', () => {
    expect(component.outputType).toBe('info');
  });

  it('should accept input values', () => {
    component.outputText = 'Test output message';
    component.outputType = 'error';

    expect(component.outputText).toBe('Test output message');
    expect(component.outputType).toBe('error');
  });
});