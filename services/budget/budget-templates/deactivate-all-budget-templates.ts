import { getBudgetTemplates } from './get-budget-templates';
import { deactivateBudgetTemplate } from './deactivate-budget-template';

/**
 * Desactiva todos los presupuestos activos del usuario
 * Útil cuando el usuario cambia de modo de transacciones (manual -> Floid)
 */
export async function deactivateAllBudgetTemplates(
  token: string
): Promise<{ success: boolean; deactivatedCount: number }> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    // Obtener todos los presupuestos activos
    const templatesResponse = await getBudgetTemplates(token);

    if (!templatesResponse.success || !templatesResponse.budget_templates) {
      return { success: true, deactivatedCount: 0 };
    }

    const activeTemplates = templatesResponse.budget_templates.filter(t => t.active);

    if (activeTemplates.length === 0) {
      return { success: true, deactivatedCount: 0 };
    }

    // Desactivar cada presupuesto
    const deactivatePromises = activeTemplates.map(template =>
      deactivateBudgetTemplate(template.id, token).catch(error => {
        console.error(`Error deactivating budget template ${template.id}:`, error);
        return null;
      })
    );

    await Promise.all(deactivatePromises);

    return {
      success: true,
      deactivatedCount: activeTemplates.length
    };

  } catch (error) {
    console.error('Budget Templates Service: Error deactivating all budget templates:', error);
    throw error;
  }
}
