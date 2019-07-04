import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { NbButtonModule, NbInputModule, NbCardModule, NbTooltipModule, NbSpinnerModule } from '@nebular/theme';
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
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
