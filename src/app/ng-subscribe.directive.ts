import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from "@angular/core";
import { isObservable, Observable, Subscription } from "rxjs";
import { SubscriptionService } from "./subscription.service";

interface Streams {
  [key: string]: Observable<any>;
}

export class SubscribeContext {
  public $implicit: any = null;
  public ngSubscribe: any = null;
}

@Directive({
  selector: "[ngSubscribe]",
  exportAs: "ngSubscribe",
  providers: [SubscriptionService]
})
export class NgSubscribeDirective implements OnInit {
  private context: SubscribeContext = new SubscribeContext();
  private subscriptions = new Map<string, Subscription>();

  get values() {
    return this.context.ngSubscribe;
  }

  @Input()
  set ngSubscribe(input: Observable<any> | Streams) {
    const streams: Streams = isObservable(input) ? { $implicit: input } : input;

    Object.keys(streams).forEach(key => {
      this.sub.unsubscribe(this.subscriptions.get(key));

      this.sub.subscribe(streams[key], (value: any) => {
        this.context[key] = value;
        this.context.ngSubscribe[key] = value;
        this.cdRef.markForCheck();
      });
    });
  }

  constructor(
    private sub: SubscriptionService,
    private cdRef: ChangeDetectorRef,
    private vcRef: ViewContainerRef,
    private tempRef: TemplateRef<any>
  ) {
    this.context.ngSubscribe = {};
  }

  ngOnInit() {
    this.vcRef.createEmbeddedView(this.tempRef, this.context);
  }
}
