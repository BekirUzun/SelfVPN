import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    NbButtonModule,
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
