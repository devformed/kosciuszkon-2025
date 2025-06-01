import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { LightDto } from '../models/light-dto';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TimePeriodSetting } from '../models/time-period';
import { BrightnessComponent } from '../component/brightness/brightness.component';
import {
  debounceTime,
  distinctUntilChanged,
  first,
  Subject,
  takeUntil,
} from 'rxjs';
import { SearchBoxService } from 'src/app/service/search-box.service';

@Component({
  selector: 'app-light-dialog',
  standalone: true,
  templateUrl: './light-form.component.html',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    FormsModule,
    MatDialogActions,
    BrightnessComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './light-form.component.scss',
})
export class LightFormComponent implements OnInit {
  private destroy$ = new Subject<void>();

  lightForm!: FormGroup;
  brightnessEntries: TimePeriodSetting[] = [];

  constructor(
    private fb: FormBuilder,
    private searchService: SearchBoxService,
    private dialogRef: MatDialogRef<LightFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<LightDto>
  ) {
    this.lightForm = this.fb.group({
      address: ['', [Validators.required]],
      note: [null],
      lat: [null, [Validators.required]],
      lng: [null, [Validators.required]],
      brightnessConfig: this.fb.array(this.brightnessEntries),
      disableAfterSeconds: [
        null,
        [Validators.min(0), Validators.max(3600), Validators.required],
      ],
      proximityActivationRadius: [
        null,
        [Validators.min(0), Validators.max(1000), Validators.required],
      ],
    });
  }

  ngOnInit() {
    this.lightForm
      .get('note')!
      .valueChanges.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value: string) => {
        this.onNoteStable(value);
      });

    this.addEntry();
  }

  get brightnessConfigArray(): FormArray {
    return this.lightForm.get('brightnessConfig') as FormArray;
  }

  private onNoteStable(note: string) {
    this.searchService
      .searchPlace(note)
      .pipe(first())
      .subscribe((response) => this.updateLocationDetails(response));
  }

  private updateLocationDetails(mapboxResponse: any) {
    const fullAddress: string =
      mapboxResponse.features?.[0]?.properties?.full_address;
    const lon: number =
      mapboxResponse.features?.[0]?.properties?.coordinates?.longitude;
    const lat: number =
      mapboxResponse.features?.[0]?.properties?.coordinates?.latitude;

    this.lightForm.get('address')?.setValue(fullAddress || '');
    this.lightForm.get('lng')?.setValue(lon || null);
    this.lightForm.get('lat')?.setValue(lat || null);
  }

  createBrightnessConfigGroup(
    period?: TimePeriodSetting,
    value?: number
  ): FormGroup {
    return this.fb.group({
      from: [period?.from ?? '', Validators.required],
      to: [period?.to ?? '', Validators.required],
      brightness: [
        value ?? 0.5,
        [Validators.required, Validators.min(0), Validators.max(1)],
      ],
    });
  }

  addBrightnessConfigEntry() {
    this.brightnessConfigArray.push(this.createBrightnessConfigGroup());
  }

  removeBrightnessConfigEntry(index: number) {
    this.brightnessConfigArray.removeAt(index);
  }

  save() {
    if (this.lightForm.valid) {
      const raw = this.lightForm.getRawValue();

      const dto: LightDto = {
        address: raw.address,
        position: { lat: raw.lat, lng: raw.lng },
        brightnessConfig: this.brightnessEntries,
        disableAfterSeconds: raw.disableAfterSeconds,
        proximityActivationRadius: raw.proximityActivationRadius,
        note: raw.note,
      };

      this.dialogRef.close(dto);
    }
  }

  serializeLightDto(dto: LightDto): any {
    return {
      ...dto,
      brightnessConfig: dto.brightnessConfig
        ? Array.from(dto.brightnessConfig.entries()).map(([period, value]) => ({
            period,
            value,
          }))
        : [],
    };
  }

  addEntry(): void {
    this.brightnessEntries.push({
      from: '00:00',
      to: '01:00',
      brightness: 0.5,
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
