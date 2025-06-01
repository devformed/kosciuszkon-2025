import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapViewComponent } from './view/map/map-view.component';
import { LightEntry } from './models/light-entry';
import { LightDetailsViewComponent } from './view/light-details/light-details-view.component';
import { MatDialog } from '@angular/material/dialog';
import { LightFormComponent } from './form/light-form.component';
import { LightService } from './service/light.service';
import { WebsocketService } from './service/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapViewComponent, LightDetailsViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'greencity';

  selectedLight: LightEntry | null = null;
  mapEntry: LightEntry[] | null = null;
  private heartbeatIntervals = new Map<string, number>();

  constructor(
    private dialog: MatDialog,
    private lightService: LightService,
    private ws: WebsocketService
  ) {}

  ngOnInit(): void {
    this.ws.init().then(() => {
      this.lightService
        .getNearest({
          position: { lng: 19.996448, lat: 50.083719 },
          radius: 9000,
        })
        .subscribe((lights) => {
          this.mapEntry = lights;
          this.startHeartbeatSimulation(lights);
        });
    });
  }

  onLampSelected(uuid: string) {
    const found = this.mapEntry?.find((light) => light.uuid === uuid);
    this.selectedLight = found ?? null;
  }

  onHeartbeatToggled(event: { uuid: string; enabled: boolean }) {
    if (!event.enabled) {
      this.startHeartbeatSimulation([
        this.mapEntry?.find((l) => l.uuid === event.uuid)!,
      ]);
    } else {
      this.stopHeartbeat(event.uuid);
    }
  }

  openAddLightForm() {
    const dialogRef = this.dialog.open(LightFormComponent, {
      width: '600px',
      data: {
        address: null,
        brightnessConfig: new Map(),
        pos: [19.94, 50.06],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.lightService.create(result).subscribe(() => {
        this.lightService
          .getNearest({ position: { lng: 19.94, lat: 50.05 }, radius: 9000 })
          .subscribe((lights) => {
            this.mapEntry = lights;
          });
      });
    });
  }

  startHeartbeatSimulation(lights: LightEntry[]) {
    lights.forEach((light) => {
      if (this.heartbeatIntervals.has(light.uuid)) return;

      const interval = light.disableAfterSeconds ?? 10;

      const intervalId = window.setInterval(() => {
        this.lightService.sendHeartbeat(light.uuid).subscribe();
      }, interval * 1000);

      this.heartbeatIntervals.set(light.uuid, intervalId);
    });
  }

  stopHeartbeat(uuid: string) {
    const intervalId = this.heartbeatIntervals.get(uuid);
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      this.heartbeatIntervals.delete(uuid);
    }
  }

  onLightEdit(updated: LightEntry) {
    if (this.selectedLight) {
      const position: number[] = [];

      if (Array.isArray(updated.position)) {
        position.push(updated.position[0], updated.position[1]);
      }
      if ('lng' in updated.position) {
        position.push(updated.position.lng, updated.position.lat);
      }
      if ('lon' in updated.position) {
        position.push(updated.position.lon, updated.position.lat);
      }
      const dto = {
        address: updated.address,
        position: { lng: position[0], lat: position[1] },
        brightnessConfig: updated.brightnessConfig,
        disableAfterSeconds: updated.disableAfterSeconds,
        proximityActivationRadius: updated.proximityActivationRadius,
        note: updated.note,
      };
      this.lightService.update(updated.uuid, dto).subscribe();
    }
  }
}
