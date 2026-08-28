// Corpus de evaluación del motor de verificación (SPEC-01 / INC-01-T14). Activo
// del capítulo de evaluación: textos etiquetados que DEBEN pasar y que DEBEN
// fallar por cada dimensión (legibilidad, vocabulario, longitud de frase,
// longitud de página), con los valores PROVISIONALES de la tabla maestra.
//
// Cada caso referencia el escenario Gherkin de SPEC-01 §5 que ilustra (DoD12) y
// se valida contra el motor real (silabajs) en el test del corpus. Los
// parámetros de cada caso se ajustan para AISLAR la dimensión bajo prueba (el
// resto se deja laxo), salvo el caso "happy" que usa valores realistas de F1.

export interface CorpusParameters {
  readonly readabilityRange: { readonly min: number; readonly max: number | null };
  readonly maxLengthPerPage: number;
  readonly maxSentenceLength: number;
  readonly allowedFrequencyList: readonly string[];
  readonly maxPercentageWordsOutsideList: number;
}

export interface CorpusExpectation {
  readonly verdictPasses: boolean;
  readonly readabilityPasses?: boolean;
  readonly vocabularyPasses?: boolean;
  readonly sentenceLengthPasses?: boolean;
  readonly pageLengthPasses?: boolean;
  readonly minPages?: number;
  readonly warnings?: number;
}

export interface VerificationCorpusCase {
  readonly id: string;
  /** Escenario de SPEC-01 §5 que ilustra (DoD12). */
  readonly scenario: string;
  readonly narrative: string;
  readonly characterNames: readonly string[];
  readonly parameters: CorpusParameters;
  readonly expected: CorpusExpectation;
}

// Parámetros laxos por defecto: no interfieren en la dimensión bajo prueba.
const LENIENT = {
  readabilityRange: { min: 0, max: null } as const,
  maxLengthPerPage: 1000,
  maxSentenceLength: 1000,
  maxPercentageWordsOutsideList: 100,
};

export const VERIFICATION_CORPUS: ReadonlyArray<VerificationCorpusCase> = [
  {
    id: "happy-path",
    scenario: "Cuento que cumple todas las restricciones",
    narrative: "El gato ríe. El sol da luz. La casa es azul.",
    characterNames: [],
    parameters: {
      // Valores provisionales F1 (tabla maestra).
      readabilityRange: { min: 80, max: null },
      maxLengthPerPage: 70,
      maxSentenceLength: 8,
      allowedFrequencyList: [
        "el",
        "gato",
        "ríe",
        "sol",
        "da",
        "luz",
        "la",
        "casa",
        "es",
        "azul",
      ],
      maxPercentageWordsOutsideList: 5,
    },
    expected: {
      verdictPasses: true,
      readabilityPasses: true,
      vocabularyPasses: true,
      sentenceLengthPasses: true,
      pageLengthPasses: true,
    },
  },
  {
    id: "readability-fail",
    scenario: "Cuento que no cumple la legibilidad",
    narrative:
      "La incomprensibilidad multidimensional caracterizaba extraordinariamente aquella complicadísima situación administrativa interdepartamental profundamente burocratizada.",
    characterNames: [],
    parameters: {
      ...LENIENT,
      readabilityRange: { min: 80, max: null }, // F1: piso alto de legibilidad
      allowedFrequencyList: ["x"],
    },
    expected: { verdictPasses: false, readabilityPasses: false },
  },
  {
    id: "vocabulary-fail",
    scenario: "Cuento que no cumple el vocabulario",
    narrative: "El dragón feroz vuela sobre montañas nevadas.",
    characterNames: [],
    parameters: {
      ...LENIENT,
      allowedFrequencyList: ["el"],
      maxPercentageWordsOutsideList: 5, // F1
    },
    expected: { verdictPasses: false, vocabularyPasses: false },
  },
  {
    id: "vocabulary-names-pass",
    scenario: "Nombres propios no penalizan el vocabulario",
    narrative: "Pipo y Lola juegan felices.",
    characterNames: ["Pipo", "Lola"],
    parameters: {
      ...LENIENT,
      allowedFrequencyList: ["y", "juegan", "felices"],
      maxPercentageWordsOutsideList: 5,
    },
    expected: { verdictPasses: true, vocabularyPasses: true },
  },
  {
    id: "sentence-length-fail",
    scenario: "Cuento con una frase demasiado larga",
    narrative:
      "El pequeño conejo blanco corre muy rápido por el campo verde hoy.",
    characterNames: [],
    parameters: {
      ...LENIENT,
      maxSentenceLength: 8, // F1: la frase tiene 12 palabras
      allowedFrequencyList: ["x"],
    },
    expected: { verdictPasses: false, sentenceLengthPasses: false },
  },
  {
    id: "pagination-oversized-warning",
    scenario: "Frase única sobredimensionada",
    narrative:
      "El pequeño conejo blanco corre muy rápido por el campo verde hoy.",
    characterNames: [],
    parameters: {
      ...LENIENT,
      maxLengthPerPage: 10, // la única frase (12 palabras) excede la página
      allowedFrequencyList: ["x"],
    },
    expected: {
      verdictPasses: true,
      pageLengthPasses: true,
      warnings: 1,
    },
  },
  {
    id: "pagination-multiple-pages",
    scenario: "Sobrante que genera varias páginas nuevas",
    narrative: "Uno dos tres. Cuatro cinco seis. Siete ocho nueve. Diez once doce.",
    characterNames: [],
    parameters: {
      ...LENIENT,
      maxLengthPerPage: 3, // cada frase (3 palabras) llena una página
      allowedFrequencyList: ["x"],
    },
    expected: {
      verdictPasses: true,
      pageLengthPasses: true,
      minPages: 4,
    },
  },
];
