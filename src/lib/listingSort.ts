function toTimestamp(value: any): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const parsedValue = Date.parse(value);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }

  if (value && typeof value === 'object') {
    if (typeof value.toMillis === 'function') {
      return value.toMillis();
    }

    if (typeof value.seconds === 'number') {
      return value.seconds * 1000;
    }

    if (typeof value._seconds === 'number') {
      return value._seconds * 1000;
    }
  }

  return 0;
}

function getStatusRank(status?: string): number {
  return status === 'sold' || status === 'closed' ? 1 : 0;
}

export function sortListingsByFreshnessAndStatus<T extends { status?: string; createdAt?: any; updatedAt?: any; featuredAt?: any }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const leftFeatured = toTimestamp((left as any)?.featuredAt);
    const rightFeatured = toTimestamp((right as any)?.featuredAt);
    const leftIsFeatured = leftFeatured > 0;
    const rightIsFeatured = rightFeatured > 0;

    if (leftIsFeatured !== rightIsFeatured) {
      return leftIsFeatured ? -1 : 1;
    }

    if (leftIsFeatured && rightIsFeatured && leftFeatured !== rightFeatured) {
      return rightFeatured - leftFeatured;
    }

    const statusDiff = getStatusRank(left.status) - getStatusRank(right.status);
    if (statusDiff !== 0) {
      return statusDiff;
    }

    const leftTime = toTimestamp(left.updatedAt ?? left.createdAt);
    const rightTime = toTimestamp(right.updatedAt ?? right.createdAt);
    return rightTime - leftTime;
  });
}