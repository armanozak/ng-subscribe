import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { interval, of, from } from "rxjs";

@Component({
  selector: "my-app",
  template: `
    <ul *ngSubscribe="streams; immediate as i; counter as c; promise as p">
      <li>{{ i }}</li>
      <li>{{ c }}</li>
      <li>{{ p }}</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  immediate$ = of("Immediate");

  counter$ = interval(1000);

  promise$ = from(
    new Promise(resolve => setTimeout(() => resolve("Resolved"), 3000))
  );

  get streams() {
    console.warn("CHECKED");

    return {
      immediate: this.immediate$,
      counter: this.counter$,
      promise: this.promise$
    };
  }

  constructor(cdRef: ChangeDetectorRef) {
    setTimeout(() => {
      this.immediate$ = of("Changed");
      cdRef.markForCheck();
    }, 5000);
  }
}
