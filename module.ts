import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from './src/app/graph/graph/graph.component';

@NgModule({
  imports: [ CommonModule ],
  exports: [ GraphComponent ],
  declarations: [ GraphComponent ]
})
export class GraphModule { }
