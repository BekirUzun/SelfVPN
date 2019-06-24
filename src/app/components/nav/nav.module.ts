import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav.component';
import { RouterModule } from '@angular/router';
// import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  declarations: [
    NavComponent,
    RouterModule
  ],
  imports: [
    CommonModule,
    // NbEvaIconsModule
  ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
