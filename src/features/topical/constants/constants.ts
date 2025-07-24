import { ValidCurriculum } from "@/constants/types";
import type {
  FiltersCache,
  InvalidInputs,
  LayoutStyle,
  TopicalData,
} from "./types";

export const CURRICULUM_COVER_IMAGE: Record<ValidCurriculum, string> = {
  "CIE A-LEVEL": "/assets/cover/alevels-logo1.jpg",
  "CIE IGCSE": "/assets/cover/igcse-logo1.jpg",
};

export const SUBJECT_COVER_IMAGE: Record<
  ValidCurriculum,
  Record<string, string>
> = {
  "CIE A-LEVEL": {
    "Physics (9702)": "/assets/cover/Physics (9702).jpg",
    "Chemistry (9701)": "/assets/cover/Chemistry (9701).jpg",
    "Biology (9700)": "/assets/cover/Biology (9700).jpg",
    "Pure Mathematics 1 (9709)": "/assets/cover/Pure 1 (9709).jpg",
    "Mechanics (9709)": "/assets/cover/Mechanics (9709).jpg",
    "Probability & Statistics 1 (9709)":
      "/assets/cover/Probability & Statistics 1 (9709).jpg",
    "Probability & Statistics 2 (9709)":
      "/assets/cover/Probability & Statistics 2 (9709).jpg",
    "Pure Mathematics 2 & 3 (9709)": "/assets/cover/Pure 2&3 (9709).jpg",
  },
  "CIE IGCSE": {
    "Physics (9702)": "/assets/cover/Physics (9702).jpg",
    "Chemistry (9701)": "/assets/cover/Chemistry (9701).jpg",
    "Biology (9700)": "/assets/cover/Biology (9700).jpg",
    "Pure Mathematics 1 (9709)": "/assets/cover/Pure 1 (9709).jpg",
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
        paperType: [1, 2, 3, 4],
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
          "THE PERIODIC TABLE: CHEMICAL PERIODICITY",
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
        paperType: [1, 2, 3, 4],
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
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Pure Mathematics 1 (9709)"],
        code: "Pure Mathematics 1 (9709)",
        topic: ["Algebra", "Geometry", "Calculus", "Statistics"],
        year: [2024, 2023, 2022, 2021],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mechanics (9709)"],
        code: "Mechanics (9709)",
        topic: ["Algebra", "Geometry", "Calculus", "Statistics"],
        year: [2024, 2023, 2022, 2021],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Probability & Statistics 1 (9709)"
          ],
        code: "Probability & Statistics 1 (9709)",
        topic: ["Algebra", "Geometry", "Calculus", "Statistics"],
        year: [2024, 2023, 2022, 2021],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Probability & Statistics 2 (9709)"
          ],
        code: "Probability & Statistics 2 (9709)",
        topic: ["Algebra", "Geometry", "Calculus", "Statistics"],
        year: [2024, 2023, 2022, 2021],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Pure Mathematics 2 & 3 (9709)"],
        code: "Pure Mathematics 2 & 3 (9709)",
        topic: ["Algebra", "Geometry", "Calculus", "Statistics"],
        year: [2024, 2023, 2022, 2021],
        paperType: [1, 2, 3, 4],
        season: ["Summer", "Winter"],
      },
    ],
  },
];

export const BESTEXAMHELP_DOMAIN = "https://bestexamhelp.com/exam";

export const BESTEXAMHELP_SUBJECT_CODE: Record<string, string> = {
  "9702": "physics-9702",
  "9701": "chemistry-9701",
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
