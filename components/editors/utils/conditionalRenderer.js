import { evaluateExpression } from './expressionEvaluator.js';

// Conditional Rendering Handler
export const handleConditionalRendering = (node, context) => {
  if (!node || typeof node !== 'object') return node;
  
  // Handle "if" condition
  if (node.if) {
    const condition = evaluateExpression(node.if, context);
    if (!condition) return null;
  }
  
  // Handle "unless" condition (opposite of if)
  if (node.unless) {
    const condition = evaluateExpression(node.unless, context);
    if (condition) return null;
  }
  
  // Handle "show" condition
  if (node.show !== undefined) {
    const shouldShow = evaluateExpression(node.show, context);
    if (!shouldShow) return null;
  }
  
  return node;
};