import { Injectable, OnDestroy } from "@angular/core";
import { Observable, PartialObserver, Subscription } from "rxjs";

@Injectable()
export class SubscriptionService implements OnDestroy {
  private subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  subscribe<T extends any>(
    source$: Observable<T>,
    next?: (value: T) => void,
    error?: (error: any) => void
  ): Subscription;
  subscribe<T extends any>(
    source$: Observable<T>,
    observer?: PartialObserver<T>
  ): Subscription;
  subscribe<T extends any>(
    source$: Observable<T>,
    nextOrObserver?: PartialObserver<T> | Next<T>,
    error?: Err<T>
  ): Subscription {
    const subscription = source$.subscribe(nextOrObserver as Next<T>, error);
    this.subscription.add(subscription);
    return subscription;
  }

  unsubscribe(subscription: Subscription | undefined | null) {
    if (!subscription) return;
    this.subscription.remove(subscription);
  }

  unsubscribeAll() {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
  }
}

type Next<T> = (value: T) => void;
type Err<T> = (error: any) => void;
