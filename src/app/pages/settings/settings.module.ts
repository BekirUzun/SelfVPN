import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    NbButtonModule
  ],
  exports: [
    SettingsComponent
  ]
})
export class SettingsModule { }
