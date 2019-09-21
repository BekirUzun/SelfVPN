import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';
import { WebviewDirective } from './directives/webview.directive';
import { AppComponent } from './app.component';
import { LogDisplayModule } from './components/log-display/log-display.module';
import { DialogModule } from './components/dialog/dialog.module';
import { DialogComponent } from './components/dialog/dialog.component';
import { NavModule } from './components/nav/nav.module';

import { HomeModule } from './pages/home/home.module';
import { SettingsModule } from './pages/settings/settings.module';

import { NbThemeModule, NbLayoutModule, NbWindowModule, NbSpinnerModule,
  NbButtonModule, NbIconModule, NbDialogModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    HomeModule,
    SettingsModule,
    LogDisplayModule,
    DialogModule,
    NavModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    NgbModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbWindowModule.forRoot({
      closeOnBackdropClick: true
    }),
    NbSpinnerModule,
    NbButtonModule,
    NbIconModule,
    NbDialogModule.forRoot(),
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule { }
