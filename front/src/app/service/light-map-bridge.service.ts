import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LightMapBridgeService {
  private selectedUuid = new BehaviorSubject<string | null>(null);
  selectedUuid$ = this.selectedUuid.asObservable();

  get currentSelectedUuid(): string | null {
    return this.selectedUuid.getValue();
  }

  private radius = new BehaviorSubject<number>(30);
  radius$ = this.radius.asObservable();

  get currentRadius(): number {
    return this.radius.getValue();
  }

  clearSelection() {
    this.selectedUuid.next(null);
  }

  setSelected(uuid: string) {
    this.selectedUuid.next(uuid);
  }

  setRadius(meters: number) {
    this.radius.next(meters);
  }
}
