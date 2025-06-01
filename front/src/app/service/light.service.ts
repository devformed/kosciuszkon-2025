import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LightEntry } from '../models/light-entry';
import { LightDto } from '../models/light-dto';
import { GeoPositionRadiusDto } from '../models/geo-position-radius-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  private baseUrl = 'http://localhost:8080/lights';

  constructor(private http: HttpClient) {}

  getNearest(dto: GeoPositionRadiusDto): Observable<LightEntry[]> {
    return this.http.post<LightEntry[]>(`${this.baseUrl}/nearest`, dto);
  }

  create(dto: LightDto): Observable<LightEntry> {
    return this.http.post<LightEntry>(this.baseUrl, dto, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  update(uuid: string, dto: LightDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${uuid}`, dto);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`);
  }

  sendHeartbeat(uuid: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${uuid}/heartbeat`, null, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  sendAllHeartbeats(uuids: string[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/batch/heartbeat`, uuids, {
      headers: { 'Content-Type': 'application/json' },
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
