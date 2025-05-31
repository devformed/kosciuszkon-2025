import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LightEntry } from '../models/light-entry';
import { LightDto } from '../models/light-dto';
import { GeoPositionRadiusDto } from '../models/geo-position-radius-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  private baseUrl = 'http://192.168.1.140:8080/lights';

  constructor(private http: HttpClient) {}

  getNearest(dto: GeoPositionRadiusDto): Observable<LightEntry[]> {
    return this.http.post<LightEntry[]>(`${this.baseUrl}/nearest`, dto);
  }

  create(dto: LightDto): Observable<LightEntry> {
    return this.http.post<LightEntry>(this.baseUrl, dto);
  }

  update(uuid: string, dto: LightDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${uuid}`, dto);
  }

  delete(uuid: string): Observable<void> {
    // 🛠️ Uwaga: w backendzie masz `/lights/{uuid}=`, usuń `=` z @DeleteMapping w Javie
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`);
  }

  sendHeartbeat(uuid: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${uuid}/heartbeat`, null, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  sendMotionDetected(uuid: string, pedestrianId: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${uuid}/motion-detected`,
      pedestrianId,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }
}
