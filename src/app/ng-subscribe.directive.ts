import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  combineLatest,
  isObservable,
  Observable,
  Subscription,
} from 'rxjs';
import {
  map,
  scan,
  startWith,
} from 'rxjs/operators';
import compare from 'just-compare';

interface Streams {
  [key: string]: Observable<any>;
}

export class SubscribeContext {
  public $implicit: any = null;
  public ngSubscribe: any = null;
}

@Directive({
  selector: '[ngSubscribe]',
  exportAs: 'ngSubscribe',
})
export class NgSubscribeDirective implements OnInit, OnDestroy {
  private context: SubscribeContext = new SubscribeContext();
  private current$: Observable<any>;
  private subscription = new Subscription();

  @Input()
  set ngSubscribe(input: Observable<any> | Streams) {
    const current$ = isObservable(input)
      ? input
      : joinAll(input as Streams);

    if (compare(this.current$, current$))
      return;

    this.ngOnDestroy();
  
    this.current$ = current$;
    
    this.subscription = this.current$.subscribe(value => {
      this.context.ngSubscribe = value;

      if (!isObservable(value))
        Object.keys(value).forEach(key => this.context[key] = value[key]);
      
      this.cdRef.markForCheck();
    });
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private vcRef: ViewContainerRef,
    private tempRef: TemplateRef<any>,
  ) {}

  ngOnInit() {
    this.vcRef.createEmbeddedView(this.tempRef, this.context);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

function joinAll(streams: Streams): Observable<any> {    
  return combineLatest(
    Object.keys(streams).map(
      key => streams[key].pipe(
        startWith(null),
        scan((acc, val) => ({ ...acc, [key]: val }), {}),
      ),
    ),
  ).pipe(
    map(value => Object.assign({}, ...value)),
  );
}
