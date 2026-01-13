// أصناف حالة قطع الغيار في الموقع
export const PART_CONDITIONS = {
  NEW: 'جديد',
  USED: 'مستعمل', 
  USED_NEEDS_REPAIR: 'مستعمل يحتاج تصليح',
  SCRAP: 'سكراب'
} as const;

export const PART_CONDITIONS_ARRAY = [
  PART_CONDITIONS.NEW,
  PART_CONDITIONS.USED,
  PART_CONDITIONS.USED_NEEDS_REPAIR,
  PART_CONDITIONS.SCRAP
];

// دالة لتحديد لون الحالة في الواجهة
export const getConditionColor = (condition: string): string => {
  switch (condition) {
    case PART_CONDITIONS.NEW:
      return 'bg-green-100 text-green-800 border-green-200';
    case PART_CONDITIONS.USED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case PART_CONDITIONS.USED_NEEDS_REPAIR:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case PART_CONDITIONS.SCRAP:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// دالة لتحديد وصف الحالة
export const getConditionDescription = (condition: string): string => {
  switch (condition) {
    case PART_CONDITIONS.NEW:
      return 'قطعة غيار جديدة بحالة ممتازة';
    case PART_CONDITIONS.USED:
      return 'قطعة غيار مستعملة بحالة جيدة';
    case PART_CONDITIONS.USED_NEEDS_REPAIR:
      return 'قطعة غيار مستعملة تحتاج إلى تصليح أو صيانة';
    case PART_CONDITIONS.SCRAP:
      return 'قطعة غيار للسكراب أو قطع الغيار';
    default:
      return 'حالة غير محددة';
  }
};