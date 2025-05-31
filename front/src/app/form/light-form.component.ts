import { Component, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { LightDto } from '../models/light-dto';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-light-dialog',
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
    ]
})
export class LightFormComponent {
  uuid = crypto.randomUUID();
  address = '';
  lng: number | null = null;
  lat: number | null = null;

  constructor(private dialogRef: MatDialogRef<LightFormComponent>) {}

  save() {
    const newLamp: LightDto = {
      address: this.address,
      pos: [this.lng!, this.lat!],
      brightness: new Map(),
    };
    this.dialogRef.close(newLamp);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
