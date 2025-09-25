import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type OutputType = 'error' | 'success' | 'info';

@Component({
  selector: 'app-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})
export class OutputComponent {
  @Input() outputText: string = '';
  @Input() outputType: OutputType = 'info';
}