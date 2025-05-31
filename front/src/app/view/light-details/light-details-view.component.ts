import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatFormField,
  MatInputModule,
  MatLabel,
} from '@angular/material/input';
import { LngLatLike } from 'mapbox-gl';
import { BrightnessComponent } from 'src/app/component/brightness/brightness.component';
import { LightEntry } from 'src/app/models/light-entry';
import { TimePeriodSetting } from 'src/app/models/time-period';

@Component({
  selector: 'app-light-details-view',
  standalone: true,
  template: `
    <div class="light-details-panel">
      <button class="close-button" (click)="close.emit()">✖</button>
      <h2>{{ light.address }}</h2>
      <p style="margin-bottom: 1rem;">Pozycja:<br />{{ position }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Opis</mat-label>
        <input matInput [(ngModel)]="note" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Maksymalna nieaktywność [s]</mat-label>
        <input matInput [(ngModel)]="disableAfterSeconds" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Obręb</mat-label>
        <input matInput [(ngModel)]="proximityActivationRadius" />
      </mat-form-field>
      <p>Jasność:</p>

      @for (entry of brightnessEntries; track $index) {
      <app-brightness-entry (remove)="removeEntry($index)" [entry]="entry" />
      }
      <button mat-button class="add" (click)="addEntry()">
        ➕ Dodaj zakres
      </button>
      <button mat-button class="save" (click)="saveChanges()">
        💾 Zapisz zmiany
      </button>
    </div>
  `,
  imports: [
    BrightnessComponent,
    FormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInputModule,
  ],
  styleUrl: './light-details-view.component.scss',
})
export class LightDetailsViewComponent implements OnInit, OnChanges {
  @Input({ required: true }) light!: LightEntry;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LightEntry>();

  brightnessEntries: TimePeriodSetting[] = [];
  position: string | null = null;
  note: string | null = null;
  disableAfterSeconds: number | null = null;
  proximityActivationRadius: number | null = null;

  ngOnInit(): void {
    this.getLightData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['light'] && this.light) {
      this.getLightData();
    }
  }

  getLightData() {
    this.position = this.getPosition(this.light.position);
    this.brightnessEntries = this.light.brightnessConfig;
    this.note = this.light.note || null;
    this.disableAfterSeconds = this.light.disableAfterSeconds || null;
    this.proximityActivationRadius =
      this.light.proximityActivationRadius || null;
  }

  addEntry(): void {
    this.brightnessEntries.push({
      from: '00:00',
      to: '01:00',
      brightness: 0.5,
    });
  }

  removeEntry(index: number): void {
    this.brightnessEntries.splice(index, 1);
  }

  saveChanges(): void {
    const updatedBrightness = new Array<TimePeriodSetting>();
    this.brightnessEntries.forEach((entry) => {
      updatedBrightness.push({
        from: entry.from,
        to: entry.to,
        brightness: entry.brightness,
      });
    });
    this.light.brightnessConfig = updatedBrightness;
    this.light.disableAfterSeconds = this.disableAfterSeconds;
    this.light.note = this.note;
    this.light.proximityActivationRadius = this.proximityActivationRadius;
    console.log(
      '🚀 ~ LightDetailsViewComponent ~ saveChanges ~ this.light:',
      this.light
    );
    this.save.emit(this.light);
  }

  getBrightnessConfig(brightnessConfig: TimePeriodSetting) {
    return `${brightnessConfig.from} - ${brightnessConfig.to}: ${
      brightnessConfig.brightness * 100
    }%`;
  }

  onBrightnessConfigInput(event: Event, entry: TimePeriodSetting) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    entry.brightness = value / 100;
  }

  getPosition(pos: LngLatLike): string {
    if (Array.isArray(pos)) {
      return `Lng: ${pos[0]}, Lat: ${pos[1]}`;
    }
    if ('lng' in pos) {
      return `Lng: ${pos.lng}, Lat: ${pos.lat}`;
    }
    if ('lon' in pos) {
      return `Lng: ${pos.lon}, Lat: ${pos.lat}`;
    }
    return 'Unknown position';
  }
}
