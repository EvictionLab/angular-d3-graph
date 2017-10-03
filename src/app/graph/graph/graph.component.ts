import { Component, OnInit, ElementRef, EventEmitter, ViewChild, HostListener, Input, Output, AfterViewInit, OnChanges } from '@angular/core';

import { Graph } from '../graph';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('graphContainer') element: ElementRef;
  @Input() settings;
  @Input() data;
  @Input() x1;
  @Input() x2;
  @Output() hoveredData = new EventEmitter();
  @Output() clickedData = new EventEmitter();
  graph: Graph;

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnChanges(changes) {
    if (changes.data && this.element) {
      if (this.graph) {
        this.graph.update(changes.data.currentValue);
      } else {
        this.graph = new Graph(this.element.nativeElement, changes.data.currentValue, this.settings);
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
    const hoveredValues = this.graph.getValueAtPosition(e.offsetX);
    this.hoveredData.emit(hoveredValues);
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    const clickedValues = this.graph.getValueAtPosition(e.offsetX);
    this.clickedData.emit(clickedValues);
  }

}
