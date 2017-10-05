import { Component, ElementRef, EventEmitter, ViewChild, HostListener, Input, Output, OnChanges } from '@angular/core';

import { GraphService } from '../graph.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
  providers: [ GraphService ]
})
export class GraphComponent implements OnChanges {
  @ViewChild('graphContainer') element: ElementRef;
  @Input() settings;
  @Input() data;
  @Input() x1;
  @Input() x2;
  @Output() lineGraphHover = new EventEmitter();
  @Output() lineGraphClick = new EventEmitter();
  @Output() barGraphHover;
  @Output() barGraphClick;

  constructor(public graph: GraphService) {
    this.barGraphHover = this.graph.barHover;
    this.barGraphClick = this.graph.barClick;
  }

  ngOnChanges(changes) {
    if (changes.data && this.element) {
      if (this.graph.isCreated()) {
        this.graph.update(changes.data.currentValue);
      } else {
        this.graph = this.graph.create(this.element.nativeElement, changes.data.currentValue, this.settings);
      }
    }
    if ((changes.x1 || changes.x2) && this.element && (this.x1 && this.x2)) {
      this.graph.setVisibleRange(this.x1, this.x2);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(e) {
    this.graph.setDimensions().updateView('no-transition');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e) {
    if (this.graph.isLineGraph()) {
      const hoveredValues = this.graph.getValueAtPosition(e.offsetX);
      this.lineGraphHover.emit(hoveredValues);
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e) {
    if (e.touches && e.touches.length === 1 && this.graph.isLineGraph()) {
      const hoveredValues = this.graph.getValueAtPosition(e.touches[0].offsetX);
      this.lineGraphHover.emit(hoveredValues);
    }
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    if (this.graph.isLineGraph()) {
      const clickedValues = this.graph.getValueAtPosition(e.offsetX);
      this.lineGraphClick.emit(clickedValues);
    }
  }

}
