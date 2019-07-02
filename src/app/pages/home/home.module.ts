import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { LogDisplayModule } from '../../components/log-display/log-display.module';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    NbButtonModule,
    NbSpinnerModule,
    LogDisplayModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
