
export interface RiskProfileAnswerMapping {
  field: string;
  answers: string[];
}

export const RISK_PROFILE_MAPPING: Record<string, RiskProfileAnswerMapping> = {
  // Pregunta 1: ¿Cuál es el principal objetivo de tu inversión?
  question1: {
    field: 'goal',
    answers: [
      'children_education',  // 0: Ahorrar para la educación de mis hijos
      'retirement',          // 1: Asegurar mi jubilación
      'patrimony',           // 2: Incrementar mi patrimonio
      'trip',                // 3: Planificar un viaje
    ],
  },

  // Pregunta 2: ¿Cuál de estas alternativas representa mejor tu horizonte de inversión?
  question2: {
    field: 'investment_withdrawal',
    answers: [
      'anytime',             // 0: Podría necesitar el dinero en cualquier momento
      'some_this_year',      // 1: Necesitaré parte del dinero este año
      'mostly_long_term',    // 2: Quizás haga retiros esporádicos, pero la mayor parte de la inversión será a largo plazo
      'long_term',           // 3: No usaré este dinero en los próximos 3 años
    ],
  },

  // Pregunta 3: ¿Qué grado de conocimiento financiero posees?
  question3: {
    field: 'investment_knowledge',
    answers: [
      'null',                // 0: Nulo
      'level_one',           // 1: Entiendo la diferencia entre acciones y renta fija
      'level_two',           // 2: Conozco distintas opciones de inversión y sus niveles de riesgo
      'level_three',         // 3: Tengo un amplio conocimiento sobre productos y estrategias de inversión
    ],
  },

  // Pregunta 4: ¿En qué productos has invertido anteriormente?
  question4: {
    field: 'previous_investments',
    answers: [
      'fixed_income',        // 0: Cuenta de ahorro, depósitos a plazo y/o instrumentos de renta fija
      'mutual_fund',         // 1: Fondos mutuos
      'shares',              // 2: Acciones
      'derivative_products', // 3: Productos derivados
    ],
  },

  // Pregunta 5: ¿Con cuál de las siguientes afirmaciones te identificas mejor?
  question5: {
    field: 'investment_choice',
    answers: [
      'conservative',        // 0: Lo más importante es que mi inversión crezca de manera estable, no acepto fluctuaciones negativas del mercado
      'short_term_moderate', // 1: Acepto oscilaciones negativas en el valor de mi patrimonio durante períodos de tiempo inferiores a un año
      'med_term_moderate',   // 2: Me importa la rentabilidad a mediano y largo plazo, sin sufrir fluctuaciones negativas importantes en el valor de mi patrimonio
      'risky',               // 3: Puedo asumir fluctuaciones de mercado importantes en mis inversiones a cambio de mayores rentabilidades en el largo plazo
    ],
  },

  // Pregunta 6: Si tienes una inversión con una rentabilidad del 30% y tiene una baja de 20% obteniendo un 10% a favor, ¿qué harías?
  question6: {
    field: 'investment_drop',
    answers: [
      'sell_everything',     // 0: Me cambiaría a instrumentos sin riesgo
      'sell_a_part',         // 1: Transferiría parte de los fondos a inversiones de menor riesgo
      'nothing',             // 2: Me preocuparía, pero no tomaría ninguna acción
      'invest_more',         // 3: Invertiría más si hay fundamentos para ello
    ],
  },

  // Pregunta 7: ¿Cuál es tu nivel de ingreso mensual neto considerando todas tus fuentes de ingresos?
  question7: {
    field: 'monthly_liquid_rent_in_millions',
    answers: [
      'less_than_one',       // 0: Menos de 1 millón de pesos
      'one_to_three',        // 1: Entre 1 y 3 millones de pesos
      'three_to_five',       // 2: Entre 3 y 5 millones de pesos
      'more_than_five',      // 3: Más de 5 millones de pesos
    ],
  },

  // Pregunta 8: ¿Cuánto de tus ahorros estás dispuesto a invertir?
  question8: {
    field: 'saving_choice',
    answers: [
      'less_than_thirty',             // 0: Menos del 30%
      'between_thirty_and_sixty',     // 1: Entre el 30% y el 60%
      'more_than_sixty',              // 2: Más del 60%
    ],
  },

  // Pregunta 9: ¿Qué relación tiene tu profesión con temas financieros?
  question9: {
    field: 'financial_profession_relationship',
    answers: [
      'highly_related',      // 0: Está muy relacionada
      'related',             // 1: Tiene cierta relación
      'little_relation',     // 2: Tiene poca relación
      'unrelated',           // 3: No tiene relación
    ],
  },

  // Pregunta 10: ¿Cuál es el valor aproximado de tu patrimonio disponible para invertir?
  question10: {
    field: 'assets_for_investment',
    answers: [
      'more_than_200m',      // 0: Más de $200 millones
      'between_50m_and_200m',// 1: Entre $50 y $200 millones
      'less_than_50m',       // 2: Menos de $50 millones
    ],
  },
};

/**
 * Convierte las respuestas del cuestionario al formato esperado por el API
 * @param answers - Objeto con las respuestas del usuario { question1: "0", question2: "1", ... }
 * @returns Objeto con el formato del API { goal: "patrimony", investment_withdrawal: "some_this_year", ... }
 */
export function mapSurveyAnswersToRiskProfile(answers: Record<string, string>): Record<string, string> {
  const riskProfile: Record<string, string> = {};

  Object.keys(answers).forEach((questionKey) => {
    const mapping = RISK_PROFILE_MAPPING[questionKey];
    if (mapping) {
      const answerIndex = parseInt(answers[questionKey], 10);
      const apiValue = mapping.answers[answerIndex];

      if (apiValue) {
        riskProfile[mapping.field] = apiValue;
      }
    }
  });

  return riskProfile;
}

/**
 * Convierte las respuestas del API al formato del cuestionario
 * @param riskProfile - Objeto con las respuestas del API { goal: "patrimony", investment_withdrawal: "some_this_year", ... }
 * @returns Objeto con el formato del cuestionario { question1: "2", question2: "1", ... }
 */
export function mapRiskProfileToSurveyAnswers(riskProfile: Record<string, string>): Record<string, string> {
  const surveyAnswers: Record<string, string> = {};

  Object.keys(RISK_PROFILE_MAPPING).forEach((questionKey) => {
    const mapping = RISK_PROFILE_MAPPING[questionKey];
    const apiValue = riskProfile[mapping.field];

    if (apiValue) {
      const answerIndex = mapping.answers.indexOf(apiValue);
      if (answerIndex !== -1) {
        surveyAnswers[questionKey] = answerIndex.toString();
      }
    }
  });

  return surveyAnswers;
}
