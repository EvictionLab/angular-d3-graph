import { GraphElement } from './graph-element';

export class GraphLine extends GraphElement {

    constructor(public container, public data) {
        super(container, () => {});
    }

//     const selection = container.selectAll('.line')
//     .data(this.data)
//     .enter().append('path')
//         .attr('class', (d, i) => 'line line-' + i)
//         .attr('d', line()
//             .defined((d: any) => !isNaN(d[this.settings.props.y]))
//             .x((d: any, index: any, da: any) => {
//                 console.log('w', d.x, this.scales.x(d.x));
//                 return this.scales.x(d.x);
//             })
//             .y((d: any) => this.scales.y(d[this.settings.props.y]))
//         );
// const render = (transform = zoomIdentity) => {
//     selection.attr('transform', 'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');
//     selection.attr('vector-effect', 'non-scaling-stroke');
// };
// return new GraphElement(selection, render);
    enter() {}

    update() {}

    exit() {}
}
