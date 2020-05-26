import {
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from "@angular/core";
import { isObservable, Observable, Subscription } from "rxjs";
import { SubscriptionService } from "./subscription.service";

interface Context {
  [key: string]: any;
}

interface Streams {
  [key: string]: Observable<any>;
}

export class SubscribeContext {
  public $implicit?: Context = null;
}

@Directive({
  selector: "[ngSubscribe]",
  exportAs: "ngSubscribe",
  providers: [SubscriptionService]
})
export class NgSubscribeDirective implements OnInit {
  private context = new SubscribeContext();
  private streams: Streams = {};
  private subscriptions = new Map<string, Subscription>();
  private viewRef: EmbeddedViewRef<any>;

  get value() {
    return this.context.$implicit;
  }

  @Input()
  set ngSubscribe(streams: Observable<any> | Streams) {
    if (!streams) {
      this.clearContext([]);
      this.clearStreams();
      this.clearSubscriptions();
      return;
    }

    if (isObservable(streams)) {
      this.clearContext(["$implicit"]);
      this.clearStreams();
      this.clearSubscriptions();
      this.resubscribeToStream("$implicit", streams, {});
      return;
    }

    const keys = Object.keys(streams);
    this.clearContext(["$implicit", ...keys], true);
    keys.forEach(key => {
      if (streams[key] === this.streams[key]) return;

      this.streams[key] = streams[key];
      this.resubscribeToStream(key, streams[key], this.context.$implicit!);
    });
  }

  constructor(
    private sub: SubscriptionService,
    private cdRef: ChangeDetectorRef,
    private vcRef: ViewContainerRef,
    private tempRef: TemplateRef<any>
  ) {}

  private clearContext(keysToKeep: string[], resetImplicitContext?: boolean) {
    Object.keys(this.context).forEach(key => {
      if (keysToKeep.indexOf(key) < 0) this.context[key] = undefined;
    });

    if (resetImplicitContext) {
      this.context.$implicit = {};
      Object.keys(this.context.$implicit).forEach(key => {
        if (keysToKeep.indexOf(key) < 0)
          this.context.$implicit![key] = undefined;
      });
    }
  }

  private clearStreams() {
    this.streams = {};
  }

  private clearSubscriptions() {
    const unsubscribe = this.sub.unsubscribe.bind(this.sub);
    this.subscriptions.forEach(unsubscribe);
    this.subscriptions.clear();
  }

  private resubscribeToStream(
    key: string,
    stream: Observable<any>,
    implicit: Context
  ) {
    this.sub.unsubscribe(this.subscriptions.get(key));

    const subscription = this.sub.subscribe(stream, (value: any) => {
      implicit[key] = value;
      this.context[key] = value;
      this.viewRef ? this.viewRef.detectChanges() : void 0;
    });

    this.subscriptions.set(key, subscription);
  }

  ngOnDestroy() {
    if (this.viewRef) this.viewRef.destroy();
  }

  ngOnInit() {
    this.viewRef = this.vcRef.createEmbeddedView(this.tempRef, this.context);
  }
}
