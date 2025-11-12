import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import type { CategoryTranslation } from '@/hooks/budget/useCategoriesManager/types';

export function findStaticCategory(name: string, isIncome: boolean) {
  const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const normalizedName = name.toLowerCase().trim();

  const found = staticCategories.find(cat => {
    const catNameEn = cat.name.en.toLowerCase();
    return catNameEn === normalizedName;
  });

  if (found) return found;

  for (const cat of staticCategories) {
    if (cat.subcategories) {
      const subFound = cat.subcategories.find(sub => {
        const subNameEn = sub.name.en.toLowerCase();
        return subNameEn === normalizedName;
      });
      if (subFound) return subFound;
    }
  }

  return null;
}

export function getEmojiForCategory(name: string, isIncome: boolean): string {
  const found = findStaticCategory(name, isIncome);
  return found?.emoji || (isIncome ? '💰' : '💸');
}

export function getTranslatedNames(displayName: string, isIncome: boolean): CategoryTranslation {
  const found = findStaticCategory(displayName, isIncome);

  if (found) {
    return {
      en: found.name.en,
      es: found.name.es,
      'es-CL': found.name['es-CL']
    };
  }

  return {
    en: displayName,
    es: displayName,
    'es-CL': displayName
  };
}

export function getEmojiFromBudgetCategories(categoryName: string, isIncome: boolean): string {
  const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const normalizedName = categoryName.toLowerCase().trim();

  const found = staticCategories.find(cat => {
    const catNameEn = cat.name.en.toLowerCase();
    const catNameEs = cat.name.es.toLowerCase();
    return catNameEn === normalizedName || catNameEs === normalizedName;
  });

  if (found) return found.emoji;

  for (const category of staticCategories) {
    if (category.subcategories) {
      const subcatFound = category.subcategories.find(subcat => {
        const subcatNameEn = subcat.name.en.toLowerCase();
        const subcatNameEs = subcat.name.es.toLowerCase();
        return subcatNameEn === normalizedName || subcatNameEs === normalizedName;
      });
      if (subcatFound) return subcatFound.emoji;
    }
  }

  return '📁';
}

export function filterEmojisFromText(text: string): string {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  return text.replace(emojiRegex, '');
}

export function extractEmojisFromText(text: string): string {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const emojis = text.match(emojiRegex);
  return emojis ? emojis[0] : '';
}

export function isOnlyEmojis(text: string): boolean {
  const onlyEmojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]+$/gu;
  return onlyEmojiRegex.test(text);
}

export function containsEmojis(text: string): boolean {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  return emojiRegex.test(text);
}
