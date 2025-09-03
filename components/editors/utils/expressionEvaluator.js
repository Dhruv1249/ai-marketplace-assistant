// Enhanced Template Expression Evaluator
export const evaluateExpression = (expression, context, depth = 0) => {
  if (depth > 10) {
    console.warn('Expression evaluation depth exceeded:', expression);
    return expression;
  }
  
  try {
    // Handle string literals first
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1);
    }
    if (expression.startsWith("'") && expression.endsWith("'")) {
      return expression.slice(1, -1);
    }
    
    // Handle numbers
    if (!isNaN(expression) && expression.trim() !== '' && !expression.includes('.') && !expression.includes(' ')) {
      return Number(expression);
    }
    
    // Handle booleans and null
    if (expression === 'true') return true;
    if (expression === 'false') return false;
    if (expression === 'null') return null;
    if (expression === 'undefined') return undefined;
    
    // Handle ternary expressions FIRST (before other complex processing)
    if (expression.includes('?') && expression.includes(':')) {
      const conditionMatch = expression.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
      if (conditionMatch) {
        const [, condition, trueValue, falseValue] = conditionMatch;
        const conditionResult = evaluateExpression(condition.trim(), context, depth + 1);
        
        // Proper truthy check
        const isTruthy = Boolean(conditionResult && conditionResult !== '' && conditionResult !== 0);
        
        if (isTruthy) {
          return evaluateExpression(trueValue.trim(), context, depth + 1);
        } else {
          return evaluateExpression(falseValue.trim(), context, depth + 1);
        }
      }
    }
    
    // Handle string methods like charAt(0).toUpperCase()
    if (expression.includes('.charAt(0).toUpperCase()')) {
      const basePath = expression.split('.charAt(0).toUpperCase()')[0].trim();
      const baseValue = evaluateExpression(basePath, context, depth + 1);
      if (typeof baseValue === 'string' && baseValue.length > 0) {
        return baseValue.charAt(0).toUpperCase();
      }
      return '';
    }
    
    // Handle OR expressions
    if (expression.includes('||') && !expression.includes('&&')) {
      const [primary, fallback] = expression.split('||').map(s => s.trim());
      const primaryValue = evaluateExpression(primary, context, depth + 1);
      if (primaryValue && primaryValue !== '' && primaryValue !== 0) {
        return primaryValue;
      }
      return evaluateExpression(fallback, context, depth + 1);
    }
    
    // Handle parentheses expressions like "(content.businessInfo.businessName || content.businessInfo.description)"
    if (expression.includes('(') && expression.includes(')')) {
      const innerMatch = expression.match(/\(([^)]+)\)/);
      if (innerMatch) {
        const innerExpression = innerMatch[1];
        const innerResult = evaluateExpression(innerExpression, context, depth + 1);
        // Replace the parentheses part with the result and re-evaluate
        const newExpression = expression.replace(innerMatch[0], `"${innerResult}"`);
        return evaluateExpression(newExpression, context, depth + 1);
      }
    }
    
    // Handle complex conditional expressions like "content.contact && content.contact.email"
    if (expression.includes('&&')) {
      const parts = expression.split('&&').map(s => s.trim());
      for (const part of parts) {
        const result = evaluateExpression(part, context, depth + 1);
        if (!result || result === '' || result === 0 || result === false) {
          return false;
        }
      }
      return true;
    }
    
    // Handle array length checks like "content.specialties.length > 0"
    if (expression.includes('.length')) {
      if (expression.includes('> 0')) {
        const arrayPath = expression.split('.length')[0].trim();
        const arrayValue = evaluateExpression(arrayPath, context, depth + 1);
        if (Array.isArray(arrayValue)) {
          return arrayValue.length > 0;
        }
        return false;
      } else {
        const arrayPath = expression.split('.length')[0].trim();
        const arrayValue = evaluateExpression(arrayPath, context, depth + 1);
        if (Array.isArray(arrayValue)) {
          return arrayValue.length;
        }
        return 0;
      }
    }
    
    // Handle array access like content.photos[0].url
    if (expression.includes('[') && expression.includes(']')) {
      const arrayMatch = expression.match(/^([^[]+)\[(\d+)\](?:\.(.+))?$/);
      if (arrayMatch) {
        const [, arrayPath, index, property] = arrayMatch;
        const arrayValue = evaluateExpression(arrayPath.trim(), context, depth + 1);
        if (Array.isArray(arrayValue) && arrayValue[parseInt(index)]) {
          const item = arrayValue[parseInt(index)];
          if (property) {
            return item[property] || '';
          }
          return item;
        }
        return '';
      }
    }
    
    // Handle content access
    if (expression.startsWith('content.')) {
      const path = expression.replace('content.', '').split('.');
      let obj = context.content;
      for (const key of path) {
        obj = obj?.[key];
      }
      return obj !== undefined ? obj : '';
    }
    
    // Handle image access
    if (expression.startsWith('images[')) {
      const indexMatch = expression.match(/images\[(\d+)\]/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1]);
        return context.images?.[index] || '';
      }
    }
    
    // Handle state access
    if (expression.startsWith('state.')) {
      const key = expression.replace('state.', '');
      return context.state?.[key];
    }
    
    // Handle form data access
    if (expression.startsWith('formData.')) {
      const key = expression.replace('formData.', '');
      return context.formData?.[key] || '';
    }
    
    return expression;
  } catch (error) {
    console.warn('Expression evaluation error:', error.message, expression);
    return '';
  }
};

// Template String Processing
export const processTemplateString = (str, context, depth = 0) => {
  if (typeof str !== 'string' || !str.includes('{{') || depth > 5) {
    return str;
  }

  let result = str;
  const matches = result.match(/\{\{([^}]+)\}\}/g);
  if (matches) {
    matches.forEach(match => {
      const expressionStr = match.slice(2, -2).trim();
      try {
        let value = evaluateExpression(expressionStr, context, depth);
        // Convert value to string, handling different types
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }
        result = result.replace(match, value);
      } catch (e) {
        console.warn('Template processing error:', e.message, expressionStr);
        result = result.replace(match, '');
      }
    });
  }
  return result;
};