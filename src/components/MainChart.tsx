import "@esri/calcite-components/dist/components/calcite-tabs";
import "@esri/calcite-components/dist/components/calcite-tab";
import "@esri/calcite-components/dist/components/calcite-tab-nav";
import "@esri/calcite-components/dist/components/calcite-tab-title";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {
  CalciteTab,
  CalciteTabs,
  CalciteTabNav,
  CalciteTabTitle,
} from "@esri/calcite-components-react";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import { useEffect, useState } from "react";
import { buildingLayer } from "../layers";

// import LotChart from "./LotChart";
import "../index.css";
import "../App.css";
import ChartUnderground from "./ChartUnderground";
import ChartAboveground from "./ChartAboveground";
import { layerFilterForAboveground, layerFilterForUnderground } from "../Query";

function MainChart() {
  const [buildingLayerLoaded, setBuildingLayerLoaded] = useState<any>(); // 'loaded'
  const [chartTabName, setChartTabName] = useState("Underground");

  useEffect(() => {
    buildingLayer.load().then(() => {
      setBuildingLayerLoaded(buildingLayer.loadStatus);
    });
  });

  useEffect(() => {
    if (buildingLayerLoaded === "loaded") {
      if (chartTabName === "Underground") {
        console.log(chartTabName);
        layerFilterForUnderground();
      } else if (chartTabName === "Aboveground") {
        layerFilterForAboveground();
      }
    }
  }, [chartTabName]);

  return (
    <>
      <CalciteTabs
        style={{
          width: "550px",

          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          // borderTopWidth: 5,
          borderColor: "#555555",
        }}
        slot="panel-end"
        layout="center"
        scale="l"
      >
        <CalciteTabNav
          slot="title-group"
          id="thetabs"
          onCalciteTabChange={(event: any) =>
            setChartTabName(event.srcElement.selectedTitle.className)
          }
        >
          <CalciteTabTitle class="Underground">Underground</CalciteTabTitle>
          <CalciteTabTitle class="Aboveground">Aboveground</CalciteTabTitle>
        </CalciteTabNav>

        <CalciteTab>
          {buildingLayerLoaded === "loaded" &&
          chartTabName === "Underground" ? (
            <ChartUnderground />
          ) : (
            ""
          )}
        </CalciteTab>
        <CalciteTab>
          {buildingLayerLoaded === "loaded" &&
          chartTabName === "Aboveground" ? (
            <ChartAboveground />
          ) : (
            ""
          )}
        </CalciteTab>
      </CalciteTabs>
    </>
  );
}

export default MainChart;
