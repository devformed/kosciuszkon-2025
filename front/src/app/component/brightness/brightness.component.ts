import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimePeriodSetting } from '../../models/time-period';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {
  MatTimepickerModule,
  MatTimepickerToggle,
} from '@angular/material/timepicker';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-brightness-entry',
  standalone: true,
  template: `<div class="brightness-entry">
    <div class="time-inputs">
      <mat-form-field appearance="outline" class="time-field">
        <input
          matInput
          [matTimepicker]="pickerFrom"
          [(ngModel)]="dateFrom"
          (ngModelChange)="onFromChange($event)"
        />
        <mat-timepicker-toggle matIconSuffix [for]="pickerFrom" />
        <mat-timepicker #pickerFrom />
      </mat-form-field>
      <mat-form-field appearance="outline" class="time-field">
        <input
          matInput
          [matTimepicker]="pickerTo"
          [(ngModel)]="dateTo"
          (ngModelChange)="onToChange($event)"
        />
        <mat-timepicker-toggle matIconSuffix [for]="pickerTo" />
        <mat-timepicker #pickerTo />
      </mat-form-field>
    </div>
    <mat-label>
      Jasność: {{ entry.brightness * 100 | number : '1.0-0' }}%
      <input
        mat-input
        type="range"
        min="0"
        max="100"
        [value]="entry.brightness * 100"
        (input)="onBrightnessInput($event, entry)"
      />
    </mat-label>
    <button mat-button class="remove" (click)="remove.emit()">🗑️ Usuń</button>
  </div> `,
  imports: [
    DecimalPipe,
    FormsModule,
    MatInput,
    MatTimepickerModule,
    MatTimepickerToggle,
    MatFormField,
    MatButton,
    MatLabel,
  ],
  styleUrls: ['./brightness.component.scss'],
})
export class BrightnessComponent implements OnInit {
  @Input() entry!: TimePeriodSetting;
  @Output() remove = new EventEmitter<void>();
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  ngOnInit() {
    this.dateFrom = this.timeStringToDate(this.entry.from);
    this.dateTo = this.timeStringToDate(this.entry.to);
  }

  onFromChange(date: Date) {
    this.dateFrom = date;
    this.entry.from = this.dateToTimeString(date);
  }

  onToChange(date: Date) {
    this.dateTo = date;
    this.entry.to = this.dateToTimeString(date);
  }

  onBrightnessInput(event: Event, entry: TimePeriodSetting) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    entry.brightness = value / 100;
  }

  timeStringToDate(time: string): Date {
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  dateToTimeString(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
}
