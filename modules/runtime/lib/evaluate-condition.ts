export function evaluateCondition(rawOutput: string, field: string, equals: string) {
  try {
    const match = rawOutput.match(/\{[\s\S]*\}/);
    if (match) {
      const json = JSON.parse(match[0]);
      return String(json[field] ?? "") === equals;
    }
  } catch {
    // fall through
  }

  return rawOutput.toLowerCase().includes(equals.toLowerCase());
}
