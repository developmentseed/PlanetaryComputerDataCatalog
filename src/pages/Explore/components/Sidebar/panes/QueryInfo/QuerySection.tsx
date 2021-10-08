import { Text } from "@fluentui/react";

import { CqlExpressionParser } from "pages/Explore/utils/cql";
import {
  CqlOperator,
  ICqlExpression,
  ICqlExpressionList,
} from "pages/Explore/utils/cql/types";
import { toUtcDate } from "utils";
import { stacFormatter } from "utils/stac";
import { opEnglish, operators } from "../../../query/constants";
import Section from "./Section";

interface QuerySectionProps {
  cql: ICqlExpressionList;
}
const getDateLabel = (
  property: string,
  propertyLabel: string,
  value: string[] | string,
  op: CqlOperator
) => {
  if (Array.isArray(value)) {
    const oneDate = new Set(value.map(toUtcDate)).size === 1 || value.length === 1;

    const labelText = oneDate
      ? `${propertyLabel} ${opEnglish[op]} ${toUtcDate(value[0])} `
      : `${propertyLabel} between ${toUtcDate(value[0])} and ${toUtcDate(value[1])}`;

    return <Text>{labelText}</Text>;
  } else if (property === "datetime" && !Array.isArray(value)) {
    const labelText = `${propertyLabel} ${opEnglish[op]} ${toUtcDate(value)}`;
    return <Text>{labelText}</Text>;
  }
};

const QuerySection = ({ cql }: QuerySectionProps) => {
  const expressions = (expression: ICqlExpression) => {
    const exp = new CqlExpressionParser(expression);
    const propertyLabel = stacFormatter.label(exp.property);
    const opText = operators[exp.operator];

    // Special handling for datetime property
    const label =
      exp.property === "datetime" ? (
        getDateLabel(exp.property, propertyLabel, exp.value, exp.operator)
      ) : (
        <Text>
          {propertyLabel} {opText} {exp.value}
        </Text>
      );
    return <Text key={`exp-${propertyLabel}-${exp.operator}`}>{label}</Text>;
  };

  const expressionsLabels = cql.map(expressions);

  // If there is no date expression, use the implicit text that all recent items
  // are included
  const implicitDateExpression = !cql
    .map(exp => new CqlExpressionParser(exp))
    .find(exp => {
      return exp.property === "datetime";
    })
    ? "All recent data items"
    : null;

  return (
    <Section title="Filters Applied" icon="PageListFilter">
      {implicitDateExpression}
      {expressionsLabels}
    </Section>
  );
};

export default QuerySection;
