import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { NgSubscribeDirective } from "./ng-subscribe.directive";

@NgModule({
  imports: [BrowserModule, CommonModule],
  declarations: [AppComponent, NgSubscribeDirective],
  bootstrap: [AppComponent]
})
export class AppModule {}
