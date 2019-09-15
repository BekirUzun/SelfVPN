import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { NbButtonModule, NbInputModule, NbCardModule, NbTooltipModule, NbToggleModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    NbButtonModule,
    NbInputModule,
    FormsModule,
    NbCardModule,
    NbTooltipModule,
    NbToggleModule,
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
