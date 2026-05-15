import { LogicalOperator } from './evaluator.types';

/**
 * აერთიანებს შედეგებს AND ან OR ლოგიკით
 */
export function applyOperator(
  operator: LogicalOperator,
  results: Set<string>[],
): Set<string> {
  // თუ პირობები საერთოდ არ გვაქვს, სეგმენტი ცარიელია
  if (results.length === 0) return new Set();
  // თუ მხოლოდ ერთი პირობაა,
  // პირდაპირ იმას ვაბრუნებთ (ოპტიმიზაცია)
  if (results.length === 1) return results[0];

  results.sort((a, b) => a.size - b.size);

  if (operator === 'AND') {
    const finalSet = new Set<string>();
    const [smallestSet, ...otherSets] = results;

    // მხოლოდ ყველაზე პატარა სეტის წევრებს ვამოწმებთ სხვებში
    for (const id of smallestSet) {
      if (otherSets.every((s) => s.has(id))) {
        finalSet.add(id);
      }
    }

    return finalSet;
  } else {
    // OR: უბრალოდ ვამატებთ ყველას ერთ სეტში დუბლიკატების გარეშე
    const finalSet = new Set<string>();
    for (const resultSet of results) {
      for (const id of resultSet) {
        finalSet.add(id);
      }
    }
    return finalSet;
  }
}
