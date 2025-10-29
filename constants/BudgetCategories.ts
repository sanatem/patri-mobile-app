
export const INCOME_CATEGORIES = [
  {
    id: "salary_wages",
    name: {
      en: "Salary & Wages",
      es: "Salario y Sueldos",
      "es-CL": "Sueldo y Honorarios"
    },
    emoji: "💼",
    subcategories: [
      {
        id: "base_salary",
        name: {
          en: "Base Salary",
          es: "Sueldo Base",
          "es-CL": "Sueldo Base"
        },
        emoji: "👔"
      },
      {
        id: "bonuses_commissions",
        name: {
          en: "Bonuses / Commissions",
          es: "Bonos / Comisiones",
          "es-CL": "Bonos / Comisiones"
        },
        emoji: "💰"
      },
      {
        id: "overtime",
        name: {
          en: "Overtime",
          es: "Horas Extra",
          "es-CL": "Horas Extra"
        },
        emoji: "⏰"
      }
    ]
  },
  {
    id: "business_freelance",
    name: {
      en: "Business & Freelance",
      es: "Negocios y Freelance",
      "es-CL": "Negocios y Freelance"
    },
    emoji: "📈",
    subcategories: [
      {
        id: "freelance_income",
        name: {
          en: "Freelance Income",
          es: "Ingresos Freelance",
          "es-CL": "Ingresos Freelance"
        },
        emoji: "🖥️"
      },
      {
        id: "business_income",
        name: {
          en: "Business Income",
          es: "Negocios Propios",
          "es-CL": "Negocios Propios"
        },
        emoji: "💼"
      },
      {
        id: "consulting_income",
        name: {
          en: "Consulting Income",
          es: "Ingresos por Consultoría",
          "es-CL": "Ingresos por Consultoría"
        },
        emoji: "📋"
      }
    ]
  },
  {
    id: "investments",
    name: {
      en: "Investments",
      es: "Inversiones",
      "es-CL": "Inversiones"
    },
    emoji: "🏦",
    subcategories: [
      {
        id: "dividends",
        name: {
          en: "Dividends",
          es: "Dividendos",
          "es-CL": "Dividendos"
        },
        emoji: "💹"
      },
      {
        id: "interest",
        name: {
          en: "Interest",
          es: "Intereses",
          "es-CL": "Intereses"
        },
        emoji: "📊"
      },
      {
        id: "capital_gains",
        name: {
          en: "Capital Gains",
          es: "Ganancias de Capital",
          "es-CL": "Ganancias de Capital"
        },
        emoji: "📈"
      }
    ]
  },
  {
    id: "rental_real_estate",
    name: {
      en: "Rental & Real Estate",
      es: "Arriendos e Inmuebles",
      "es-CL": "Arriendos e Inmuebles"
    },
    emoji: "🏘️",
    subcategories: [
      {
        id: "property_rental",
        name: {
          en: "Property Rental",
          es: "Arriendo de Propiedad",
          "es-CL": "Arriendo de Propiedad"
        },
        emoji: "🏠"
      },
      {
        id: "parking_rental",
        name: {
          en: "Parking Rental",
          es: "Arriendo de Estacionamiento",
          "es-CL": "Arriendo de Estacionamiento"
        },
        emoji: "🅿️"
      },
      {
        id: "other_real_estate_income",
        name: {
          en: "Other Real Estate Income",
          es: "Otros Ingresos Inmobiliarios",
          "es-CL": "Otros Ingresos Inmobiliarios"
        },
        emoji: "🗝️"
      }
    ]
  },
  {
    id: "refunds_returns",
    name: {
      en: "Refunds & Returns",
      es: "Reembolsos y Devoluciones",
      "es-CL": "Reembolsos y Devoluciones"
    },
    emoji: "♻️",
    subcategories: [
      {
        id: "tax_refunds",
        name: {
          en: "Tax Refunds",
          es: "Reembolsos de Impuestos",
          "es-CL": "Reembolsos de Impuestos"
        },
        emoji: "🧾"
      },
      {
        id: "purchase_returns",
        name: {
          en: "Purchase Returns",
          es: "Devoluciones de Compras",
          "es-CL": "Devoluciones de Compras"
        },
        emoji: "🔄"
      },
      {
        id: "insurance_refunds",
        name: {
          en: "Insurance Refunds",
          es: "Reembolsos de Seguros",
          "es-CL": "Reembolsos de Seguros"
        },
        emoji: "🏦"
      }
    ]
  },
  {
    id: "gifts_donations_received",
    name: {
      en: "Gifts & Donations Received",
      es: "Regalos y Donaciones Recibidas",
      "es-CL": "Regalos y Donaciones Recibidas"
    },
    emoji: "🎁",
    subcategories: [
      {
        id: "cash_gifts",
        name: {
          en: "Cash Gifts",
          es: "Regalos en Efectivo",
          "es-CL": "Regalos en Efectivo"
        },
        emoji: "💸"
      },
      {
        id: "inheritance",
        name: {
          en: "Inheritance",
          es: "Herencias",
          "es-CL": "Herencias"
        },
        emoji: "📜"
      },
      {
        id: "donations",
        name: {
          en: "Donations",
          es: "Donaciones",
          "es-CL": "Donaciones"
        },
        emoji: "🤲"
      }
    ]
  },
  {
    id: "other_income",
    name: {
      en: "Other Income",
      es: "Otros Ingresos",
      "es-CL": "Otros Ingresos"
    },
    emoji: "📦",
    subcategories: [
      {
        id: "prizes_lottery",
        name: {
          en: "Prizes / Lottery",
          es: "Premios / Loterías",
          "es-CL": "Premios / Loterías"
        },
        emoji: "🎲"
      },
      {
        id: "subsidies_benefits",
        name: {
          en: "Subsidies / Benefits",
          es: "Subsidios / Ayudas",
          "es-CL": "Subsidios / Ayudas"
        },
        emoji: "🤝"
      },
      {
        id: "alimony_received",
        name: {
          en: "Alimony Received",
          es: "Pensión Alimenticia Recibida",
          "es-CL": "Pensión Alimenticia Recibida"
        },
        emoji: "💼"
      }
    ]
  }
] as const;

// Categorías de Gastos
export const EXPENSE_CATEGORIES = [
  {
    id: "housing",
    name: {
      en: "Housing",
      es: "Vivienda",
      "es-CL": "Vivienda"
    },
    emoji: "🏠",
    subcategories: [
      {
        id: "mortgage",
        name: {
          en: "Mortgage",
          es: "Hipoteca",
          "es-CL": "Crédito Hipotecario"
        },
        emoji: "🏡"
      },
      {
        id: "rent",
        name: {
          en: "Rent",
          es: "Arriendo",
          "es-CL": "Arriendo"
        },
        emoji: "🏘️"
      },
      {
        id: "home_improvement",
        name: {
          en: "Home Improvement",
          es: "Mejoras en el Hogar",
          "es-CL": "Mejoras en la Casa"
        },
        emoji: "🛠️"
      }
    ]
  },
  {
    id: "bills_utilities",
    name: {
      en: "Bills & Utilities",
      es: "Cuentas y Servicios",
      "es-CL": "Cuentas y Servicios"
    },
    emoji: "💡",
    subcategories: [
      {
        id: "electricity",
        name: {
          en: "Electricity",
          es: "Electricidad",
          "es-CL": "Electricidad"
        },
        emoji: "⚡"
      },
      {
        id: "water",
        name: {
          en: "Water",
          es: "Agua",
          "es-CL": "Agua"
        },
        emoji: "💧"
      },
      {
        id: "gas",
        name: {
          en: "Gas",
          es: "Gas",
          "es-CL": "Gas"
        },
        emoji: "🔥"
      },
      {
        id: "internet",
        name: {
          en: "Internet",
          es: "Internet",
          "es-CL": "Internet"
        },
        emoji: "🌐"
      },
      {
        id: "mobile_phone",
        name: {
          en: "Mobile Phone",
          es: "Telefonía Móvil",
          "es-CL": "Telefonía Móvil"
        },
        emoji: "📱"
      },
      {
        id: "cable_tv_streaming_tv",
        name: {
          en: "Cable TV / Streaming TV",
          es: "Televisión Cable / Streaming TV",
          "es-CL": "Televisión Cable / Streaming TV"
        },
        emoji: "📺"
      },
      {
        id: "building_maintenance",
        name: {
          en: "Building Maintenance",
          es: "Administración (gastos comunes)",
          "es-CL": "Administración (gastos comunes)"
        },
        emoji: "🏢"
      }
    ]
  },
  {
    id: "food_dining",
    name: {
      en: "Food & Dining",
      es: "Alimentación",
      "es-CL": "Alimentación"
    },
    emoji: "🍽️",
    subcategories: [
      {
        id: "groceries",
        name: {
          en: "Groceries",
          es: "Supermercado",
          "es-CL": "Supermercado"
        },
        emoji: "🛒"
      },
      {
        id: "restaurants",
        name: {
          en: "Restaurants",
          es: "Restaurantes",
          "es-CL": "Restaurantes"
        },
        emoji: "🍽️"
      },
      {
        id: "fast_food",
        name: {
          en: "Fast Food",
          es: "Comida Rápida",
          "es-CL": "Comida Rápida"
        },
        emoji: "🍔"
      },
      {
        id: "coffee_shops",
        name: {
          en: "Coffee Shops",
          es: "Cafeterías",
          "es-CL": "Cafeterías"
        },
        emoji: "☕"
      },
      {
        id: "food_delivery",
        name: {
          en: "Food Delivery",
          es: "Entrega a Domicilio",
          "es-CL": "Entrega a Domicilio"
        },
        emoji: "🚚"
      }
    ]
  },
  {
    id: "transportation",
    name: {
      en: "Transportation",
      es: "Transporte",
      "es-CL": "Transporte"
    },
    emoji: "🚗",
    subcategories: [
      {
        id: "fuel_gas",
        name: {
          en: "Fuel / Gas",
          es: "Combustible / Bencina",
          "es-CL": "Combustible / Bencina"
        },
        emoji: "⛽"
      },
      {
        id: "public_transportation",
        name: {
          en: "Public Transportation",
          es: "Transporte Público",
          "es-CL": "Transporte Público"
        },
        emoji: "🚌"
      },
      {
        id: "taxi_uber_didi",
        name: {
          en: "Taxi / Uber / DiDi",
          es: "Taxis / Uber / DiDi",
          "es-CL": "Taxis / Uber / DiDi"
        },
        emoji: "🚕"
      },
      {
        id: "parking",
        name: {
          en: "Parking",
          es: "Estacionamiento",
          "es-CL": "Estacionamiento"
        },
        emoji: "🅿️"
      },
      {
        id: "tolls",
        name: {
          en: "Tolls",
          es: "Peajes",
          "es-CL": "Peajes"
        },
        emoji: "🛣️"
      },
      {
        id: "vehicle_maintenance",
        name: {
          en: "Vehicle Maintenance",
          es: "Mantención de Vehículo",
          "es-CL": "Mantención de Vehículo"
        },
        emoji: "🔧"
      },
      {
        id: "vehicle_insurance",
        name: {
          en: "Vehicle Insurance",
          es: "Seguro de Vehículo",
          "es-CL": "Seguro de Vehículo"
        },
        emoji: "🛡️"
      },
      {
        id: "car_loan",
        name: {
          en: "Car Loan",
          es: "Crédito Automotriz",
          "es-CL": "Crédito Automotriz"
        },
        emoji: "💳"
      },
      {
        id: "highway_tag",
        name: {
          en: "Highway Tag",
          es: "TAG",
          "es-CL": "TAG"
        },
        emoji: "🏷️"
      }
    ]
  },
  {
    id: "travel_lifestyle",
    name: {
      en: "Travel & Lifestyle",
      es: "Viajes y Estilo de Vida",
      "es-CL": "Viajes y Estilo de Vida"
    },
    emoji: "✈️",
    subcategories: [
      {
        id: "flights",
        name: {
          en: "Flights",
          es: "Vuelos",
          "es-CL": "Vuelos"
        },
        emoji: "🛫"
      },
      {
        id: "hotels_accommodation",
        name: {
          en: "Hotels / Accommodation",
          es: "Hoteles / Alojamiento",
          "es-CL": "Hoteles / Alojamiento"
        },
        emoji: "🏨"
      },
      {
        id: "vacations",
        name: {
          en: "Vacations",
          es: "Vacaciones",
          "es-CL": "Vacaciones"
        },
        emoji: "🏖️"
      },
      {
        id: "entertainment",
        name: {
          en: "Entertainment",
          es: "Entretenimiento",
          "es-CL": "Entretenimiento"
        },
        emoji: "🎭"
      },
      {
        id: "sports",
        name: {
          en: "Sports",
          es: "Deportes",
          "es-CL": "Deportes"
        },
        emoji: "⚽"
      },
      {
        id: "hobbies",
        name: {
          en: "Hobbies",
          es: "Hobbies",
          "es-CL": "Hobbies"
        },
        emoji: "🎨"
      }
    ]
  },
  {
    id: "subscriptions_streaming",
    name: {
      en: "Subscriptions & Streaming",
      es: "Suscripciones y Streaming",
      "es-CL": "Suscripciones y Streaming"
    },
    emoji: "📱",
    subcategories: [
      {
        id: "netflix",
        name: {
          en: "Netflix",
          es: "Netflix",
          "es-CL": "Netflix"
        },
        emoji: "🎬"
      },
      {
        id: "spotify",
        name: {
          en: "Spotify",
          es: "Spotify",
          "es-CL": "Spotify"
        },
        emoji: "🎵"
      },
      {
        id: "amazon_prime",
        name: {
          en: "Amazon Prime",
          es: "Amazon Prime",
          "es-CL": "Amazon Prime"
        },
        emoji: "📦"
      },
      {
        id: "disney_plus",
        name: {
          en: "Disney+",
          es: "Disney+",
          "es-CL": "Disney+"
        },
        emoji: "🏰"
      },
      {
        id: "hbo_max",
        name: {
          en: "HBO Max",
          es: "HBO Max",
          "es-CL": "HBO Max"
        },
        emoji: "🎭"
      },
      {
        id: "apple_music",
        name: {
          en: "Apple Music",
          es: "Apple Music",
          "es-CL": "Apple Music"
        },
        emoji: "🎧"
      },
      {
        id: "youtube_premium",
        name: {
          en: "YouTube Premium",
          es: "YouTube Premium",
          "es-CL": "YouTube Premium"
        },
        emoji: "📹"
      },
      {
        id: "gym",
        name: {
          en: "Gym",
          es: "Gimnasio",
          "es-CL": "Gimnasio"
        },
        emoji: "💪"
      },
      {
        id: "clubs_memberships",
        name: {
          en: "Clubs / Memberships",
          es: "Clubes / Membresías",
          "es-CL": "Clubes / Membresías"
        },
        emoji: "🎟️"
      },
      {
        id: "software_apps",
        name: {
          en: "Software / Apps",
          es: "Software / Apps",
          "es-CL": "Software / Apps"
        },
        emoji: "💻"
      },
      {
        id: "magazines_newspapers",
        name: {
          en: "Magazines / Newspapers",
          es: "Revistas / Periódicos",
          "es-CL": "Revistas / Periódicos"
        },
        emoji: "📰"
      },
      {
        id: "cloud_storage",
        name: {
          en: "Cloud Storage",
          es: "Almacenamiento en la Nube",
          "es-CL": "Almacenamiento en la Nube"
        },
        emoji: "☁️"
      },
      {
        id: "books_audiobooks",
        name: {
          en: "Books / Audiobooks",
          es: "Libros / Audiolibros",
          "es-CL": "Libros / Audiolibros"
        },
        emoji: "📚"
      },
      {
        id: "online_education",
        name: {
          en: "Online Education",
          es: "Educación en Línea",
          "es-CL": "Educación en Línea"
        },
        emoji: "🎓"
      },
      {
        id: "other_streaming_services",
        name: {
          en: "Other Streaming Services",
          es: "Otros Servicios de Streaming",
          "es-CL": "Otros Servicios de Streaming"
        },
        emoji: "📡"
      }
    ]
  },
  {
    id: "shopping",
    name: {
      en: "Shopping",
      es: "Compras",
      "es-CL": "Compras"
    },
    emoji: "🛍️",
    subcategories: [
      {
        id: "clothing",
        name: {
          en: "Clothing",
          es: "Ropa",
          "es-CL": "Ropa"
        },
        emoji: "👕"
      },
      {
        id: "shoes",
        name: {
          en: "Shoes",
          es: "Calzado",
          "es-CL": "Calzado"
        },
        emoji: "👟"
      },
      {
        id: "electronics",
        name: {
          en: "Electronics",
          es: "Electrónica",
          "es-CL": "Electrónica"
        },
        emoji: "📱"
      },
      {
        id: "furniture",
        name: {
          en: "Furniture",
          es: "Muebles",
          "es-CL": "Muebles"
        },
        emoji: "🛋️"
      },
      {
        id: "home_decor",
        name: {
          en: "Home Decor",
          es: "Decoración para el Hogar",
          "es-CL": "Decoración para el Hogar"
        },
        emoji: "🖼️"
      },
      {
        id: "books",
        name: {
          en: "Books",
          es: "Libros",
          "es-CL": "Libros"
        },
        emoji: "📖"
      },
      {
        id: "toys",
        name: {
          en: "Toys",
          es: "Juguetes",
          "es-CL": "Juguetes"
        },
        emoji: "🧸"
      },
      {
        id: "gifts",
        name: {
          en: "Gifts",
          es: "Regalos",
          "es-CL": "Regalos"
        },
        emoji: "🎁"
      },
      {
        id: "personal_care",
        name: {
          en: "Personal Care",
          es: "Cuidado Personal",
          "es-CL": "Cuidado Personal"
        },
        emoji: "💄"
      },
      {
        id: "pets",
        name: {
          en: "Pets",
          es: "Mascotas",
          "es-CL": "Mascotas"
        },
        emoji: "🐾"
      },
      {
        id: "other",
        name: {
          en: "Other",
          es: "Otros",
          "es-CL": "Otros"
        },
        emoji: "🛒"
      }
    ]
  },
  {
    id: "health_wellness",
    name: {
      en: "Health & Wellness",
      es: "Salud y Bienestar",
      "es-CL": "Salud y Bienestar"
    },
    emoji: "🏥",
    subcategories: [
      {
        id: "health_insurance",
        name: {
          en: "Health Insurance",
          es: "Seguro de Salud",
          "es-CL": "Seguro de Salud"
        },
        emoji: "🛡️"
      },
      {
        id: "medications",
        name: {
          en: "Medications",
          es: "Medicamentos",
          "es-CL": "Medicamentos"
        },
        emoji: "💊"
      },
      {
        id: "medical_consultations",
        name: {
          en: "Medical Consultations",
          es: "Consultas Médicas",
          "es-CL": "Consultas Médicas"
        },
        emoji: "👨‍⚕️"
      },
      {
        id: "dentist",
        name: {
          en: "Dentist",
          es: "Dentista",
          "es-CL": "Dentista"
        },
        emoji: "🦷"
      },
      {
        id: "therapy_psychology",
        name: {
          en: "Therapy / Psychology",
          es: "Terapia / Psicología",
          "es-CL": "Terapia / Psicología"
        },
        emoji: "🧠"
      },
      {
        id: "optical",
        name: {
          en: "Optical",
          es: "Óptica",
          "es-CL": "Óptica"
        },
        emoji: "👓"
      },
      {
        id: "vitamins_supplements",
        name: {
          en: "Vitamins / Supplements",
          es: "Vitaminas / Suplementos",
          "es-CL": "Vitaminas / Suplementos"
        },
        emoji: "💊"
      }
    ]
  },
  {
    id: "education",
    name: {
      en: "Education",
      es: "Educación",
      "es-CL": "Educación"
    },
    emoji: "📚",
    subcategories: [
      {
        id: "tuition_enrollment",
        name: {
          en: "Tuition / Enrollment",
          es: "Colegiatura / Matrícula",
          "es-CL": "Colegiatura / Matrícula"
        },
        emoji: "🎓"
      },
      {
        id: "books_materials",
        name: {
          en: "Books / Materials",
          es: "Libros / Materiales",
          "es-CL": "Libros / Materiales"
        },
        emoji: "📖"
      },
      {
        id: "courses_workshops",
        name: {
          en: "Courses / Workshops",
          es: "Cursos / Talleres",
          "es-CL": "Cursos / Talleres"
        },
        emoji: "👨‍🏫"
      },
      {
        id: "school_uniforms",
        name: {
          en: "School Uniforms",
          es: "Uniformes Escolares",
          "es-CL": "Uniformes Escolares"
        },
        emoji: "🎽"
      }
    ]
  },
  {
    id: "insurance",
    name: {
      en: "Insurance",
      es: "Seguros",
      "es-CL": "Seguros"
    },
    emoji: "🛡️",
    subcategories: [
      {
        id: "life_insurance",
        name: {
          en: "Life Insurance",
          es: "Seguro de Vida",
          "es-CL": "Seguro de Vida"
        },
        emoji: "💼"
      },
      {
        id: "home_insurance",
        name: {
          en: "Home Insurance",
          es: "Seguro del Hogar",
          "es-CL": "Seguro del Hogar"
        },
        emoji: "🏠"
      },
      {
        id: "other_insurance",
        name: {
          en: "Other Insurance",
          es: "Otros Seguros",
          "es-CL": "Otros Seguros"
        },
        emoji: "📋"
      }
    ]
  },
  {
    id: "financial",
    name: {
      en: "Financial",
      es: "Finanzas",
      "es-CL": "Finanzas"
    },
    emoji: "💰",
    subcategories: [
      {
        id: "credit_cards",
        name: {
          en: "Credit Cards",
          es: "Tarjetas de Crédito",
          "es-CL": "Tarjetas de Crédito"
        },
        emoji: "💳"
      },
      {
        id: "consumer_loans",
        name: {
          en: "Consumer Loans",
          es: "Crédito de Consumo",
          "es-CL": "Crédito de Consumo"
        },
        emoji: "🏦"
      },
      {
        id: "investments",
        name: {
          en: "Investments",
          es: "Inversiones",
          "es-CL": "Inversiones"
        },
        emoji: "📈"
      },
      {
        id: "savings",
        name: {
          en: "Savings",
          es: "Ahorros",
          "es-CL": "Ahorros"
        },
        emoji: "🏦"
      },
      {
        id: "bank_fees",
        name: {
          en: "Bank Fees",
          es: "Comisiones Bancarias",
          "es-CL": "Comisiones Bancarias"
        },
        emoji: "💵"
      }
    ]
  },
  {
    id: "taxes",
    name: {
      en: "Taxes",
      es: "Impuestos",
      "es-CL": "Impuestos"
    },
    emoji: "📄",
    subcategories: [
      {
        id: "income_tax",
        name: {
          en: "Income Tax",
          es: "Impuesto a la Renta",
          "es-CL": "Impuesto a la Renta"
        },
        emoji: "💰"
      },
      {
        id: "property_tax",
        name: {
          en: "Property Tax",
          es: "Contribuciones",
          "es-CL": "Contribuciones"
        },
        emoji: "🏠"
      },
      {
        id: "vat",
        name: {
          en: "VAT",
          es: "IVA",
          "es-CL": "IVA"
        },
        emoji: "🧾"
      },
      {
        id: "other_taxes",
        name: {
          en: "Other Taxes",
          es: "Otros Impuestos",
          "es-CL": "Otros Impuestos"
        },
        emoji: "📋"
      }
    ]
  },
  {
    id: "childcare",
    name: {
      en: "Childcare",
      es: "Cuidado de Niños",
      "es-CL": "Cuidado de Niños"
    },
    emoji: "👶",
    subcategories: [
      {
        id: "daycare_nursery",
        name: {
          en: "Daycare / Nursery",
          es: "Jardín Infantil / Sala Cuna",
          "es-CL": "Jardín Infantil / Sala Cuna"
        },
        emoji: "🏫"
      },
      {
        id: "babysitter",
        name: {
          en: "Babysitter",
          es: "Niñera",
          "es-CL": "Niñera"
        },
        emoji: "👩‍🍼"
      },
      {
        id: "diapers_baby_items",
        name: {
          en: "Diapers / Baby Items",
          es: "Pañales / Artículos de Bebé",
          "es-CL": "Pañales / Artículos de Bebé"
        },
        emoji: "🍼"
      }
    ]
  },
  {
    id: "family_dependents",
    name: {
      en: "Family & Dependents",
      es: "Familia y Dependientes",
      "es-CL": "Familia y Dependientes"
    },
    emoji: "👨‍👩‍👧‍👦",
    subcategories: [
      {
        id: "child_support",
        name: {
          en: "Child Support",
          es: "Manutención",
          "es-CL": "Manutención"
        },
        emoji: "👶"
      },
      {
        id: "alimony",
        name: {
          en: "Alimony",
          es: "Pensión Alimenticia",
          "es-CL": "Pensión Alimenticia"
        },
        emoji: "💰"
      },
      {
        id: "elderly_care",
        name: {
          en: "Elderly Care",
          es: "Cuidado de Adultos Mayores",
          "es-CL": "Cuidado de Adultos Mayores"
        },
        emoji: "👴"
      }
    ]
  },
  {
    id: "donations",
    name: {
      en: "Donations",
      es: "Donaciones",
      "es-CL": "Donaciones"
    },
    emoji: "🤲",
    subcategories: [
      {
        id: "charity",
        name: {
          en: "Charity",
          es: "Caridad",
          "es-CL": "Caridad"
        },
        emoji: "❤️"
      },
      {
        id: "foundations",
        name: {
          en: "Foundations",
          es: "Fundaciones",
          "es-CL": "Fundaciones"
        },
        emoji: "🏛️"
      },
      {
        id: "church",
        name: {
          en: "Church",
          es: "Iglesia",
          "es-CL": "Iglesia"
        },
        emoji: "⛪"
      }
    ]
  },
  {
    id: "other_expenses",
    name: {
      en: "Other Expenses",
      es: "Otros Gastos",
      "es-CL": "Otros Gastos"
    },
    emoji: "📦",
    subcategories: [
      {
        id: "fines",
        name: {
          en: "Fines",
          es: "Multas",
          "es-CL": "Multas"
        },
        emoji: "⚠️"
      },
      {
        id: "legal_expenses",
        name: {
          en: "Legal Expenses",
          es: "Gastos Legales",
          "es-CL": "Gastos Legales"
        },
        emoji: "⚖️"
      },
      {
        id: "miscellaneous",
        name: {
          en: "Miscellaneous",
          es: "Varios",
          "es-CL": "Varios"
        },
        emoji: "📋"
      }
    ]
  }
] as const;
