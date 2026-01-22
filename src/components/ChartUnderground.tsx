import { useEffect, useRef, useState } from "react";
import {
  stColumnLayer,
  stFoundationLayer,
  stFramingLayer,
  floorsLayer,
  wallsLayer,
  siteLayer,
} from "../layers";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import "../App.css";
import {
  buildingLayerCategory_underground,
  construction_status,
  generateChartDataUnderground,
  layerFilterForUnderground,
  layerVisibleTrue,
  thousands_separators,
  zoomToLayer,
} from "../Query";
import "@esri/calcite-components/dist/components/calcite-label";
import { CalciteLabel } from "@esri/calcite-components-react";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

// Draw chart
const ChartUnderground = () => {
  layerFilterForUnderground();
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const [percentCompleted, setPercentCompleted] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState([]);
  const chartID = "station-bar";

  useEffect(() => {
    generateChartDataUnderground().then((response: any) => {
      setChartData(response[0]);
      setTotalCompleted(response[1]);
      setPercentCompleted(response[2]);
    });

    zoomToLayer(stColumnLayer, arcgisScene);
  }, []);

  // Define parameters
  const marginTop = 0;
  const marginLeft = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const paddingTop = 10;
  const paddingLeft = 5;
  const paddingRight = 5;
  const paddingBottom = 0;

  const xAxisNumberFormat = "#'%'";
  const seriesBulletLabelFontSize = "1vw";

  // axis label
  const yAxisLabelFontSize = "0.9vw";
  const xAxisLabelFontSize = "0.9vw";
  const legendFontSize = "0.85vw";

  const chartPaddingRightIconLabel = 10;

  const chartSeriesFillColorComp = "#0070ff";
  const chartSeriesFillColorIncomp = "#000000";
  // const chartSeriesFillColorOngoing = "#d3d3d3"; // orfiginal: #FF0000
  const chartBorderLineColor = "#00c5ff";
  const chartBorderLineWidth = 0.4;

  useEffect(() => {
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        marginTop: marginTop,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginBottom: marginBottom,
        paddingTop: paddingTop,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
        scale: 1,
        height: am5.percent(100),
      }),
    );
    chartRef.current = chart;

    const yRenderer = am5xy.AxisRendererY.new(root, {
      inversed: true,
    });
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: yRenderer,

        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    yRenderer.labels.template.setAll({
      paddingRight: chartPaddingRightIconLabel,
    });

    yRenderer.grid.template.setAll({
      location: 1,
    });

    // Label properties Y axis
    yAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: yAxisLabelFontSize,
    });

    yAxis.data.setAll(chartData);

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        numberFormat: xAxisNumberFormat,
        calculateTotals: true,
        renderer: am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0,
          strokeWidth: 1,
          stroke: am5.color("#ffffff"),
        }),
      }),
    );

    xAxis.get("renderer").labels.template.setAll({
      //oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: xAxisLabelFontSize,
    });

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        centerY: am5.percent(50),
        x: am5.percent(50),
        marginTop: 20,
        scale: 0.9,
        layout: root.horizontalLayout,
      }),
    );
    legendRef.current = legend;

    legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      fill: am5.color("#ffffff"),
      fontSize: legendFontSize,
      // scale: 1.2,
      // marginRight: -40,
      //textDecoration: "underline"
      //width: am5.percent(600),
      //fontWeight: '300',
    });

    function makeSeries(name: any, fieldName: any) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          baseAxis: yAxis,
          valueXField: fieldName,
          valueXShow: "valueXTotalPercent",
          categoryYField: "category",
          fill:
            fieldName === "incomp"
              ? am5.color(chartSeriesFillColorIncomp)
              : am5.color(chartSeriesFillColorComp),
          stroke: am5.color(chartBorderLineColor),
        }),
      );

      series.columns.template.setAll({
        fillOpacity: fieldName === "comp" ? 1 : 0.5,
        tooltipText: "{name}: {valueX}", // "{categoryY}: {valueX}",
        tooltipY: am5.percent(90),
        strokeWidth: chartBorderLineWidth,
      });
      series.data.setAll(chartData);

      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text:
              fieldName === "comp"
                ? "{valueXTotalPercent.formatNumber('#.')}%"
                : "",
            fill: root.interfaceColors.get("alternativeText"),
            opacity: fieldName === "incomp" ? 0 : 1,
            fontSize: seriesBulletLabelFontSize,
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });
      });

      // Click event
      // const find = dropdownData.find((emp: any) => emp.name === props.station);
      // const stationValue = find?.value;

      series.columns.template.events.on("click", (ev) => {
        layerFilterForUnderground();
        const selected: any = ev.target.dataItem?.dataContext;
        const categorySelect: string = selected.category;
        let categorySelected: any;
        if (categorySelect === "Slab") {
          categorySelected = "Underground Slab";
        } else if (categorySelect === "Pile") {
          categorySelected = "Underground Piles";
        } else {
          categorySelected = categorySelect;
        }

        const queryExpression =
          "Component = 'UG'" + " AND " + "Types = '" + categorySelected + "'";

        if (categorySelect === buildingLayerCategory_underground[0]) {
          stFoundationLayer.visible = false;
          stFramingLayer.visible = false;
          stColumnLayer.visible = false;
          floorsLayer.visible = false;
          wallsLayer.visible = false;

          // genericLayer.visible = false;
          // roomsLayer.visible = false;
          siteLayer.definitionExpression = queryExpression;
          siteLayer.visible = true;
          // stairsLayer.visible = false;
          // stairsRailingLayer.visible = false;
          // exteriorShellLayer.visible = false;
        } else if (categorySelect === buildingLayerCategory_underground[1]) {
          stFoundationLayer.definitionExpression = queryExpression;
          stFoundationLayer.visible = true;
          floorsLayer.definitionExpression = queryExpression;
          floorsLayer.visible = true;
          stFramingLayer.visible = false;
          stColumnLayer.visible = false;
          wallsLayer.visible = false;
          // roomsLayer.visible = false;
          siteLayer.visible = false;
          // stairsLayer.visible = false;
          // stairsRailingLayer.visible = false;
          // exteriorShellLayer.visible = false;
        } else if (categorySelect === buildingLayerCategory_underground[2]) {
          stFoundationLayer.visible = false;
          stFramingLayer.visible = false;
          stColumnLayer.definitionExpression = queryExpression;
          stColumnLayer.visible = true;
          floorsLayer.visible = false;
          wallsLayer.visible = false;
          // genericLayer.visible = false;
          // roomsLayer.visible = false;
          siteLayer.visible = false;
          // stairsLayer.visible = false;
          // stairsRailingLayer.visible = false;
          // exteriorShellLayer.visible = false;
        }
        arcgisScene?.view.on("click", () => {
          layerVisibleTrue();
        });
      });
      legend.data.push(series);
    }
    makeSeries(construction_status[2], "comp");
    makeSeries(construction_status[0], "incomp");
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  });

  const primaryLabelColor = "#9ca3af";
  const valueLabelColor = "#d1d5db";

  return (
    <>
      <div
        style={{
          color: primaryLabelColor,
          fontSize: "1.3rem",
          marginLeft: "13px",
          marginTop: "10px",
          marginBottom: "-5px",
        }}
      >
        Total Progress
      </div>
      <CalciteLabel layout="inline">
        <div
          style={{
            color: valueLabelColor,
            fontSize: "2.7rem",
            fontWeight: "bold",
            fontFamily: "calibri",
            lineHeight: "1.2",
            marginLeft: "30px",
          }}
        >
          {percentCompleted}%
        </div>

        <img
          src="https://EijiGorilla.github.io/Symbols/Station_Structures_icon.png"
          alt="Utility Logo"
          height={"55px"}
          width={"55px"}
          style={{ marginLeft: "45%", display: "flex" }}
        />
      </CalciteLabel>
      <div
        style={{
          color: valueLabelColor,
          fontSize: "1rem",
          fontFamily: "calibri",
          lineHeight: "1.2",
          marginLeft: "30px",
        }}
      >
        ({thousands_separators(totalCompleted)})
      </div>

      <div
        id={chartID}
        style={{
          height: "60vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginRight: "10px",
          marginTop: "5%",
        }}
      ></div>
    </>
  );
};

export default ChartUnderground;
