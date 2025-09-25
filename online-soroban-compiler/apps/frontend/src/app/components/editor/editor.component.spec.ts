import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
  let component: EditorComponent;

  beforeEach(() => {
    component = new EditorComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial code', () => {
    expect(component.code).toContain('Soroban Smart Contract');
  });

  it('should have vs-dark theme', () => {
    expect(component.editorOptions.theme).toBe('vs-dark');
  });

  it('should have rust language', () => {
    expect(component.editorOptions.language).toBe('rust');
  });

  it('should start with loading state as false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should have proper editor options', () => {
    expect(component.editorOptions.theme).toBe('vs-dark');
    expect(component.editorOptions.language).toBe('rust');
    expect(component.editorOptions.automaticLayout).toBe(true);
  });

  it('should have outputText getter', () => {
    component.outputMessage = 'Test output';
    expect(component.outputText).toBe('Test output');

    component.errorMessage = 'Test error';
    component.outputMessage = '';
    expect(component.outputText).toBe('Test error');
  });

  it('should clear output correctly', () => {
    component.errorMessage = 'Some error';
    component.outputMessage = 'Some output';
    component.clearOutput();

    expect(component.errorMessage).toBe('');
    expect(component.outputMessage).toBe('');
    expect(component.outputType).toBe('info');
  });
});
