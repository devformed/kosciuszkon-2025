import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimePeriod } from '../../models/time-period';
import { MatInput } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/';

@Component({
  standalone: true,
  selector: 'app-brightness-entry',
  template: `<div class="brightness-entry">
    <div class="time-inputs">
      <!-- <label>From: <input type="time" [(ngModel)]="entry.period.from" /></label> -->
      <input matInput [matTimepicker]="picker" />
      <mat-timepicker-toggle matIconSuffix [for]="picker" />
      <mat-timepicker #picker />
      <label>To: <input type="time" [(ngModel)]="entry.period.to" /></label>
    </div>
    <label>
      Jasność: {{ entry.value * 100 | number : '1.0-0' }}%
      <input
        type="range"
        min="0"
        max="100"
        [value]="entry.value * 100"
        (input)="onBrightnessInput($event, entry)"
      />
    </label>
    <button class="remove" (click)="remove.emit()">🗑️ Usuń</button>
  </div> `,
  imports: [DecimalPipe, FormsModule, MatInput, MatTimepickerModule],
  styleUrls: ['./brightness.component.scss'],
})
export class BrightnessComponent {
  @Input() entry!: BrightnessEntry;
  @Output() remove = new EventEmitter<void>();

  onBrightnessInput(event: Event, entry: BrightnessEntry) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    entry.value = value / 100;
  }
}

interface BrightnessEntry {
  period: TimePeriod;
  value: number;
}
