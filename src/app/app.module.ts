import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NgSubscribeDirective } from './ng-subscribe.directive';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, NgSubscribeDirective ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
