import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';

/**
 * Encuentra una categoría estática por su nombre en inglés (display_name)
 */
export const findStaticCategory = (name: string, isIncome: boolean) => {
  const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const normalizedName = name.toLowerCase().trim();

  // Buscar en categorías principales
  const found = staticCategories.find(cat => {
    const catNameEn = cat.name.en.toLowerCase();
    return catNameEn === normalizedName;
  });

  if (found) return found;

  // Buscar en subcategorías
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
};

/**
 * Obtiene los nombres traducidos basándose en el display_name (en inglés) del API
 * Mapea con las constantes de BudgetCategories para obtener las traducciones
 */
export const getTranslatedNames = (displayName: string, isIncome: boolean) => {
  const found = findStaticCategory(displayName, isIncome);

  if (found) {
    return {
      en: found.name.en,
      es: found.name.es,
      'es-CL': found.name['es-CL']
    };
  }

  // Si no encontramos traducción, usar el display_name para todos los idiomas
  return {
    en: displayName,
    es: displayName,
    'es-CL': displayName
  };
};

/**
 * Obtiene el emoji basado en el nombre de la categoría
 */
export const getEmojiForCategory = (name: string, isIncome: boolean): string => {
  const found = findStaticCategory(name, isIncome);
  return found?.emoji || (isIncome ? '💰' : '💸');
};
