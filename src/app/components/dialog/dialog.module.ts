import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { NbCardModule, NbButtonModule } from '@nebular/theme';

@NgModule({
  declarations: [
    DialogComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule
  ],
  exports: [
    DialogComponent
  ],
  entryComponents: [
    DialogComponent
  ]
})
export class DialogModule { }
