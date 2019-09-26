import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FeedItem } from '../feed/models/feed-item.model';
import { catchError, tap, map } from 'rxjs/operators';
//the api service is that is giving us the overhead to make that request.
const API_HOST = environment.apiHost;

@Injectable({
  providedIn: 'root'
})
export class ApiService { /* we're sending HTTP options for application JSON for application payloads with every request */
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  token: string;

  constructor(private http: HttpClient) {
  }

  handleError(error: Error) {
    alert(error.message);
  }
//saving tokens
  setAuthToken(token) {
    this.httpOptions.headers = this.httpOptions.headers.append('Authorization', `jwt ${token}`);// If we have a token we appen it in the header of the request
    this.token = token;
  }

  //we're abstracing our get and post method --> !
  get(endpoint): Promise<any> {
    const url = `${API_HOST}${endpoint}`;//we're adding endpoint as our method signature
    //then we're performing an HTTP request with the Angular service to get that request
    const req = this.http.get(url, this.httpOptions).pipe(map(this.extractData));

    return req
            .toPromise()
            .catch((e) => {
              this.handleError(e);
              throw e;
            });
  }

  post(endpoint, data): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    return this.http.post<HttpEvent<any>>(url, data, this.httpOptions)
            .toPromise()
            .catch((e) => {
              this.handleError(e);
              throw e;
            });
  }

  async upload(endpoint: string, file: File, payload: any): Promise<any> {
    const signed_url = (await this.get(`${endpoint}/signed-url/${file.name}`)).url;

    const headers = new HttpHeaders({'Content-Type': file.type});
    const req = new HttpRequest( 'PUT', signed_url, file,
                                  {
                                    headers: headers,
                                    reportProgress: true, // track progress
                                  });

    return new Promise ( resolve => {
        this.http.request(req).subscribe((resp) => {
        if (resp && (<any> resp).status && (<any> resp).status === 200) {
          resolve(this.post(endpoint, payload));
        }
      });
    });
  }

  /// Utilities
  private extractData(res: HttpEvent<any>) {
    const body = res;
    return body || { };
  }
}
