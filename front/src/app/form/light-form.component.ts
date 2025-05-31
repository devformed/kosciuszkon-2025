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
import { TimePeriod } from '../models/time-period';
import {
  BrightnessComponent,
  BrightnessEntry,
} from '../component/brightness/brightness.component';

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
  lightForm!: FormGroup;
  brightnessEntries: BrightnessEntry[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LightFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<LightDto>
  ) {
    this.lightForm = this.fb.group({
      address: ['', [Validators.required]],
      note: [''],
      lat: [null, [Validators.required]],
      lng: [null, [Validators.required]],
      brightnessConfig: this.fb.array(this.brightnessEntries),
      disableAfterSeconds: [null],
      proximityActivationRadius: [null],
    });
  }

  ngOnInit() {
    this.addEntry();
  }

  get brightnessConfigArray(): FormArray {
    return this.lightForm.get('brightnessConfig') as FormArray;
  }

  createBrightnessConfigGroup(period?: TimePeriod, value?: number): FormGroup {
    return this.fb.group({
      from: [period?.from ?? '', Validators.required],
      to: [period?.to ?? '', Validators.required],
      value: [
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
      const brightnessMap = new Map<TimePeriod, number>(
        this.brightnessEntries.map((e) => [e.period, e.value])
      );

      const dto: LightDto = {
        address: raw.address,
        position: { lat: raw.lat, lng: raw.lng },
        brightness: brightnessMap,
        disableAfterSeconds: raw.disableAfterSeconds,
        proximityActivationRadius: raw.proximityActivationRadius,
        note: raw.note,
      };

      console.log(dto);
      this.dialogRef.close(dto);
    }
  }

  addEntry(): void {
    this.brightnessEntries.push({
      period: { from: '00:00', to: '01:00' },
      value: 0.5,
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
