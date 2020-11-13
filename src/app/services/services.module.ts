import { InjectionToken, NgModule } from '@angular/core';

export const API_CONFIG = new InjectionToken('ApiConfigToken');


@NgModule({
  declarations: [],
  imports: [
  ],
  providers: [
    { provide: API_CONFIG, useValue: 'http://yanyi24.cn:4000/' }
  ]
})
export class ServicesModule { }
