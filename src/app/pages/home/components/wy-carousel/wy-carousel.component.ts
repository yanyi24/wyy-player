import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { Banner } from 'src/app/services/data-types/common.types';

@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyCarouselComponent implements OnInit {
  @ViewChild('dot', { static: true }) dotRef: TemplateRef<any>;
  @ViewChild(NzCarouselComponent, {static: true}) private nzCarousel: NzCarouselComponent;
  @Input() banners: Banner[] = [];
  public activeIndex = 0;
  constructor() { }

  ngOnInit(): void {
  }
  onBeforeChange({ to }): void {
    this.activeIndex = to;
  }
  onChangeSlide(type: 'pre' | 'next'): void{
    this.nzCarousel[type]();
  }
}
