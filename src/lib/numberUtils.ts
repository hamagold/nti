// Arabic/Kurdish to English number conversion
const arabicNumbers: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

const persianNumbers: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
};

export function convertToEnglishNumbers(input: string): string {
  let result = input;
  
  // Convert Arabic numerals
  Object.entries(arabicNumbers).forEach(([arabic, english]) => {
    result = result.replace(new RegExp(arabic, 'g'), english);
  });
  
  // Convert Persian/Kurdish numerals
  Object.entries(persianNumbers).forEach(([persian, english]) => {
    result = result.replace(new RegExp(persian, 'g'), english);
  });
  
  return result;
}

export function convertToArabicNumbers(input: string | number): string {
  const englishToArabic: Record<string, string> = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
  };
  
  return String(input).replace(/[0-9]/g, (digit) => englishToArabic[digit] || digit);
}
