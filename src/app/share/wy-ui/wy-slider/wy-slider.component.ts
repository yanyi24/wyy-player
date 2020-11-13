import { DOCUMENT } from '@angular/common';
import { 
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  Input,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { tap, filter, pluck, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { inArray } from 'src/app/utils/array';
import { getPercent, limitNumberInRange } from 'src/app/utils/number';
import { getElementOffset, sliderEvent } from './wy-slider-helper';
import { SliderEventObserverConfig, SliderValue } from './wy-slider-types';
@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WySliderComponent),
    multi: true
  }]
})
export class WySliderComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('wySlider', {static: true}) private wySlider: ElementRef;
  @Input() wyVertical = false;
  @Input() wyMin = 0;
  @Input() wyMax = 100;
  @Input() bufferOffset: SliderValue = 0;

  private sliderDom: HTMLDivElement;

  private dragStart$: Observable<number>;
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;
  private unDragStart: Subscription | null;
  private unDragMove: Subscription | null;
  private unDragEnd: Subscription | null;

  private isDragging = false;

  public value: SliderValue = null;
  public offset: SliderValue = null;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.sliderDom = this.wySlider.nativeElement;
    this.creatDraggingObservables();
    this.subscribeDrag(['start']);
  }
  private creatDraggingObservables(): void{
    const orientField = this.wyVertical ? 'pageY' : 'pageX';
    const mouse: SliderEventObserverConfig = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup',
      filter: (e: MouseEvent) => e instanceof MouseEvent,
      pluckKey: [orientField]
    };
    const touch: SliderEventObserverConfig = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend',
      filter: (e: TouchEvent) => e instanceof TouchEvent,
      pluckKey: ['touches', '0', orientField]
    };
    [mouse, touch].forEach(item => {
      const { start, move, end, filter: filterFunc, pluckKey } = item;
      item.startPlucked$ = fromEvent(this.sliderDom, start).pipe(
        filter(filterFunc),
        tap(sliderEvent),
        pluck(...pluckKey),
        map((position: number) => this.findClosetValue(position))
      );
      item.end$ = fromEvent(this.doc, end);
      item.moveResolved$ = fromEvent(this.doc, move).pipe(
        filter(filterFunc),
        tap(sliderEvent),
        pluck(...pluckKey),
        distinctUntilChanged(),
        map((position: number) => this.findClosetValue(position)),
        takeUntil(item.end$)
      );
    });
    this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  private subscribeDrag(events: string[] = ['start', 'move', 'end']): void{
    if (inArray(events, 'start') && this.dragStart$ && !this.unDragStart) {
      this.unDragStart = this.dragStart$.subscribe(this.onDragStart.bind(this));
    }
    if (inArray(events, 'move') && this.dragMove$ && !this.unDragMove) {
      this.unDragMove = this.dragMove$.subscribe(this.onDragMove.bind(this));
    }
    if (inArray(events, 'end') && this.dragEnd$ && !this.unDragEnd) {
      this.unDragEnd = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
    }
  }
  private unsubscribeDrag(events: string[] = ['start', 'move', 'end']): void{
    if (inArray(events, 'start') && this.unDragStart) {
      this.unDragStart.unsubscribe();
      this.unDragStart = null;
    }
    if (inArray(events, 'move') && this.unDragMove) {
      this.unDragMove.unsubscribe();
      this.unDragMove = null;
    }
    if (inArray(events, 'end') && this.unDragEnd) {
      this.unDragEnd.unsubscribe();
      this.unDragEnd = null;
    }
  }
  private onDragStart(value: number): void {
    this.toggleDragMoving(true);
    this.setValue(value);
  }
  private onDragMove(value: number): void {
    if (this.isDragging) {
      this.setValue(value);
      this.cdr.markForCheck();
    }
  }
  private onDragEnd(): void {
    this.toggleDragMoving(false);
    this.cdr.markForCheck();
  }
  private setValue(value: SliderValue, needCheck = false): void {
    if (needCheck) {
      if (this.isDragging) { return; }
      this.value = this.formatValue(value);
      this.updateTrackAndHandles();
    } else if (!this.valuesEqual(this.value, value)) {
      this.value = value;
      this.updateTrackAndHandles();
      this.onValueChange(this.value);
    }
  }
  private formatValue(value: SliderValue): SliderValue {
    let res = value;
    if (this.assertValueValid(value)) {
      res = this.wyMin;
    } else {
      res = limitNumberInRange(value, this.wyMin, this.wyMax);
    }
    return res;
  }
  // 判断是否是NAN
  private assertValueValid(value: SliderValue): boolean {
    return isNaN(typeof value !== 'number' ? parseFloat(value) : value);
  }
  private valuesEqual(oldValue: SliderValue, newValue: SliderValue): boolean {
    if (typeof oldValue !== typeof newValue) {
      return false;
    }
    return oldValue === newValue;
  }
  private updateTrackAndHandles(): void {
    this.offset = this.getValueToOffset(this.value);
    this.cdr.markForCheck();
  }
  private getValueToOffset(value: SliderValue): SliderValue {
    return getPercent(value, this.wyMin, this.wyMax);
  }
  private toggleDragMoving(movable: boolean): void{
    this.isDragging = movable;
    if (movable) {
      this.subscribeDrag(['move', 'end']);
    } else {
      this.unsubscribeDrag(['move', 'end']);
    }
  }
  private findClosetValue(position: number): number {
    const sliderLength = this.getSliderLength();
    const sliderStart = this.getSliderStartPosition();
    const ratio = limitNumberInRange((position - sliderStart) / sliderLength, 0, 1);
    const ratioTrue = this.wyVertical ? 1 - ratio : ratio;
    return ratioTrue * (this.wyMax - this.wyMin) + this.wyMin;
  }
  private getSliderLength(): number {
    return this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;
  }
  private getSliderStartPosition(): number {
    const offset = getElementOffset(this.sliderDom);
    return this.wyVertical ? offset.top : offset.left;
  }

  private onValueChange(value: SliderValue): void {

  }
  private onTouched(): void {

  }

  writeValue(value: SliderValue): void {
    this.setValue(value, true);
  }
  registerOnChange(fn: (value: SliderValue) => void): void {
    this.onValueChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }


  ngOnDestroy(): void {
    this.unsubscribeDrag();
  }
}
