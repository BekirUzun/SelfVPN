import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { NbButtonModule, NbInputModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    NbButtonModule,
    NbInputModule,
    FormsModule
  ],
  exports: [
    SettingsComponent
  ]
})
export class SettingsModule { }
