import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-container',
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss']
})
export class ModalContainerComponent implements OnDestroy {
  destroy = new Subject<any>();

  constructor(
    router: Router
  ) {

  }

  ngOnDestroy() {
    this.destroy.next();
  }

}
