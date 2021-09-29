import React, { useContext, useState, useEffect } from "react";
import { Table, Tag } from "../../govuk/index";
import Toolbar from "./Toolbar";
import Record from "./Record";
import ViewComponent from "./ViewComponent";
import ErrorBoundary from "./ErrorBoundary";
import BackButton from "./BackButton";
import { Switch, Route, Link, useRouteMatch, Redirect } from "react-router-dom";
import { normalise, checkUserAccess } from "../functions/utilities";
import FormatValue from "../functions/FormatValue";
import {
  processViewData,
  processDataAndSchema,
  lookupViewValue,
} from "../functions/dataProcessing";
import AppContext from "../views/AppContext";
import {
  getRowNotificationCondition,
  checkHighlightConditionMet,
} from "../functions/getRowNotificationCondition";

function createViewFilterObject(inputString) {
  if (!inputString) return {};
  return inputString.split("#").reduce(
    (object, substring) => {
      if (substring.includes("!=")) {
        const [field, listString] = substring.split("!=");
        object.exclude[normalise(field)] = JSON.parse(listString);
      } else {
        const [field, listString] = substring.split("=");
        object.include[normalise(field)] = JSON.parse(listString);
      }
      return object;
    },
    { include: {}, exclude: {} }
  );
}

function View(props) {
  const {
    Name,
    Schemas,
    Fields,
    VisibleFields,
    FilterFields,
    SortFields,
    SearchFields,
    IdentifyingField,
    DataSheetName,
    CreateUserTypes,
    IndexUserTypes,
    EditUserTypes,
    ViewFilter,
    IncludeLinkInSideBar,
    fullWidthView,
    setFullWidthView,
    ShowSearchBar,
    ShowSort,
    DefaultSortDirection,
    FullWidthView,
    includeBackButtonOnIndex,
  } = props;

  let match = useRouteMatch();
  const {
    userType,
    filterObject,
    setFilterObject,
    dataObject,
    setDataObject,
    lookups,
    setLookups,
  } = useContext(AppContext);

  const [viewLoading, setViewLoading] = useState(true);

  const [data, setData] = useState([]);
  const [schema, setSchema] = useState({});

  useEffect(() => {
    setFullWidthView(FullWidthView);
  }, [FullWidthView, setFullWidthView]);

  useEffect(() => {
    const newFilterObject = { ...filterObject };
    newFilterObject.sort.dir = DefaultSortDirection === "Asc" ? 1 : -1;
    setFilterObject(newFilterObject);
  }, [DefaultSortDirection]);

  useEffect(() => {
    const splitSchemas = Schemas.split("#");
    const schemasToFetch = splitSchemas.filter(
      (schemaName) => !dataObject[schemaName]
    );
    if (schemasToFetch.length > 0) {
      google.script.run
        .withSuccessHandler(processViewData)
        .withUserObject({ dataObject, setDataObject })
        .getViewData(schemasToFetch);
    }
  }, [dataObject, setDataObject, Schemas]);

  useEffect(() => {
    const splitSchemas = Schemas.split("#");
    if (splitSchemas.every((schemaName) => dataObject[schemaName])) {
      const [processedData, processedSchema, newLookups] = processDataAndSchema(
        Name,
        dataObject,
        splitSchemas,
        lookups
      );

      setData(processedData);
      setSchema(processedSchema);
      setLookups(newLookups);
      setViewLoading(false);
    }
  }, [dataObject, setData, setSchema, Schemas, setLookups]);

  const headings = VisibleFields?.split("#");

  const filterFieldsList = FilterFields?.split("#").map((fieldString) => {
    const [field] = fieldString.split("||");
    return normalise(field);
  });
  const sortFieldsList = SortFields?.split("#");
  const searchFieldsSplit = SearchFields
    ? SearchFields.split("#").map((field) => normalise(field))
    : ["All"];

  const viewFilterObject = createViewFilterObject(ViewFilter);

  const filteredAndSortedData = data
    .filter((row) => {
      for (var searchField in filterObject.filters) {
        if (
          filterFieldsList.includes(searchField) &&
          row[searchField] !== filterObject.filters[searchField]
        )
          return false;
      }

      for (let filterField in viewFilterObject.include) {
        if (!viewFilterObject.include[filterField].includes(row[filterField]))
          return false;
      }

      for (let filterField in viewFilterObject.exclude) {
        if (viewFilterObject.exclude[filterField].includes(row[filterField]))
          return false;
      }

      if (!filterObject["Search Bar"]) return true;
      const searchTerms = filterObject["Search Bar"].toLowerCase().split(" ");
      const searchRowObject =
        searchFieldsSplit[0] === "All"
          ? row
          : searchFieldsSplit.reduce((object, field) => {
              object[field] = row[field];
              return object;
            }, {});
      const rowValueString = Object.values(searchRowObject)
        .join(" ")
        .toLowerCase();
      return searchTerms.every((term) => rowValueString.includes(term));
    })
    .sort((a, b) => {
      let { field, dir } = filterObject.sort;
      field = !sortFieldsList.includes(field)
        ? normalise(SortFields.split("#")[0])
        : field;
      return a[field] === b[field] ? 0 : a[field] > b[field] ? dir : dir * -1;
    });

  const includeIndexPage = checkUserAccess(IndexUserTypes, userType, false);
  const edittingPossible = checkUserAccess(EditUserTypes, userType, false);
  const creatingPossible = checkUserAccess(CreateUserTypes, userType, false);

  const toolbarProps = {
    FilterFields,
    SortFields,
    filterObject,
    setFilterObject,
    ShowSearchBar,
    ShowSort,
    data,
    create: CreateUserTypes?.includes(userType),
    Name,
  };

  const includeToolbar =
    toolbarProps.create || FilterFields || ShowSearchBar || ShowSort;

  const highlightConditionObject = getRowNotificationCondition(Name);

  if (viewLoading) return <h2>Loading</h2>;
  return (
    <>
      <h2>{Name}</h2>
      <ErrorBoundary>
        <Switch>
          <Route path={`${match.path}/:recordId`}>
            {(includeIndexPage || !IncludeLinkInSideBar) && <BackButton />}
            <Record
              Fields={Fields}
              DataSheetName={DataSheetName}
              edittingPossible={edittingPossible}
              creatingPossible={creatingPossible}
              Schemas={Schemas}
              viewName={Name}
              fullWidthView={fullWidthView}
            />
          </Route>
          <Route path={`${match.path}`}>
            {includeBackButtonOnIndex && <BackButton />}
            <ViewComponent
              Name={Name}
              data={filteredAndSortedData}
              schema={schema}
              type={"above_toolbar"}
            />
            {includeIndexPage ? (
              <>
                {includeToolbar && <Toolbar {...toolbarProps} />}
                <ViewComponent
                  Name={Name}
                  data={filteredAndSortedData}
                  schema={schema}
                  type={"below_toolbar"}
                />
                <Table
                  firstCellIsHeader
                  caption={
                    includeToolbar ? "Filter and search results" : "Records"
                  }
                  captionClassName="govuk-heading-s"
                  head={headings.concat(["", ""]).map((heading) => {
                    return { children: heading };
                  })}
                  rows={filteredAndSortedData.map((row) => ({
                    cells: headings
                      .map((heading) => {
                        const input = schema[heading]?.OptionsSchema
                          ? lookupViewValue(
                              row[normalise(heading)],
                              schema[heading].OptionsSchema,
                              lookups
                            )
                          : row[normalise(heading)];

                        return {
                          children: (
                            <FormatValue
                              input={input}
                              type={schema[heading]?.Type}
                              heading={heading}
                            />
                          ),
                        };
                      })
                      .concat({
                        children: (
                          <>
                            <Link
                              className={`govuk-link`}
                              to={`${match.url}/${row.ID}`}
                            >
                              View
                              <span className="govuk-visually-hidden">
                                {" "}
                                {row[normalise(IdentifyingField)]}
                              </span>
                            </Link>
                            {checkHighlightConditionMet(
                              row,
                              highlightConditionObject
                            ) ? (
                              <Tag className="govuk-tag--red">Action</Tag>
                            ) : null}
                          </>
                        ),
                      }),
                  }))}
                />
              </>
            ) : creatingPossible ? (
              <Redirect to={`${match.path}/add_new`} />
            ) : null}
          </Route>
        </Switch>
      </ErrorBoundary>
    </>
  );
}

export default View;
