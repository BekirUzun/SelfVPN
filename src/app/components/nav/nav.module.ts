import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav.component';
import { NbButtonModule, NbIconModule, NbLayoutColumnComponent } from '@nebular/theme';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavComponent,
  ],
  imports: [
    CommonModule,
    NbButtonModule,
    RouterModule,
    NbIconModule,
  ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
