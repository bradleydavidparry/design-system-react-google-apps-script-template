import React from "react";
import OrgChart from "../../../orgchart";
import "../../../css/org-chart.css";

export default class ClassComponentOrgChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: props.tree,
      downloadingChart: false,
      config: {},
      highlightPostNumbers: [1],
    };
  }

  handleDownload = () => {
    this.setState({ downloadingChart: false });
  };

  handleOnChangeConfig = (config) => {
    this.setState({ config: config });
  };

  handleLoadConfig = () => {
    const { config } = this.state;
    return config;
  };

  componentDidMount() {
    document.getElementById("svg").setAttribute("height", 800);
    document.getElementById("svg").setAttribute("viewBox", "0 0 930 800");
  }

  render() {
    const { tree, downloadingChart } = this.state;

    //For downloading org chart as image or pdf based on id
    const downloadImageId = "download-image";
    const downloadPdfId = "download-pdf";

    return (
      <React.Fragment>
        <div
          id="root"
          style={{
            border: "black solid 1px",
            width: "80vw",
            position: "relative",
            left: "calc(-40vw + 50%)",
          }}
        >
          <div className="zoom-buttons">
            <button
              className="btn btn-outline-primary zoom-button"
              id="zoom-in"
            >
              +
            </button>
            <button
              className="btn btn-outline-primary zoom-button"
              id="zoom-out"
            >
              -
            </button>
          </div>
          <div className="download-buttons">
            <button className="btn btn-outline-primary" id="download-image">
              Download as image
            </button>
            <button className="btn btn-outline-primary" id="download-pdf">
              Download as PDF
            </button>
            {downloadingChart && <div>Downloading chart</div>}
          </div>

          <OrgChart
            tree={tree}
            downloadImageId={downloadImageId}
            downloadPdfId={downloadPdfId}
            onConfigChange={(config) => {
              this.handleOnChangeConfig(config);
            }}
            loadConfig={(d) => {
              let configuration = this.handleLoadConfig(d);
              if (configuration) {
                return configuration;
              }
            }}
            downlowdedOrgChart={(d) => {
              this.handleDownload();
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}
