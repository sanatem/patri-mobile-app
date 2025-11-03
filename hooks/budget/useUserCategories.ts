import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/providers/AuthProvider';
import {
  getUserCategories,
  getUserCategory,
  createUserCategory,
  updateUserCategory,
  deleteUserCategory,
  type GetUserCategoriesParams,
  type CreateUserCategoryParams,
  type UpdateUserCategoryParams,
  type UserCategory
} from '@/services/budget/categories-manager';

const USER_CATEGORIES_KEY = '@patrimore:user_categories';
const ONBOARDING_COMPLETED_KEY = '@patrimore:categories_onboarding_completed';

export interface UserCategoriesState {
  income: string[];
  expenses: string[];
}

/**
 * Hook principal para gestionar categorías de usuario
 * Mantiene compatibilidad con el almacenamiento local (AsyncStorage) para onboarding
 * y agrega integración con el API para categorías persistentes en el backend
 */
export function useUserCategories(
  params: GetUserCategoriesParams = {},
  options: { enabled?: boolean } = { enabled: true }
) {
  const { accessToken } = useAuth();

  // Estado local para onboarding (mantiene compatibilidad existente)
  const [userCategories, setUserCategories] = useState<UserCategoriesState>({
    income: [],
    expenses: []
  });
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Estado para datos del API
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [isLoadingAPI, setIsLoadingAPI] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);

  // Cargar datos locales de onboarding
  useEffect(() => {
    loadUserCategories();
  }, []);

  // Cargar categorías del API
  useEffect(() => {
    if (accessToken && options.enabled) {
      fetchCategories();
    }
  }, [accessToken, options.enabled, JSON.stringify(params)]);

  const loadUserCategories = async () => {
    try {
      const [categoriesData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(USER_CATEGORIES_KEY),
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
      ]);

      if (categoriesData) {
        setUserCategories(JSON.parse(categoriesData));
      }

      if (onboardingData) {
        setOnboardingCompleted(JSON.parse(onboardingData));
      }
    } catch (error) {
      console.error('Error loading user categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingAPI(true);
      setApiError(null);

      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await getUserCategories(params, accessToken);
      setCategories(response?.data || []);
    } catch (error) {
      console.error('Error fetching user categories from API:', error);
      setApiError(error as Error);
    } finally {
      setIsLoadingAPI(false);
    }
  };

  const refetch = useCallback(() => {
    if (accessToken && options.enabled) {
      fetchCategories();
    }
  }, [accessToken, options.enabled, JSON.stringify(params)]);

  const saveUserCategories = async (categories: UserCategoriesState) => {
    try {
      await AsyncStorage.setItem(USER_CATEGORIES_KEY, JSON.stringify(categories));
      setUserCategories(categories);
    } catch (error) {
      console.error('Error saving user categories:', error);
      throw error;
    }
  };

  const completeOnboarding = async (categories: UserCategoriesState) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(USER_CATEGORIES_KEY, JSON.stringify(categories)),
        AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(true))
      ]);
      setUserCategories(categories);
      setOnboardingCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.multiRemove([USER_CATEGORIES_KEY, ONBOARDING_COMPLETED_KEY]);
      setUserCategories({ income: [], expenses: [] });
      setOnboardingCompleted(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  // ============= API Methods =============

  /**
   * Crea una nueva categoría de usuario en el backend
   */
  const create = async (categoryData: CreateUserCategoryParams) => {
    if (!accessToken) throw new Error('No access token');

    const response = await createUserCategory(categoryData, accessToken);

    // Recargar la lista después de crear
    await refetch();

    return response.data;
  };

  /**
   * Actualiza una categoría de usuario en el backend
   */
  const update = async (id: number, updates: UpdateUserCategoryParams) => {
    if (!accessToken) throw new Error('No access token');

    const response = await updateUserCategory(id, updates, accessToken);

    // Recargar la lista después de actualizar
    await refetch();

    return response.data;
  };

  /**
   * Elimina una categoría de usuario del backend
   */
  const remove = async (id: number) => {
    if (!accessToken) throw new Error('No access token');

    const response = await deleteUserCategory(id, accessToken);

    // Recargar la lista después de eliminar
    await refetch();

    return response;
  };

  /**
   * Obtiene solo las categorías de gastos
   */
  const getExpenseCategories = () => {
    return categories.filter(cat => cat.kind === 'expense');
  };

  /**
   * Obtiene solo las categorías de ingresos
   */
  const getIncomeCategories = () => {
    return categories.filter(cat => cat.kind === 'income');
  };

  /**
   * Obtiene solo las categorías personalizadas (custom)
   */
  const getCustomCategories = () => {
    return categories.filter(cat => cat.custom === true);
  };

  /**
   * Obtiene solo las categorías basadas en el sistema
   */
  const getSystemBasedCategories = () => {
    return categories.filter(cat => cat.system_based === true);
  };

  /**
   * Obtiene las categorías padre (sin parent_id)
   */
  const getParentCategories = () => {
    return categories.filter(cat => cat.parent_id === null);
  };

  /**
   * Obtiene las subcategorías de una categoría específica
   */
  const getSubcategories = (parentId: number) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  return {
    // Estado local (para compatibilidad con onboarding existente)
    userCategories,
    onboardingCompleted,
    loading,
    saveUserCategories,
    completeOnboarding,
    resetOnboarding,

    // Datos del API
    categories,
    isLoadingAPI,
    apiError,
    refetch,

    // Métodos CRUD del API
    create,
    update,
    remove,

    // Helpers
    getExpenseCategories,
    getIncomeCategories,
    getCustomCategories,
    getSystemBasedCategories,
    getParentCategories,
    getSubcategories,
  };
}

/**
 * Hook para obtener una categoría específica por ID
 *
 * @param id - ID de la categoría
 * @param options - Opciones del hook
 */
export function useUserCategory(
  id: number | null,
  options: { enabled?: boolean } = { enabled: true }
) {
  const { accessToken } = useAuth();

  const [category, setCategory] = useState<UserCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!accessToken || !id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getUserCategory(id, accessToken);
      setCategory(response?.data || null);
    } catch (err) {
      console.error('Error fetching user category:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    if (accessToken && id && options.enabled) {
      fetchCategory();
    }
  }, [accessToken, id, options.enabled, fetchCategory]);

  return {
    category,
    isLoading,
    error,
    refetch: fetchCategory,
  };
}
