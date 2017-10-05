import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from './src/app/graph/graph/graph.component';
import { GraphService } from './src/app/graph/graph.service';

@NgModule({
  imports: [ CommonModule ],
  exports: [ GraphComponent ],
  declarations: [ GraphComponent ]
})
export class GraphModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GraphModule,
      providers: [ GraphService ]
    };
  }
}
