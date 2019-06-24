import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavComponent,
    RouterModule
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
