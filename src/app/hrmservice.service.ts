import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEvent,
  HttpParams,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HrmserviceService {
  data$: any;
  subscribe(arg0: (data: any) => void) {
    throw new Error('Method not implemented.');
  }

  // url: string = 'http://127.0.0.1:8000/api/v1/';

  url: string = 'https://edhaasdigisoft.co.in/shwetapayroll/api/v1/';


  // url: string = 'http://localhost/CRM_rest/index.php/';
//   url: string = 'https://edhaasdigisoft.co.in/website1/Hrishi/CRM_rest/index.php/';
  // url:  string =  'http://localhost/CRM_Portal_API/index.php';

  constructor(private router: Router, private httpClient: HttpClient) { }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    return this.httpClient.get(this.url + '/' + endpoint, reqOpts);
  }
  // post(endpoint: string, body: any, params?: any, reqOpts?: any) {
  //   if (!reqOpts) {
  //     reqOpts = {
  //       params: new HttpParams(),
  //     };
  //   }
  //   // Support easy query params for GET requests
  //   if (params) {
  //     reqOpts.params = new HttpParams();
  //     for (let k in params) {
  //       reqOpts.params = reqOpts.params.set(k, params[k]);
  //     }
  //   }
  //   // console.log("Body :"+JSON.stringify(body));
  //   return this.httpClient.post(this.url + endpoint, body, reqOpts);
  // }

  // JWT+POST

  post(endpoint: string, body: any, params?: any, reqOpts?: any, includeCredentials?: boolean) {
    // Retrieve the JWT token and additional token from storage
    const jwtToken = sessionStorage.getItem('AUTH') || '';

    // If request options aren't provided, set default headers and params
    if (!reqOpts) {
      reqOpts = {
        headers: new HttpHeaders({
          'Authorization': jwtToken,  // Setting up the Authorization Header

        }),
        params: new HttpParams(),
      };
    } else {
      // If headers exist, append the Authorization header, otherwise create headers
      reqOpts.headers = reqOpts.headers
        ? reqOpts.headers.set('Authorization', 'Bearer ' + jwtToken)
        : new HttpHeaders({ 'Authorization': 'Bearer ' + jwtToken });
    }

    // If params are provided, append them to the HttpParams object
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    // Only set `withCredentials` if `includeCredentials` is explicitly provided
    if (includeCredentials !== undefined) {
      reqOpts.withCredentials = includeCredentials;
    }


    return this.httpClient.post(this.url + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.httpClient.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.httpClient.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.httpClient.patch(this.url + '/' + endpoint, body, reqOpts);
  }

  private roleKey = 'logIn';

  setRole(role: string): void {
    sessionStorage.setItem(this.roleKey, role);
  }

  getRole(): string {
    return sessionStorage.getItem(this.roleKey) || '';
  }

  clearRole(): void {
    sessionStorage.removeItem(this.roleKey);
  }
}
