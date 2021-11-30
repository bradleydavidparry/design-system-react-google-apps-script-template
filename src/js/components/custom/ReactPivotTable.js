import React, { useState, useEffect, useContext } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import TableRenderers from "react-pivottable/TableRenderers";
import AppContext from "../../views/AppContext";

// import Plot from "react-plotly.js";
// import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
// const PlotlyRenderers = createPlotlyRenderers(Plot);

export default function ReactPivotTable(props) {
  const { data, showUi, tableProperties } = props;
  const { accessibleMode } = useContext(AppContext);

  useEffect(() => {
    if (!showUi && !accessibleMode) {
      const elements = document.getElementsByClassName("pvtAxisContainer");
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
      }
      document.getElementsByClassName(
        "pvtVals"
      )[0].parentElement.style.display = "none";
      document.getElementsByClassName("pvtRenderers")[0].style.display = "none";
    }
  }, [showUi, accessibleMode]);

  const [tableState, setTableState] = useState({ ...tableProperties });

  if (accessibleMode) return null;
  return (
    <div style={{ overflow: "scroll", width: "100%" }}>
      <PivotTableUI
        data={data}
        onChange={(s) => setTableState(s)}
        renderers={Object.assign({}, TableRenderers /*PlotlyRenderers */)}
        {...tableState}
      />
    </div>
  );
}
