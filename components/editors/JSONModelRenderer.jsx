import React from "react";

/**
 * Renders a JSON-based component tree
 * @param {object} model - The JSON model for a node
 */
const JSONModelRenderer = ({ model }) => {
  if (!model) return null;

  const { type, props = {}, children = [] } = model;

  return React.createElement(
    type,
    props,
    children.map((child, i) =>
      typeof child === "string" ? child : <JSONModelRenderer key={child.id || i} model={child} />
    )
  );
};

export default JSONModelRenderer;
