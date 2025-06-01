import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LngLatLike } from 'mapbox-gl';
import {first, Subject} from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { BrightnessComponent } from 'src/app/component/brightness/brightness.component';
import { LightEntry } from 'src/app/models/light-entry';
import { TimePeriodSetting } from 'src/app/models/time-period';
import { LightMapBridgeService } from 'src/app/service/light-map-bridge.service';
import { LightService } from 'src/app/service/light.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-light-details-view',
  standalone: true,
  template: `
    <div class="light-details-panel">
      <button class="close-button" (click)="onClose()">✖</button>
      <h2>{{ light.address }}</h2>
      <mat-checkbox
        [id]="light.uuid"
        [(ngModel)]="heartbeatChecked"
        (change)="onHeartbeatCheckboxChange($event)"
      >
        Zatrzymaj heartbeat
      </mat-checkbox>
      <button mat-button class="add" (click)="simulateMotion()">
        Symuluj ruch
      </button>
      <p style="margin-bottom: 1rem;">Pozycja:<br />{{ position }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Opis</mat-label>
        <input matInput [(ngModel)]="note" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Wyłącz po [s]</mat-label>
        <input matInput [(ngModel)]="disableAfterSeconds" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Obręb</mat-label>
        <input
          matInput
          [(ngModel)]="proximityActivationRadius"
          (ngModelChange)="onRadiusChange($event)"
        />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>✨Skonfiguruj przez AI</mat-label>
        <input
          matInput
          [(ngModel)]="aiConfigInput"
          (ngModelChange)="onAiConfigChange($event)"
        />
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
    MatCheckboxModule,
  ],
  styleUrl: './light-details-view.component.scss',
})
export class LightDetailsViewComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) light!: LightEntry;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LightEntry>();
  @Output() heartbeatToggle = new EventEmitter<{
    uuid: string;
    enabled: boolean;
  }>();

  heartbeatChecked = false;

  brightnessEntries: TimePeriodSetting[] = [];
  position: string | null = null;
  note: string | null = null;
  disableAfterSeconds: number | null = null;
  proximityActivationRadius: number | null = null;

  // New AI config handling
  aiConfigInput = '';
  private aiConfigSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private lightMapBridgeService: LightMapBridgeService,
    private lightService: LightService
  ) {}

  ngOnInit(): void {
    this.getLightData();

    // Subscribe to AI-config input with 2s debounce
    this.aiConfigSubject
      .pipe(debounceTime(1500), takeUntil(this.destroy$))
      .subscribe((value) => this.updateTimePreferences(value));
  }

  updateTimePreferences(aiPrompt: string) {
    this.http.post<TimePeriodSetting[]>(`http://localhost:8080/lights/gen-brightness-config`, aiPrompt)
      .pipe(first())
      .subscribe((response) => this.brightnessEntries = response || []);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['light'] && this.light) {
      this.heartbeatChecked = false;
      this.getLightData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onHeartbeatCheckboxChange(event: any) {
    this.heartbeatToggle.emit({
      uuid: this.light.uuid,
      enabled: this.heartbeatChecked,
    });
  }

  simulateMotion() {
    this.lightService
      .sendMotionDetected(this.light.uuid, '1')
      .subscribe(() => {
        console.log('Motion simulated for', this.light.uuid);
      });
  }

  getLightData() {
    this.position = this.getPosition(this.light.position);
    this.brightnessEntries = [...this.light.brightnessConfig];
    this.note = this.light.note || null;
    this.disableAfterSeconds = this.light.disableAfterSeconds || null;
    this.proximityActivationRadius =
      this.light.proximityActivationRadius || null;
  }

  onRadiusChange(value: number) {
    this.lightMapBridgeService.setRadius(value);
  }

  // Called on every ngModelChange of the AI field
  onAiConfigChange(value: string) {
    this.aiConfigSubject.next(value);
  }

  onClose() {
    this.lightMapBridgeService.clearSelection();
    this.close.emit();
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
    const updatedBrightness = this.brightnessEntries.map((e) => ({
      from: e.from,
      to: e.to,
      brightness: e.brightness,
    }));
    this.light.brightnessConfig = updatedBrightness;
    this.light.disableAfterSeconds = this.disableAfterSeconds;
    this.light.note = this.note;
    this.light.proximityActivationRadius =
      this.proximityActivationRadius;
    this.save.emit(this.light);
  }

  getPosition(pos: LngLatLike): string {
    if (Array.isArray(pos)) {
      return `Długość: ${pos[0]}, Szerokość: ${pos[1]}`;
    }
    if ('lng' in pos) {
      return `Długość: ${pos.lng}, Szerokość: ${pos.lat}`;
    }
    if ('lon' in pos) {
      return `Długość: ${pos.lon}, Szerokość: ${pos.lat}`;
    }
    return 'Unknown position';
  }
}
