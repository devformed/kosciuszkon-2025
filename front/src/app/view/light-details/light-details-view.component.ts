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
import { LngLatLike } from 'mapbox-gl';
import { BrightnessComponent } from 'src/app/component/brightness/brightness.component';
import { LightEntry } from 'src/app/models/light-entry';
import { TimePeriod } from 'src/app/models/time-period';

@Component({
  selector: 'app-light-details-view',
  standalone: true,
  template: `
    <div class="light-details-panel">
      <button class="close-button" (click)="close.emit()">✖</button>
      <h2>{{ light.address }}</h2>
      <p>Pozycja: {{ position }}</p>
      <p>Jasność:</p>

      @for (entry of brightnessEntries; track $index) {
      <app-brightness-entry (remove)="removeEntry($index)" [entry]="entry" />
      }
      <button class="add" (click)="addEntry()">➕ Dodaj zakres</button>
      <button class="save" (click)="saveChanges()">💾 Zapisz zmiany</button>
    </div>
  `,
  imports: [BrightnessComponent, FormsModule],
  styleUrl: './light-details-view.component.scss',
})
export class LightDetailsViewComponent implements OnInit, OnChanges {
  @Input({ required: true }) light!: LightEntry;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Map<TimePeriod, number>>();

  brightnessEntries: BrightnessEntry[] = [];
  position: string | null = null;

  ngOnInit(): void {
    this.position = this.getPosition(this.light.pos);
    this.brightnessEntries = Array.from(this.light.brightness.entries()).map(
      ([period, value]) => ({
        period: { ...period },
        value,
      })
    );
    console.log(
      '🚀 ~ LightDetailsViewComponent ~ ngOnInit ~ this.brightnessEntries:',
      this.brightnessEntries
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['light'] && this.light) {
      this.position = this.getPosition(this.light.pos);
      this.brightnessEntries = Array.from(this.light.brightness.entries()).map(
        ([period, value]) => ({
          period: { ...period },
          value,
        })
      );
    }
  }

  addEntry(): void {
    this.brightnessEntries.push({
      period: { from: '00:00', to: '01:00' },
      value: 0.5,
    });
  }

  removeEntry(index: number): void {
    this.brightnessEntries.splice(index, 1);
  }

  saveChanges(): void {
    const updated = new Map<TimePeriod, number>();
    for (const entry of this.brightnessEntries) {
      updated.set(entry.period, entry.value);
    }
    this.save.emit(updated);
  }

  getBrightness(brightness: [TimePeriod, number]) {
    const [timePeriod, value] = brightness;
    return `${timePeriod.from} - ${timePeriod.to}: ${value * 100}%`;
  }

  onBrightnessInput(event: Event, entry: BrightnessEntry) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    entry.value = value / 100;
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

interface BrightnessEntry {
  period: TimePeriod;
  value: number;
}
