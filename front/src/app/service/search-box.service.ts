import {HttpClient, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {map, Observable, of} from "rxjs";
import {environment} from 'src/environment/environment';

@Injectable({
  providedIn: "root",
})
export class SearchBoxService {

  constructor(private http: HttpClient) {
  }

  searchPlace(text: string): Observable<string> {
    const mapboxToken = environment.mapbox.accessToken;
    const uri = `https://api.mapbox.com/search/searchbox/v1/forward`

    if (!text.trim()) {
      return of('');
    }
    let params = new HttpParams();
    params = params.append('q', text)
    params = params.append('language', 'pl')
    params = params.append('types', 'address,street,postcode,city')
    params = params.append('limit', 1)
    params = params.append('access_token', mapboxToken);

    return this.http.get<string>(uri, {params: params})
  }
}
