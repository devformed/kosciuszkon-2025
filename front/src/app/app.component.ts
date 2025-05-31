import { Component } from '@angular/core';
import {
  MapViewComponent,
  sampleLampData,
} from './view/map/map-view.component';
import { LightEntry } from './models/light-entry';
import { MapEntry } from './models/map-entry';
import { LightDetailsViewComponent } from './view/light-details/light-details-view.component';
import { TimePeriod } from './models/time-period';
import { MatDialog } from '@angular/material/dialog';
import { LightFormComponent } from './form/light-form.component';

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

  constructor(private dialog: MatDialog) {}

  onLampSelected(uuid: string) {
    const found = this.mapEntry.lights.find((light) => light.uuid === uuid);
    this.selectedLight = found ?? null;
  }

  openAddLightForm() {
    const dialogRef = this.dialog.open(LightFormComponent, {
      width: '600px',
      data: {
        address: null,
        brightness: new Map(),
        pos: [19.94, 50.06],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('zapisano lampy:', result);
    });
  }

  onBrightnessSave(updated: Map<TimePeriod, number>) {
    if (this.selectedLight) {
      this.selectedLight.brightness = updated;
      console.log('Zapisano nowe wartości:', updated);
    }
  }
}
