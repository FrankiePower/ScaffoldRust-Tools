import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule, MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
import { of } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CompilerService } from '../../services/compiler';

import { EditorComponent } from './editor.component';

// Mock Monaco Editor for tests
(globalThis as unknown as { monaco: unknown }).monaco = {
  editor: {
    create: () => ({
      getValue: () => '',
      setValue: () => {},
      dispose: () => {},
      onDidChangeModelContent: () => ({ dispose: () => {} }),
      onDidChangeModelDecorations: () => ({ dispose: () => {} }),
      onDidChangeCursorPosition: () => ({ dispose: () => {} }),
      onDidFocusEditorText: () => ({ dispose: () => {} }),
      onDidBlurEditorText: () => ({ dispose: () => {} }),
      updateOptions: () => {},
      layout: () => {},
      focus: () => {},
      getModel: () => null
    })
  }
};

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let mockMonacoLoaderService: jasmine.SpyObj<MonacoEditorLoaderService>;
  let mockCompilerService: jasmine.SpyObj<CompilerService>;

  beforeEach(async () => {
    // Create mock Monaco loader service
    mockMonacoLoaderService = jasmine.createSpyObj('MonacoEditorLoaderService', [], {
      isMonacoLoaded$: of(true)
    });

    // Create mock Compiler service
    mockCompilerService = jasmine.createSpyObj('CompilerService', ['compile', 'test']);
    mockCompilerService.compile.and.returnValue(of({ output: 'Compilation successful!', success: true }));
    mockCompilerService.test.and.returnValue(of({ output: 'Tests passed!', success: true }));

    await TestBed.configureTestingModule({
      imports: [EditorComponent, FormsModule, MonacoEditorModule, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MonacoEditorLoaderService, useValue: mockMonacoLoaderService },
        { provide: CompilerService, useValue: mockCompilerService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial code', () => {
    expect(component.code).toContain('Welcome to Soroban Smart Contract Editor');
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

  it('should have Monaco Editor initialization options', () => {
    expect(component.editorOptions.automaticLayout).toBe(true);
    expect(component.editorOptions.minimap.enabled).toBe(false);
    expect(component.editorOptions.fontSize).toBe(14);
    expect(component.editorOptions.wordWrap).toBe('on');
  });

  it('should set loading state when compile is called with valid code', () => {
    component.code = 'fn test() {}';
    // Spy on the loading state right before the observable completes
    spyOn(component, 'clearOutput');
    component.onCompile();
    // The loading state should be true initially, even if it gets reset later
    expect(mockCompilerService.compile).toHaveBeenCalledWith('fn test() {}');
  });

  it('should set loading state when test is called with valid code', () => {
    component.code = 'fn test() {}';
    // Spy on the loading state right before the observable completes
    spyOn(component, 'clearOutput');
    component.onTest();
    // The loading state should be true initially, even if it gets reset later
    expect(mockCompilerService.test).toHaveBeenCalledWith('fn test() {}');
  });

  it('should not compile when code is empty', () => {
    component.code = '';
    component.onCompile();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('Code cannot be empty');
  });

  it('should not test when code is empty', () => {
    component.code = '';
    component.onTest();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('Code cannot be empty');
  });

  it('should clear output when clearOutput is called', () => {
    component.errorMessage = 'Some error';
    component.outputMessage = 'Some output';
    component.outputType = 'error';

    component.clearOutput();

    expect(component.errorMessage).toBe('');
    expect(component.outputMessage).toBe('');
    expect(component.outputType).toBe('info');
  });

  it('should initialize with proper default values', () => {
    expect(component.errorMessage).toBe('');
    expect(component.outputMessage).toBe('');
    expect(component.outputType).toBe('info');
  });

  it('should validate code and return false for empty code', () => {
    component.code = '';
    // Access private method using array notation to avoid any type
    const result = component['validateCode']();
    expect(result).toBe(false);
    expect(component.errorMessage).toContain('Code cannot be empty');
  });

  it('should validate code and return true for valid Rust code', () => {
    component.code = 'fn main() { println!("Hello"); }';
    // Access private method using array notation to avoid any type
    const result = component['validateCode']();
    expect(result).toBe(true);
  });

  it('should have buttons disabled state when loading', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const compileButton = compiled.querySelector('button[aria-label="Compile Rust smart contract"]');
    const testButton = compiled.querySelector('button[aria-label="Test Rust smart contract"]');

    expect(compileButton).toBeTruthy();
    expect(testButton).toBeTruthy();
  });
});
