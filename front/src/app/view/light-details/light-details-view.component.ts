import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LngLatLike } from 'mapbox-gl';
import { LightEntry } from 'src/app/models/light-entry';
import { TimePeriod } from 'src/app/models/time-period';

@Component({
  selector: 'app-light-details-view',
  standalone: true,
  template: `
    <div class="light-panel">
      <button class="close-button" (click)="close.emit()">✖</button>
      <h2>Lampa {{ light.uuid }}</h2>
      <p>Pozycja: {{ position }}</p>
      <p>Jasność:</p>
      <ul>
        @for (entry of brightness; track $index) {
        <li>{{ entry }}</li>
        }
      </ul>
    </div>
  `,
  styleUrl: './light-details-view.component.scss',
})
export class LightDetailsViewComponent implements OnInit, OnChanges {
  @Input({ required: true }) light!: LightEntry;
  @Output() close = new EventEmitter<void>();

  position: string | null = null;
  brightness: string[] | null = null;

  ngOnInit(): void {
    this.position = this.getPosition(this.light.pos);
    this.brightness = Array.from(this.light.brightness.entries()).map((entry) =>
      this.getBrightness(entry)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['light'] && this.light) {
      this.position = this.getPosition(this.light.pos);
      this.brightness = Array.from(this.light.brightness.entries()).map(
        (entry) => this.getBrightness(entry)
      );
    }
  }

  getBrightness(brightness: [TimePeriod, number]) {
    const [timePeriod, value] = brightness;
    return `${timePeriod.from} - ${timePeriod.to}: ${value * 100}%`;
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
