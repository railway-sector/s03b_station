/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  buildingLayer,
  floorsLayer,
  stColumnLayer,
  stFoundationLayer,
  stFramingLayer,
  wallsLayer,
  dateTable,
  siteLayer,
} from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import Query from "@arcgis/core/rest/support/Query";

export const construction_status = [
  "To be Constructed",
  "Under Construction",
  "Completed",
];

// Updat date
export async function dateUpdate() {
  const monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const query = dateTable.createQuery();
  query.where =
    "project = 'SC'" + " AND " + "category = 'FTI Station Structure'";

  return dateTable.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const dates = stats.map((result: any) => {
      const date = new Date(result.attributes.date);
      const year = date.getFullYear();
      const month = monthList[date.getMonth()];
      const day = date.getDate();
      const final = year < 1990 ? "" : `${month} ${day}, ${year}`;
      return final;
    });
    return dates;
  });
}

export const stationValue = 18; // FTI

export const buildingLayerCategory_underground = ["D-Wall", "Slab", "Pile"];

export const layerFilterForUnderground = () => {
  stColumnLayer.definitionExpression = "Component = 'UG'";
  stFoundationLayer.definitionExpression = "Component = 'UG'";
  stFramingLayer.definitionExpression = "Component = 'UG'";
  floorsLayer.definitionExpression = "Component = 'UG'";
  wallsLayer.definitionExpression = "Component = 'UG'";
  // roomsLayer.definitionExpression = "Component = 'UG'";
  siteLayer.definitionExpression = "Component = 'UG'";
  // stairsLayer.definitionExpression = "Component = 'UG'";
  // stairsRailingLayer.definitionExpression = "Component = 'UG'";
  // genericLayer.definitionExpression = "Component = 'UG'";
};

export const layerFilterForAboveground = () => {
  stColumnLayer.definitionExpression = "Component = 'ATG'";
  stFoundationLayer.definitionExpression = "Component = 'ATG'";
  stFramingLayer.definitionExpression = "Component = 'ATG'";
  floorsLayer.definitionExpression = "Component = 'ATG'";
  wallsLayer.definitionExpression = "Component = 'ATG'";
  // roomsLayer.definitionExpression = "Component = 'ATG'";
  siteLayer.definitionExpression = "Component = 'ATG'";
  // stairsLayer.definitionExpression = "Component = 'ATG'";
  // stairsRailingLayer.definitionExpression = "Component = 'ATG'";
  // genericLayer.definitionExpression = "Component = 'ATG'";
};

export const layerVisibleTrue = () => {
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;
  stFramingLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  // roomsLayer.visible = true;
  siteLayer.visible = true;
  // stairsLayer.visible = true;
  // stairsRailingLayer.visible = true;
  // genericLayer.visible = true;
  buildingLayer.visible = true;
};

// The following layers do not have fields: "Station", "Status", "Component", "Types"
// 1. stairsRailing
// 2. Rooms
// 3. Stairs
// 4. genericModel

export async function generateChartDataUnderground() {
  const total_incomp_dwall = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'D-Wall') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_dwall",
    statisticType: "sum",
  });

  const total_comp_dwall = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'D-Wall') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_dwall",
    statisticType: "sum",
  });

  const total_incomp_slab = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'Underground Slab') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_slab",
    statisticType: "sum",
  });

  const total_comp_slab = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'Underground Slab') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_slab",
    statisticType: "sum",
  });

  const total_incomp_piles = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'Underground Piles') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_piles",
    statisticType: "sum",
  });

  const total_comp_piles = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'Underground Piles') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_piles",
    statisticType: "sum",
  });

  const query = new Query();
  query.outStatistics = [
    total_incomp_dwall,
    total_comp_dwall,
    total_incomp_slab,
    total_comp_slab,
    total_incomp_piles,
    total_comp_piles,
  ];
  const queryExpression = "Component = 'UG'" + " AND " + "Types IS NOT NULL";

  stColumnLayer.definitionExpression = queryExpression;
  stFoundationLayer.definitionExpression = queryExpression;
  stFramingLayer.definitionExpression = queryExpression;
  floorsLayer.definitionExpression = queryExpression;
  wallsLayer.definitionExpression = queryExpression;
  siteLayer.definitionExpression = queryExpression;

  query.where = queryExpression;
  // layerVisibleTrue();

  const dwall_query = siteLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const total_incomp = stats.total_incomp_dwall;
    const total_comp = stats.total_comp_dwall;
    return [total_incomp, total_comp];
  });

  const ug_slab_query = stFoundationLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_slab;
      const total_comp = stats.total_comp_slab;

      return [total_incomp, total_comp];
    });

  const ug_slab_query2 = floorsLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_slab;
      const total_comp = stats.total_comp_slab;

      return [total_incomp, total_comp];
    });

  const ug_pile_query = stColumnLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_piles;
      const total_comp = stats.total_comp_piles;

      return [total_incomp, total_comp];
    });

  const d_wall = await dwall_query;
  const ug_slab = await ug_slab_query;
  const ug_slab2 = await ug_slab_query2;
  const ug_pile = await ug_pile_query;
  const total =
    d_wall[0] +
    d_wall[1] +
    ug_slab[0] +
    ug_slab[1] +
    ug_slab2[0] +
    ug_slab2[1] +
    ug_pile[0] +
    ug_pile[1];
  const total_comp = d_wall[1] + ug_slab[1] + ug_slab2[1] + ug_pile[1];
  const percent_comp = ((total_comp / total) * 100).toFixed(1);

  const data = [
    {
      category: buildingLayerCategory_underground[0],
      comp: d_wall[1],
      incomp: d_wall[0],
    },
    {
      category: buildingLayerCategory_underground[1],
      comp: ug_slab[1] + ug_slab2[1],
      incomp: ug_slab[0] + ug_slab2[0],
    },
    {
      category: buildingLayerCategory_underground[2],
      comp: ug_pile[1],
      incomp: ug_pile[0],
    },
  ];

  return [data, total_comp, percent_comp];
}

export const buildingLayerCategory_aboveground = [
  "Foundation",
  "Piles",
  "Roof",
  "Beams",
];

export async function generateChartDataAboveground() {
  const total_incomp_foundation = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'Foundation') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_foundation",
    statisticType: "sum",
  });

  const total_comp_foundation = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'Foundation') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_foundation",
    statisticType: "sum",
  });

  const total_incomp_piles = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'Piles') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_piles",
    statisticType: "sum",
  });

  const total_comp_piles = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'Piles') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_piles",
    statisticType: "sum",
  });

  const total_incomp_roof = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'Roof') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_roof",
    statisticType: "sum",
  });

  const total_comp_roof = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'Roof') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_roof",
    statisticType: "sum",
  });

  const total_incomp_beam = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 1 and Types = 'Beam') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp_beam",
    statisticType: "sum",
  });

  const total_comp_beam = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (Status = 4 and Types = 'Beam') THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp_beam",
    statisticType: "sum",
  });

  const query = new Query();
  query.outStatistics = [
    total_incomp_foundation,
    total_comp_foundation,
    total_incomp_piles,
    total_comp_piles,
    total_incomp_roof,
    total_comp_roof,
    total_incomp_beam,
    total_comp_beam,
  ];
  const queryExpression = "Component = 'ATG'" + " AND " + "Types IS NOT NULL";

  stColumnLayer.definitionExpression = queryExpression;
  stFoundationLayer.definitionExpression = queryExpression;
  stFramingLayer.definitionExpression = queryExpression;
  floorsLayer.definitionExpression = queryExpression;
  wallsLayer.definitionExpression = queryExpression;
  siteLayer.definitionExpression = queryExpression;

  query.where = queryExpression;
  // layerVisibleTrue();

  const foundation_query = stFoundationLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_foundation;
      const total_comp = stats.total_comp_foundation;
      return [total_incomp, total_comp];
    });

  const piles_query = stColumnLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_piles;
      const total_comp = stats.total_comp_piles;

      return [total_incomp, total_comp];
    });

  const roof_query = stFramingLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_roof;
      const total_comp = stats.total_comp_roof;

      return [total_incomp, total_comp];
    });

  const beam_query = stFramingLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp_beam;
      const total_comp = stats.total_comp_beam;

      return [total_incomp, total_comp];
    });

  const foundation = await foundation_query;
  const piles = await piles_query;
  const roof = await roof_query;
  const beams = await beam_query;

  const total =
    foundation[0] +
    foundation[1] +
    piles[0] +
    piles[1] +
    roof[0] +
    roof[1] +
    beams[0] +
    beams[1];
  const total_comp = foundation[1] + piles[1] + roof[1] + beams[1];
  const percent_comp = ((total_comp / total) * 100).toFixed(1);

  const data = [
    {
      category: buildingLayerCategory_aboveground[0],
      comp: foundation[1],
      incomp: foundation[0],
    },
    {
      category: buildingLayerCategory_aboveground[1],
      comp: piles[1],
      incomp: piles[0],
    },
    {
      category: buildingLayerCategory_aboveground[2],
      comp: roof[1],
      incomp: roof[0],
    },
    {
      category: buildingLayerCategory_aboveground[3],
      comp: beams[1],
      incomp: beams[0],
    },
  ];

  return [data, total_comp, percent_comp];
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
}

export function zoomToLayer(layer: any, view: any) {
  return layer.queryExtent().then((response: any) => {
    view
      ?.goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch((error: any) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
  });
}

// Layer list
export async function defineActions(event: any) {
  const { item } = event;
  if (item.layer.type !== "group") {
    item.panel = {
      content: "legend",
      open: true,
    };
  }
  item.title === "Chainage" ||
  item.title === "Pier No" ||
  item.title === "Viaduct" ||
  item.title === "Exterior Shell" ||
  item.title === "GenericModel" ||
  item.title === "Rooms (not monitoring)" ||
  item.title === "StairsRailing (not monitoring)" ||
  item.title === "Stairs (not monitoring)"
    ? (item.visible = false)
    : (item.visible = true);
}
