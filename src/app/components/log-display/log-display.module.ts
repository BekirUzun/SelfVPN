import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogDisplayComponent } from './log-display.component';

@NgModule({
  declarations: [
    LogDisplayComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LogDisplayComponent
  ],
  entryComponents: [
    LogDisplayComponent
  ]
})
export class LogDisplayModule { }
