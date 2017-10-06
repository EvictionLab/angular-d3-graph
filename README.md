# Angular D3 Graph

Component for rendering a line graph or bar graph.

## Usage

```
npm install angular-d3-graph
```

Import it into app.module.ts (or whichever module you want to use)
```ts
import { GraphModule } from 'angular-d3-graph/module';

@NgModule({
  ...
  imports: [
    ...
    GraphModule
    ...
  ],
  ...
})
```

Add it into your component template:
```html
  <app-graph 
    [data]="data" 
    [settings]="settings"
    [x1]="start"
    [x2]="end"
    (activeValuesChanged)="logEvent($event)"
  ></app-graph>
```

## Inputs

### Data
Data can be formatted in two ways, one for line graphs and one for bar graphs.

Line Graph:
```ts
[{
    "id": string // each line has an ID so updates apply correctly
    "data": [
        ...
        { "x": number, "y": number } // array of data objects with X and Y values
        ...
    ]
}]
```

Bar Graph:
```ts
[{
    "id": string // each line has an ID so updates apply correctly
    "data": [{ "x": string, "y": number }] // data array has only one value for bar graphs
}]
```

### Settings
You can provide your own settings object overrides to the settings input on the component.

Default settings are as follows:
```ts
{
    props: { 
        x: 'x', // the name of the X property in the data objects
        y: 'y' // the name of the Y property in the data objects
    },
    margin: { left: 40, right: 10, top: 10, bottom: 40 }, // margins around the graph space
    axis: {
        x: {
            position: 'bottom', // controls if the x axis appears on the top or bottom of the graph
            label: 'x', // the label for the x axis
            ticks: 5,  // number of ticks on the x axis
            tickSize: 5, // how long the ticks are for the x axis
            tickFormat: ',.0f', // formating for the tick labels
            invert: false // reverse the x axis
        },
        y: { 
            position: 'left', // controls if the y axis appears on the left or right of the graph
            label: 'y', // the label for the y axis
            ticks: 5, // number of ticks on the y axis
            tickSize: 5, // how long the ticks are for the y axis 
            tickFormat: ',.0f', // formating for the Y tick labels
            invert: false // reverse the Y axis
        }
    },
    transition: { 
        ease: easePoly, // ease function to use for transitions
        duration: 1000 // amount of time in milliseconds for transitions between data
    },
    zoom: { 
        enabled: false, // enables scroll / pinch to zoom x axis
        min: 1, // minimum allowed zoom level
        max: 10 // maximum allowed zoom level
    }
};
```

### x1 and x2
The x1 and x2 inputs are used for adjusting the view of the line graph to show from x1 to x2.

## Outputs

### `activeValuesChanged`

`$event` contains an array of all of the lines, or the selected bar and their x / y values based on the mouse position on hover, the touch location, or the positon navigated to by keyboard.
