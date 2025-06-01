import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { map, Observable } from 'rxjs';
import { LightEntry } from '../models/light-entry';
import * as geohash from 'ngeohash';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService extends RxStomp {
  constructor() {
    super();
  }

  async init() {
    this.configure({
      webSocketFactory: () => new WebSocket(`ws://localhost:8080/ws`),
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 200,
    });
    this.activate();
  }

  listenToRegion(lat: number, lng: number): Observable<LightEntry> {
    const hash = geohash.encode(lat, lng, 2);
    const destination = `/client/region/${hash}/light`;
    return this.watch(destination)
      .pipe(
        map(msg => JSON.parse(msg.body) as LightEntry)
      );
  }
}
