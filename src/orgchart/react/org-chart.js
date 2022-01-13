const { createElement, Component } = require("react");
const { init } = require("../chart");

class OrgChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: props.tree,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.tree.id !== this.state.tree.id ||
      nextProps.tree.heirachyField !== this.state.tree.heirachyField
    ) {
      this.setState({ tree: nextProps.tree });
    }
  }

  render() {
    const { id } = this.props;

    return createElement("div", {
      id,
    });
  }

  static defaultProps = {
    id: "react-org-chart",
    downloadImageId: "download-image",
    downloadPdfId: "download-pdf",
    zoomInId: "zoom-in",
    zoomOutId: "zoom-out",
    zoomExtentId: "zoom-extent",
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.tree.id !== prevState.tree.id ||
      this.state.tree.heirachyField !== prevState.tree.heirachyField
    ) {
      const {
        id,
        downloadImageId,
        downloadPdfId,
        zoomInId,
        zoomOutId,
        zoomExtentId,
        tree,
        ...options
      } = this.props;

      init({
        id: `#${id}`,
        downloadImageId: `#${downloadImageId}`,
        downloadPdfId: `#${downloadPdfId}`,
        zoomInId: zoomInId,
        zoomOutId: zoomOutId,
        zoomExtentId: zoomExtentId,
        data: this.state.tree,
        ...options,
      });
    }
  }

  componentDidMount() {
    const {
      id,
      downloadImageId,
      downloadPdfId,
      zoomInId,
      zoomOutId,
      zoomExtentId,
      tree,
      ...options
    } = this.props;

    init({
      id: `#${id}`,
      downloadImageId: `#${downloadImageId}`,
      downloadPdfId: `#${downloadPdfId}`,
      zoomInId: zoomInId,
      zoomOutId: zoomOutId,
      zoomExtentId: zoomExtentId,
      data: this.state.tree,
      ...options,
    });
  }
}

module.exports = OrgChart;
