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
      address: [data.address ?? '', [Validators.required]],
      lat: [this.getLat(data.pos), [Validators.required]],
      lng: [this.getLng(data.pos), [Validators.required]],
      brightness: this.fb.array(this.brightnessEntries),
    });
  }

  ngOnInit() {
    if (this.data.brightness) {
      this.brightnessEntries = Array.from(this.data.brightness.entries()).map(
        ([period, value]) => ({ period, value })
      );
    }
  }

  get brightnessArray(): FormArray {
    return this.lightForm.get('brightness') as FormArray;
  }

  createBrightnessGroup(period?: TimePeriod, value?: number): FormGroup {
    return this.fb.group({
      from: [period?.from ?? '', Validators.required],
      to: [period?.to ?? '', Validators.required],
      value: [
        value ?? 0.5,
        [Validators.required, Validators.min(0), Validators.max(1)],
      ],
    });
  }

  addBrightnessEntry() {
    this.brightnessArray.push(this.createBrightnessGroup());
  }

  removeBrightnessEntry(index: number) {
    this.brightnessArray.removeAt(index);
  }

  save() {
    if (this.lightForm.valid) {
      const raw = this.lightForm.getRawValue();
      const brightnessMap = new Map<TimePeriod, number>(
        this.brightnessEntries.map((e) => [e.period, e.value])
      );

      const dto: LightDto = {
        address: this.lightForm.get('address')!.value,
        pos: { lat: raw.lat, lng: raw.lng },
        brightness: brightnessMap,
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

  private getLat(pos: any): number {
    if (!pos) return 50;
    if (Array.isArray(pos)) return pos[1];
    return pos.lat ?? 50;
  }

  private getLng(pos: any): number {
    if (!pos) return 19;
    if (Array.isArray(pos)) return pos[0];
    return pos.lng ?? 19;
  }
}
