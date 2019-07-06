import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { NbButtonModule, NbSpinnerModule, NbSelectModule } from '@nebular/theme';
import { LogDisplayModule } from '../../components/log-display/log-display.module';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { ConfigService } from '../../providers/config-service/config.service';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    NbButtonModule,
    NbSpinnerModule,
    LogDisplayModule,
    NbSelectModule,
    FormsModule,
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
