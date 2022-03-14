import React from "react";
import OrgChart from "../../../orgchart";
import { Button } from "../../../govuk";
import "../../../css/org-chart.css";

export default class ClassComponentOrgChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: props.tree,
      downloadingChart: false,
      config: {},
      highlightPostNumbers: [1],
      colorObject: props.colorObject,
    };
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (
      nextProps.tree.id !== this.state.tree.id ||
      nextProps.tree.heirachyField !== this.state.tree.heirachyField
    ) {
      this.setState({ tree: nextProps.tree });
    }
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

  componentDidUpdate(prevProps, prevState) {
    document.getElementById("svg").setAttribute("height", 800);
    document.getElementById("svg").setAttribute("viewBox", "0 0 930 800");
  }

  reset = () => {
    this.forceUpdate();
  };

  //{Object.keys(this.state.colorObject).map((key) => key)}

  render() {
    const { tree, downloadingChart, colorObject } = this.state;

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
            <Button
              className="govuk-button--secondary btn btn-outline-primary zoom-button"
              id="zoom-in"
            >
              +
            </Button>
            <Button
              className="govuk-button--secondary btn btn-outline-primary zoom-button"
              id="zoom-out"
            >
              -
            </Button>
          </div>
          <div className="download-buttons">
            <Button
              className="govuk-button--secondary btn btn-outline-primary"
              id="download-image"
            >
              Download as image
            </Button>
            <Button
              className="govuk-button--secondary btn btn-outline-primary"
              id="download-pdf"
            >
              Download as PDF
            </Button>
            {downloadingChart && <div>Downloading chart</div>}
          </div>

          {/*<div className="color-key">
            <div
              style={{ display: "flex", height: "40px", position: "relative" }}
            >
              {Object.keys(colorObject).map((key) => {
                if (!key) return null;
                return (
                  <>
                    <div>{key}</div>
                    <div
                      style={{
                        backgroundColor: colorObject[key],
                        height: "10px",
                        width: "10px",
                        margin: "0",
                        transform: "translateY(-50%)",
                        position: "absolute",
                        top: "50%",
                      }}
                    ></div>
                  </>
                );
              })}
            </div>
          </div>*/}

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
