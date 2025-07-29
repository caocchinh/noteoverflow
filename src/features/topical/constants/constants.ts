import { ValidCurriculum } from "@/constants/types";
import type {
  FiltersCache,
  InvalidInputs,
  LayoutStyle,
  TopicalData,
} from "./types";

export const CURRICULUM_COVER_IMAGE: Record<ValidCurriculum, string> = {
  "CIE A-LEVEL": "/assets/cover/alevels-logo1.webp",
  "CIE IGCSE": "/assets/cover/igcse-logo1.webp",
};

export const SUBJECT_COVER_IMAGE: Record<
  ValidCurriculum,
  Record<string, string>
> = {
  "CIE A-LEVEL": {
    "Physics (9702)": "/assets/cover/Physics (9702).webp",
    "Chemistry (9701)": "/assets/cover/Chemistry (9701).webp",
    "Biology (9700)": "/assets/cover/Biology (9700).webp",
    "Pure Mathematics 1 (9709)": "/assets/cover/Pure 1 (9709).webp",
    "Mechanics (9709)": "/assets/cover/Mechanics (9709).webp",
    "Mathematics Probability & Statistics 1 (9709)":
      "/assets/cover/Probability & Statistics 1 (9709).webp",
    "Mathematics Probability & Statistics 2 (9709)":
      "/assets/cover/Probability & Statistics 2 (9709).webp",
    "Mathematics Pure Math 2,3 (9709)": "/assets/cover/Pure 2&3 (9709).webp",
    "Computer Science (9608)": "/assets/cover/Computer Science (9608).webp",
    "Computer Science (9618)": "/assets/cover/Computer Science (9618).webp",
    "Further Mathematics (9231)":
      "/assets/cover/Further Mathematics (9231).webp",
    "Economics (9708)": "/assets/cover/Economics (9708).webp",
    "Psychology (9990)": "/assets/cover/Psychology (9990).webp",
    "Mathematics Mechanics 1 (9709)":
      "/assets/cover/Mathematics Mechanics 1 (9709).webp",
    "Mathematics Mechanics 2 (9709)":
      "/assets/cover/Mathematics Mechanics 2 (9709).webp",
    "Mathematics Statistics 1 (9709)":
      "/assets/cover/Mathematics Statistics 1 (9709).webp",
    "Mathematics Statistics 2 (9709)":
      "/assets/cover/Mathematics Statistics 2 (9709).webp",
  },
  "CIE IGCSE": {
    "Physics (9702)": "/assets/cover/Physics (9702).webp",
    "Chemistry (9701)": "/assets/cover/Chemistry (9701).webp",
    "Biology (9700)": "/assets/cover/Biology (9700).webp",
    "Pure Mathematics 1 (9709)": "/assets/cover/Pure 1 (9709).webp",
  },
};

export const TOPICAL_DATA: TopicalData[] = [
  {
    curriculum: "CIE A-LEVEL",
    coverImage: CURRICULUM_COVER_IMAGE["CIE A-LEVEL"],
    subject: [
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Physics (9702)"],
        code: "Physics (9702)",
        topic: [
          "PHYSICAL QUANTITIES & UNITS",
          "MEASUREMENT TECHNIQUES",
          "KINEMATICS",
          "DYNAMICS",
          "FORCES, DENSITY & PRESSURE",
          "WORK, ENERGY & POWER",
          "MOTION IN A CIRCLE",
          "GRAVITATIONAL FIELDS",
          "DEFORMATION OF SOLIDS",
          "IDEAL GASES",
          "TEMPERATURE",
          "THERMAL PROPERTIES OF MATERIALS",
          "OSCILLATIONS",
          "WAVES",
          "SUPERPOSITION",
          "COMMUNICATION",
          "ELECTRIC FIELDS",
          "CAPACITANCE",
          "CURRENT OF ELECTRICITY",
          "D.C. CIRCUITS",
          "ELECTRONICS",
          "MAGNETIC FIELDS",
          "ELECTROMAGNETIC INDUCTION",
          "ALTERNATING CURRENTS",
          "QUANTUM PHYSICS",
          "PARTICLE & NUCLEAR PHYSICS",
          "MEDICAL IMAGING",
          "ASTRONOMY & COSMOLOGY",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [1, 2, 3, 4, 5],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Chemistry (9701)"],
        code: "Chemistry (9701)",
        topic: [
          "ATOMS, MOLECULES & STOICHIOMETRY",
          "ATOMIC STRUCTURE",
          "CHEMICAL BONDING",
          "STATES OF MATTER",
          "CHEMICAL ENERGETICS",
          "ELECTROCHEMISTRY",
          "EQUILIBRIA",
          "REACTION KINETICS",
          "THE PERIODIC TABLE- CHEMICAL PERIODICITY",
          "GROUP 2",
          "GROUP 17",
          "AN INTRODUCTION TO THE CHEMISTRY OF TRANSITION ELEMENTS",
          "NITROGEN & SULFUR",
          "AN INTRODUCTION TO ORGANIC CHEMISTRY",
          "HYDROCARBONS",
          "HALOGEN DERIVATIVES",
          "HYDROXY COMPOUNDS",
          "CARBONYL COMPOUNDS",
          "CARBOXYLIC ACIDS AND DERIVATIVES",
          "NITROGEN COMPOUNDS",
          "POLYMERISATION",
          "ANALYTICAL TECHNIQUES",
          "ORGANIC SYNTHESIS",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [1, 2, 3, 4, 5],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Biology (9700)"],
        code: "Biology (9700)",
        topic: [
          "CELL STRUCTURE",
          "BIOLOGICAL MOLECULES",
          "ENZYMES",
          "CELL MEMBRANES AND TRANSPORT",
          "THE MITOTIC CELL CYCLE",
          "NUCLEIC ACIDS AND PROTEIN SYNTHESIS",
          "TRANSPORT IN PLANTS",
          "TRANSPORT IN MAMMALS",
          "GAS EXCHANGE AND SMOKING",
          "INFECTIOUS DISEASE",
          "IMMUNITY",
          "ENERGY AND RESPIRATION",
          "PHOTOSYNTHESIS",
          "HOMEOSTASIS",
          "CONTROL AND CO-ORDINATION",
          "INHERITED CHANGE",
          "SELECTION AND EVOLUTION",
          "BIODIVERSITY, CLASSIFICATION AND CONSERVATION",
          "GENETIC TECHNOLOGY",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [1, 2, 3, 4, 5],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Pure Mathematics 1 (9709)"],
        code: "Pure Mathematics 1 (9709)",
        topic: [
          "COORDINATES GEOMETRY",
          "FUNCTIONS",
          "INTERSECTION POINTS",
          "DIFFERENTIATION",
          "SEQUENCES & SERIES",
          "BINOMIAL THEOREM",
          "TRIGONOMETRY",
          "VECTORS",
          "INTEGRATION",
          "RADIANS",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [1],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mechanics (9709)"],
        code: "Mechanics (9709)",
        topic: [
          "FORCES & EQUILIBRIUM",
          "KINEMATICS OF MOTION IN A STRAIGHT LINE",
          "NEWTON'S LAWS OF MOTION",
          "ENERGY, WORK & POWER",
          "GENERAL MOTION IN STRAIGHT LINE",
          "MOMENTUM",
        ],
        year: [2024, 2023, 2022, 2021, 2020],
        paperType: [4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Mathematics Probability & Statistics 1 (9709)"
          ],
        code: "Mathematics Probability & Statistics 1 (9709)",
        topic: [
          "REPRESENTATION OF DATA",
          "PERMUTATION & COMBINATION",
          "PROBABILITY",
          "DISCRETE RANDOM VARIABLES",
          "THE NORMAL DISTRIBUTION",
          "THE BINOMIAL DISTRIBUTION",
          "GEOMETRIC DISTRIBUTION",
        ],
        year: [2024, 2023, 2022, 2021, 2020],
        paperType: [5],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Mathematics Probability & Statistics 2 (9709)"
          ],
        code: "Mathematics Probability & Statistics 2 (9709)",
        topic: [
          "HYPOTHESIS TESTING USING BINOMIAL DISTRIBUTION",
          "HYPOTHESIS TESTING USING NORMAL DISTRIBUTION",
          "POISSON DISTRIBUTION",
          "LINEAR COMBINATION OF RANDOM VARIABLES",
          "CONTINUOUS RANDOM VARIABLES",
          "SAMPLING",
        ],
        year: [2024, 2023, 2022, 2021, 2020],
        paperType: [6],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Mathematics Pure Math 2,3 (9709)"
          ],
        code: "Mathematics Pure Math 2,3 (9709)",
        topic: [
          "ALGEBRA",
          "LOGARITHMIC & EXPONENTIAL FUNCTIONS",
          "TRIGONOMETRY",
          "DIFFERENTIATION",
          "INTEGRATION",
          "DIFFERENTIAL EQUATION",
          "NUMERICAL METHODS",
          "COMPLEX NUMBERS",
          "VECTORS",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [2, 3],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Computer Science (9608)"],
        code: "Computer Science (9608)",
        topic: [
          "INFORMATION REPRESENTATION",
          "COMMUNICATION AND INTERNET TECHNOLOGIES",
          "HARDWARE",
          "PROCESSOR FUNDAMENTALS",
          "SYSTEM SOFTWARE",
          "SECURITY, PRIVACY AND DATA INTEGRITY",
          "ETHICS AND OWNERSHIP",
          "DATABASE AND DATA MODELING",
          "ALGORITHM DESIGN AND PROBLEM-SOLVING",
          "DATA REPRESENTATION",
          "PROGRAMMING",
          "MONITORING AND CONTROL SYSTEMS",
        ],
        year: [2021, 2020, 2019, 2018, 2017, 2016, 2015],
        paperType: [1],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Computer Science (9618)"],
        code: "Computer Science (9618)",
        topic: [
          "INFORMATION REPRESENTATION",
          "COMMUNICATION",
          "HARDWARE",
          "PROCESSOR FUNDAMENTALS",
          "SYSTEM SOFTWARE (OS)",
          "SECURITY, PRIVACY AND DATA INTEGRITY",
          "ETHICS AND OWNERSHIP",
          "DATABASES",
          "ALGORITHM DESIGN AND PROBLEM-SOLVING",
          "DATA TYPES AND STRUCTURES",
          "PROGRAMMING",
          "SOFTWARE DEVELOPMENT",
          "DATA REPRESENTATION",
          "COMMUNICATION AND INTERNET TECHNOLOGIES",
          "HARDWARE AND VIRTUAL MACHINES",
          "SYSTEM SOFTWARE (PURPOSES OF AN OS)",
          "SECURITY",
          "ARTIFICIAL INTELLIGENCE (AI)",
          "COMPUTATIONAL THINKING AND PROBLEM SOLVING",
          "FURTHER PROGRAMMING",
        ],
        year: [2024, 2023, 2022, 2021],
        paperType: [1, 3],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Further Mathematics (9231)"],
        code: "Further Mathematics (9231)",
        topic: [
          "ROOTS OF POLYNOMIAL EQUATIONS",
          "RATIONAL FUNCTIONS AND GRAPHS",
          "SUMMATION OF SERIES",
          "MATRICES",
          "POLAR COORDINATES",
          "VECTORS",
          "PROOF BY INDUCTION",
          "HYPERBOLIC FUNCTIONS",
          "DIFFERENTIATION",
          "INTEGRATION",
          "COMPLEX NUMBERS",
          "DIFFERENTIAL EQUATIONS",
          "MOMENTUM AND IMPULSE",
          "CIRCULAR MOTION",
          "EQUILIBRIUM OF A RIGID BODY UNDER COPLANAR FORCES",
          "ROTATION OF A RIGID BODY",
          "SIMPLE HARMONIC MOTION",
          "FURTHER WORK ON DISTRIBUTIONS",
          "INFERENCE USING NORMAL AND T-DISTRIBUTIONS",
          "X2 TEST",
          "BIVARIATE DATA",
          "PROJECTILE MOTION",
          "LINEAR MOTION UNDER VARIABLE FORCE",
          "NON PARAMETRIC TEST",
          "CONTINUOUS RANDOM VARIABLE",
          "PROBABILITY GENERATING FUNCTION",
          "HOOK'S LAW",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012,
        ],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Economics (9708)"],
        code: "Economics (9708)",
        topic: [
          "BASIC ECONOMIC IDEAS AND RESOURCE ALLOCATION",
          "THE PRICE SYSTEM AND THE MICRO ECONOMY",
          "GOVERNMENT MICROECONOMIC INTERVENTION",
          "THE MACRO ECONOMY",
          "GOVERNMENT MACRO INTERVENTION",
          "INTERNATIONAL ECONOMIC ISSUES",
        ],
        year: [
          2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014,
          2013, 2012,
        ],
        paperType: [1, 3],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Psychology (9990)"],
        code: "Psychology (9990)",
        topic: [
          "APPROACHES, ISSUES AND DEBATES",
          "RESEARCH METHODS",
          "THEORY- PSYCHOLOGY AND ABNORMALITY",
          "THEORY- PSYCHOLOGY AND CONSUMER BEHAVIOUR",
          "THEORY- PSYCHOLOGY AND HEALTH",
          "THEORY- PSYCHOLOGY AND ORGANISATIONS",
          "CLINICAL PSYCHOLOGY",
          "CONSUMER PSYCHOLOGY",
          "HEALTH PSYCHOLOGY",
          "ORGANISATIONAL PSYCHOLOGY",
        ],
        year: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mathematics Mechanics 1 (9709)"],
        code: "Mathematics Mechanics 1 (9709)",
        topic: [
          "FORCES & EQUILIBRIUM",
          "KINEMATICS OF MOTION IN A STRAIGHT LINE",
          "NEWTON'S LAWS OF MOTION",
          "ENERGY, WORK & POWER",
          "GENERAL MOTION IN STRAIGHT LINE",
          "MOMENTUM",
        ],
        year: [
          2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mathematics Mechanics 2 (9709)"],
        code: "Mathematics Mechanics 2 (9709)",
        topic: [
          "MOTION OF A PROJECTILE",
          "MOMENTS OF FORCES",
          "CENTRE OF MASS",
          "UNIFORM MOTION IN A CIRCLE",
          "HOOK'S LAW",
          "LINEAR MOTION UNDER A VARIABLE FORCE",
        ],
        year: [2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        paperType: [5],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mathematics Statistics 1 (9709)"],
        code: "Mathematics Statistics 1 (9709)",
        topic: [
          "REPRESENTATION OF DATA",
          "PERMUTATION & COMBINATION",
          "PROBABILITY",
          "DISCRETE RANDOM VARIABLES",
          "THE NORMAL DISTRIBUTION",
          "THE BINOMIAL DISTRIBUTION",
          "GEOMETRIC DISTRIBUTION",
        ],
        year: [
          2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [6],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mathematics Statistics 2 (9709)"],
        code: "Mathematics Statistics 2 (9709)",
        topic: [
          "HYPOTHESIS TESTING USING BINOMIAL DISTRIBUTION",
          "HYPOTHESIS TESTING USING NORMAL DISTRIBUTION",
          "POISSON DISTRIBUTION",
          "LINEAR COMBINATION OF RANDOM VARIABLES",
          "CONTINUOUS RANDOM VARIABLES",
          "SAMPLING",
        ],
        year: [2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
        paperType: [7],
        season: ["Summer", "Winter"],
      },
    ],
  },
];

export const BESTEXAMHELP_DOMAIN = "https://bestexamhelp.com/exam";

export const BESTEXAMHELP_SUBJECT_CODE: Record<string, string> = {
  "9702": "physics-9702",
  "9701": "chemistry-9701",
  "9709": "mathematics-9709",
  "9618": "computer-science-9618",
  "9608": "computer-science-9608",
  "9700": "biology-9700",
  "9708": "economics-9708",
  "9609": "business-9609",
  "9990": "psychology-9990",
  "9231": "mathematics-further-9231",
};

export const BESTEXAMHELP_CURRICULUM_CODE_PREFIX: Record<
  ValidCurriculum,
  string
> = {
  "CIE A-LEVEL": "cambridge-international-a-level",
  "CIE IGCSE": "",
};

export const FILTERS_CACHE_KEY = "noteoverflow-filters-cache";

export const INVALID_INPUTS_DEFAULT: InvalidInputs = {
  curriculum: false,
  subject: false,
  topic: false,
  year: false,
  paperType: false,
  season: false,
};

export const DEFAULT_NUMBER_OF_COLUMNS = 3;

export const COLUMN_BREAKPOINTS = {
  1: { 0: 1 },
  2: { 0: 1, 1: 2 },
  3: { 0: 1, 1: 2, 500: 3 },
  4: { 0: 1, 1: 2, 500: 3, 790: 4 },
  5: { 0: 1, 1: 2, 500: 3, 790: 4, 900: 5 },
};

export const MAX_TOPIC_SELECTION = 5;
export const INFINITE_SCROLL_CHUNK_SIZE = 35;
export const CACHE_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 3;

export const DEFAULT_LAYOUT_STYLE: LayoutStyle = "pagination";
export const DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE = 50;
export const MAX_NUMBER_OF_COLUMNS = 5;
export const MAXIMUM_NUMBER_OF_QUESTIONS_PER_PAGE = 100;

export const YEAR_SORT_DEFAULT_WEIGHT = 1;
export const PAPER_TYPE_SORT_DEFAULT_WEIGHT = 0;
export const SEASON_SORT_DEFAULT_WEIGHT = 0;
export const TOPIC_SORT_DEFAULT_WEIGHT = 0;
export const MAX_NUMBER_OF_RECENT_QUERIES = 30;
export const DEFAULT_SORT_BY: "ascending" | "descending" = "descending";
export const DEFAULT_IMAGE_THEME = "light";

export const DEFAULT_CACHE: FiltersCache = {
  imageTheme: DEFAULT_IMAGE_THEME,
  recentlySearchSortedBy: DEFAULT_SORT_BY,
  numberOfColumns: DEFAULT_NUMBER_OF_COLUMNS,
  layoutStyle: DEFAULT_LAYOUT_STYLE,
  numberOfQuestionsPerPage: DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  isSessionCacheEnabled: true,
  isPersistantCacheEnabled: true,
  showFinishedQuestionTint: true,
  finishedQuestionsSearchSortedBy: DEFAULT_SORT_BY,
  scrollUpWhenPageChange: true,
  showScrollToTopButton: true,
  lastSessionCurriculum: "",
  lastSessionSubject: "",
  filters: {},
};

export const LIST_NAME_MAX_LENGTH = 100;
