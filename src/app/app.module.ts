import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home.component';
import { FolderComponent } from './components/folder.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HotkeyModule } from 'angular2-hotkeys';
import { Truncate } from './pipes/uriTruncate';
import { AngularSplitModule } from 'angular-split';
import { ScrollingModule } from '@angular/cdk/scrolling';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FolderComponent,
    Truncate
  ],
  imports: [
    BrowserModule,
    AngularSplitModule,
    FormsModule,
    HotkeyModule.forRoot(),
    HttpClientModule,
    FontAwesomeModule,
    ScrollingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]

})
export class AppModule { }
