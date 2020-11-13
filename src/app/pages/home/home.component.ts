import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import {
  Banner,
  HotTag,
  Singer,
  SongSheet
} from 'src/app/services/data-types/common.types';
import { SheetService } from 'src/app/services/sheet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  public banners: Banner[];
  public hotTags: HotTag[];
  public songSheetList: SongSheet[];
  public singers: Singer[];

  constructor(
    private route: ActivatedRoute,
    private sheetService: SheetService,
  ) {
    this.route.data.pipe(map((data) => data.homeDatas)).subscribe(([banners, hotTags, songSheetList, singers]) => {
      this.banners = banners;
      this.hotTags = hotTags;
      this.songSheetList = songSheetList;
      this.singers = singers;
    });
  }

  ngOnInit(): void {
  }
  onPlaySheet(id: number): void{
    this.sheetService.playSheet(id).subscribe(res => {
      console.log(res);
      
    });
  }
}
