import { Component } from '@angular/core';
import {
  MapViewComponent,
  sampleLampData,
} from './view/map/map-view.component';
import { LightEntry } from './models/light-entry';
import { MapEntry } from './models/map-entry';
import { LightDetailsViewComponent } from './view/light-details/light-details-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapViewComponent, LightDetailsViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'greencity';

  selectedLight: LightEntry | null = null;

  mapEntry: MapEntry = sampleLampData;

  onLampSelected(uuid: string) {
    const found = this.mapEntry.lights.find((light) => light.uuid === uuid);
    this.selectedLight = found ?? null;
    console.log(
      '🚀 ~ AppComponent ~ onLampSelected ~ this.selectedLamp:',
      this.selectedLight
    );
  }
}
