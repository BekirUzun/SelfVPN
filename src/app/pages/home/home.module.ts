import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { NavModule } from '../../components/nav/nav.module';
import { NavComponent } from '../../components/nav/nav.component';

@NgModule({
  declarations: [
    HomeComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
