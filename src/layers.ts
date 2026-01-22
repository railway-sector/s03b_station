import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import {
  SimpleMarkerSymbol,
  LabelSymbol3D,
  MeshSymbol3D,
  FillSymbol3DLayer,
  TextSymbol3DLayer,
  SimpleLineSymbol,
} from "@arcgis/core/symbols";
import BuildingSceneLayer from "@arcgis/core/layers/BuildingSceneLayer";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import CustomContent from "@arcgis/core/popup/content/CustomContent";
import PopupTemplate from "@arcgis/core/PopupTemplate";

export const dateTable = new FeatureLayer({
  portalItem: {
    id: "b2a118b088a44fa0a7a84acbe0844cb2",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
});
/* Chainage Layer  */
const labelChainage = new LabelClass({
  labelExpressionInfo: { expression: "$feature.KmSpot" },
  symbol: {
    type: "text",
    color: [85, 255, 0],
    haloColor: "black",
    haloSize: 0.5,
    font: {
      size: 15,
      weight: "bold",
    },
  },
});

const chainageRenderer = new SimpleRenderer({
  symbol: new SimpleMarkerSymbol({
    size: 5,
    color: [255, 255, 255, 0.9],
    outline: {
      width: 0.2,
      color: "black",
    },
  }),
});

export const chainageLayer = new FeatureLayer({
  portalItem: {
    id: "e09b9af286204939a32df019403ef438",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 2,
  title: "Chainage",
  elevationInfo: {
    mode: "relative-to-ground",
  },
  labelingInfo: [labelChainage],
  minScale: 150000,
  maxScale: 0,
  renderer: chainageRenderer,
  popupEnabled: false,
});

// * Pier No layer * //
const pierNoLabelClass = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: "white",
        },
        size: 10,
        halo: {
          color: "black",
          size: 1,
        },
        font: {
          family: "Ubuntu Mono",
        },
      }),
    ],
    verticalOffset: {
      screenLength: 40,
      maxWorldLength: 100,
      minWorldLength: 20,
    },
    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: "white",
      size: 0.7,
      border: {
        color: "grey",
      },
    },
  }),
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: "$feature.PIER",
    //value: "{TEXTSTRING}"
  },
});

export const pierNoLayer = new FeatureLayer({
  portalItem: {
    id: "e09b9af286204939a32df019403ef438",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 3,
  labelingInfo: [pierNoLabelClass],
  elevationInfo: {
    mode: "on-the-ground", //absolute-height, relative-to-ground
  },
  title: "Pier No",
  popupEnabled: false,
});

// * PROW *//
const prowRenderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "#ff0000",
    width: "2px",
  }),
});

export const prowLayer = new FeatureLayer({
  url: "https://gis.railway-sector.com/server/rest/services/SC_Alignment/FeatureServer/5",
  title: "ROW",
  popupEnabled: false,
  renderer: prowRenderer,
});

// * Station Layer * //
const stationLayerTextSymbol = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: "#d4ff33",
        },
        size: 13,
        halo: {
          color: "black",
          size: 0.5,
        },
        font: {
          family: "Ubuntu Mono",
        },
      }),
    ],
    verticalOffset: {
      screenLength: 70,
      maxWorldLength: 100,
      minWorldLength: 50,
    },
    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: "white",
      size: 0.7,
      border: {
        color: "grey",
      },
    },
  }),
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: 'DefaultValue($feature.Station, "no data")',
    //value: "{TEXTSTRING}"
  },
});

export const stationLayer = new FeatureLayer({
  portalItem: {
    id: "e09b9af286204939a32df019403ef438",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 6,
  title: "Station",
  labelingInfo: [stationLayerTextSymbol],
  elevationInfo: {
    mode: "relative-to-ground",
  },
});
stationLayer.listMode = "hide";

/* Building Scene Layer for station structures */
export const buildingLayer = new BuildingSceneLayer({
  portalItem: {
    id: "f9387908df044a8aba99608333bf9f86",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  title: "Station Structure",
  legendEnabled: false,
});

// Discipline: Architectural
export let floorsLayer: null | any;
export let wallsLayer: null | any;
export let roomsLayer: null | any;
export let genericLayer: null | any;
export let siteLayer: null | any;
export let stairsLayer: null | any;
export let stairsRailingLayer: null | any;

// Discipline: Structural
export let stFramingLayer: null | any;
export let stColumnLayer: null | any;
export let stFoundationLayer: null | any;
export let exteriorShellLayer: null | any;

let architecturalDiscipline: null | any;
let structuralDiscipline: null | any;

const customContentLot = new CustomContent({
  outFields: ["*"],
  creator: (event: any) => {
    // Extract AsscessDate of clicked pierAccessLayer
    // const cps = event.graphic.attributes["CP"];
    const status = event.graphic.attributes["Status"];
    const category = event.graphic.attributes["Category"];
    const component = event.graphic.attributes["Component"];
    const end_date = event.graphic.attributes["t01__End_Date"];

    return `
    <div style='line-height: 1.7'>
      <ul>
        <li>Status: <span style='color: #ffffff; font-weight: bold'>${
          status === 1 ? "Incomplete" : status === 4 ? "Completed" : "Unknown"
        }</span></li>
        <li>Category: <span style='color: #ffffff; font-weight: bold'>${category}</span></li>
        <li>Component: <span style='color: #ffffff; font-weight: bold'>${
          component === "UG"
            ? "Underground"
            : component === "ATG"
              ? "Aboveground"
              : "Unknown"
        }</span></li>
        <li>End Date: <span style='color: #ffffff; font-weight: bold'>${
          end_date ? end_date : ""
        }</span></li>
      </ul>
    </div>
              `;
  },
});

const popupTemplate = new PopupTemplate({
  title: "<div style='color: #eaeaea'><b>{Types}</b></div>",
  lastEditInfoEnabled: false,
  content: [customContentLot],
});

const colorStatus = [
  [225, 225, 225, 0.1], // To be Constructed (white)
  [211, 211, 211, 0.5], // Under Construction
  [255, 0, 0, 0.8], // Delayed
  [0, 112, 255, 0.8], // Completed
];

const rendererNotMonitoring = new SimpleRenderer({
  symbol: new MeshSymbol3D({
    symbolLayers: [
      new FillSymbol3DLayer({
        material: {
          color: [255, 255, 155, 0.3],
          colorMixMode: "replace",
        },
        edges: new SolidEdges3D({
          color: [255, 255, 155, 0.3],
        }),
      }),
    ],
  }),
});

const renderer = new UniqueValueRenderer({
  field: "Status",
  // defaultSymbol: new MeshSymbol3D({
  //   symbolLayers: [
  //     new FillSymbol3DLayer({
  //       material: {
  //         color: [225, 225, 225, 0],
  //         colorMixMode: "replace",
  //       },
  //       edges: new SolidEdges3D({
  //         color: [225, 225, 225, 0],
  //       }),
  //     }),
  //   ],
  // }),
  uniqueValueInfos: [
    {
      value: 1,
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: colorStatus[0],
              colorMixMode: "replace",
            },
            edges: new SolidEdges3D({
              color: [225, 225, 225, 0.3],
            }),
          }),
        ],
      }),
    },
    // {
    //   value: 2,
    //   symbol: new MeshSymbol3D({
    //     symbolLayers: [
    //       new FillSymbol3DLayer({
    //         material: {
    //           color: colorStatus[1],
    //           colorMixMode: "replace",
    //         },
    //         edges: new SolidEdges3D({
    //           color: [225, 225, 225, 0.3],
    //         }),
    //       }),
    //     ],
    //   }),
    // },
    {
      value: 4,
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: colorStatus[3],
              colorMixMode: "replace",
            },
            edges: new SolidEdges3D({
              color: [225, 225, 225, 0.3],
            }),
          }),
        ],
      }),
    },
  ],
});

buildingLayer.when(() => {
  buildingLayer.allSublayers.forEach((layer: any) => {
    switch (layer.modelName) {
      case "FullModel":
        layer.visible = true;
        break;

      case "Overview":
        exteriorShellLayer = layer;
        exteriorShellLayer.visible = false;
        exteriorShellLayer.title = "Exterior Shell";
        exteriorShellLayer.renderer = rendererNotMonitoring;
        break;

      case "Architectural":
        architecturalDiscipline = layer;
        architecturalDiscipline.visible = true;
        architecturalDiscipline.title = "Architectural";
        break;

      case "Structural":
        structuralDiscipline = layer;
        structuralDiscipline.visible = true;
        structuralDiscipline.title = "Structural";
        break;

      case "Floors":
        floorsLayer = layer;
        floorsLayer.popupTemplate = popupTemplate;
        floorsLayer.title = "Floors";
        floorsLayer.definitionExpression = "Component = 'UG'";
        floorsLayer.renderer = renderer;
        //excludedLayers
        break;

      case "Walls":
        wallsLayer = layer;
        wallsLayer.popupTemplate = popupTemplate;
        wallsLayer.title = "Walls";
        wallsLayer.definitionExpression = "Component = 'UG'";
        wallsLayer.renderer = renderer;
        break;

      case "GenericModel":
        genericLayer = layer;
        genericLayer.popupTemplate = popupTemplate;
        genericLayer.title = "GenericModel";
        genericLayer.renderer = rendererNotMonitoring;
        break;

      case "Rooms":
        roomsLayer = layer;
        roomsLayer.popupTemplate = popupTemplate;
        roomsLayer.title = "Rooms (not monitoring)";
        roomsLayer.visible = false;
        roomsLayer.definitionExpression = "Component = 'UG'"; // default
        roomsLayer.renderer = rendererNotMonitoring;
        break;

      case "Site":
        siteLayer = layer;
        siteLayer.popupTemplate = popupTemplate;
        siteLayer.title = "Site";
        siteLayer.definitionExpression = "Component = 'UG'"; // default
        siteLayer.renderer = renderer;
        break;

      case "Stairs":
        stairsLayer = layer;
        stairsLayer.popupTemplate = popupTemplate;
        stairsLayer.title = "Stairs (not monitoring)";
        stairsLayer.visible = false;
        stairsLayer.definitionExpression = "Component = 'UG'"; // default
        stairsLayer.renderer = rendererNotMonitoring;
        break;

      case "StairsRailing":
        stairsRailingLayer = layer;
        stairsRailingLayer.popupTemplate = popupTemplate;
        stairsRailingLayer.title = "StairsRailing (not monitoring)";
        stairsRailingLayer.visible = false;
        stairsRailingLayer.definitionExpression = "Component = 'UG'"; // default
        stairsRailingLayer.renderer = rendererNotMonitoring;
        break;

      case "StructuralFraming":
        stFramingLayer = layer;
        stFramingLayer.popupTemplate = popupTemplate;
        stFramingLayer.title = "Structural Framing";
        stFramingLayer.definitionExpression = "Component = 'UG'"; // default
        stFramingLayer.renderer = renderer;
        break;

      case "StructuralColumns":
        stColumnLayer = layer;
        stColumnLayer.popupTemplate = popupTemplate;
        stColumnLayer.title = "Structural Columns";
        stColumnLayer.definitionExpression = "Component = 'UG'"; // default
        stColumnLayer.renderer = renderer;
        break;

      case "StructuralFoundation":
        stFoundationLayer = layer;
        stFoundationLayer.popupTemplate = popupTemplate;
        stFoundationLayer.title = "Structural Foundation";
        stFoundationLayer.definitionExpression = "Component = 'UG'"; // default
        stFoundationLayer.renderer = renderer;
        break;

      default:
        layer.visible = false;
    }
  });
});

export const alignmentGroupLayer = new GroupLayer({
  title: "Alignment",
  visible: true,
  visibilityMode: "independent",
  layers: [chainageLayer, pierNoLayer, prowLayer], //stationLayer,
});
