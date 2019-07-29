import { Component, ChangeDetectionStrategy } from '@angular/core';
import { interval, of, from } from 'rxjs';

@Component({
  selector: 'my-app',
  template: `
    <ul *ngSubscribe="streams; immediate$ as i; counter$ as c; promise$ as p">
      <li>{{ i }}</li>
      <li>{{ c }}</li>
      <li>{{ p }}</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent  {
  immediate$ = of('immediate');

  counter$ = interval(1000);
  
  promise$ = from(
    new Promise(
      resolve => setTimeout(() => resolve('Resolved'), 3000)
    )
  );

  streams = {
    immediate$: this.immediate$,
    counter$: this.counter$,
    promise$: this.promise$
  };
}
