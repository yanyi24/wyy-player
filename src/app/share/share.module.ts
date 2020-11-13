import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { WyUiModule } from './wy-ui/wy-ui.module';
import { PlayCountPipe } from './play-count.pipe';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    WyUiModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzLayoutModule,
    NzMenuModule,
    NzPageHeaderModule,
    NzCarouselModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    WyUiModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzLayoutModule,
    NzMenuModule,
    NzPageHeaderModule,
    NzCarouselModule
  ],
})
export class ShareModule { }
