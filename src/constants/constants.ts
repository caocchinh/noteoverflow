import { TopicalData, ValidCurriculum } from "./types";

export const LOGO_MAIN_COLOR = "#0084ff";

export const AVATARS = [
  { src: "/assets/avatar/blue.webp", name: "Blue", color: LOGO_MAIN_COLOR },
  { src: "/assets/avatar/coffee.webp", name: "Coffee", color: "#8c6239" },
  { src: "/assets/avatar/green.webp", name: "Green", color: "#009245" },
  { src: "/assets/avatar/indigo.webp", name: "Indigo", color: "#1b1464" },
  { src: "/assets/avatar/magenta.webp", name: "Magenta", color: "#ff00ff" },
  { src: "/assets/avatar/orange.webp", name: "Orange", color: "#f15a24" },
  { src: "/assets/avatar/purple.webp", name: "Purple", color: "#662d91" },
  { src: "/assets/avatar/red.webp", name: "Red", color: "#ed1c24" },
];

export const INTERNAL_SERVER_ERROR = "Internal Server Error";
export const UNAUTHORIZED = "Unauthorized";
export const FAILED_TO_UPLOAD_IMAGE = "Failed to upload image";
export const BAD_REQUEST = "Bad Request";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const FILE_SIZE_EXCEEDS_LIMIT = "File size exceeds the 3MiB limit";
export const ONLY_WEBP_FILES_ALLOWED = "Only .webp files are allowed";
export const LIMIT_EXCEEDED = "Limit exceeded";
export const DOES_NOT_EXIST = "Does not exist";

export const TOPICAL_QUESTION_APP_ROUTE = "/topical";
export const TOPICAL_QUESTION_HISTORY_ROUTE = "/topical/history";
export const TOPICAL_QUESTION_BOOKMARK_ROUTE = "/topical/bookmark";
export const TOPICAL_QUESTION_FINISHED_QUESTIONS_ROUTE = "/topical/finished";

export const MAXIMUM_BOOKMARK_LISTS_PER_USER = 30;
export const MAXIMUM_BOOKMARKS_PER_LIST = 300;

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
  "9699": "sociology-9699",
};

export const BESTEXAMHELP_CURRICULUM_CODE_PREFIX: Record<
  ValidCurriculum,
  string
> = {
  "CIE A-LEVEL": "cambridge-international-a-level",
  "CIE IGCSE": "",
};

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
    "Sociology (9699)": "/assets/cover/Sociology (9699).webp",
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
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/664565-2025-2027-syllabus.pdf",
        code: "Physics (9702)",
        topic: [
          {
            topicName: "PHYSICAL QUANTITIES & UNITS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MEASUREMENT TECHNIQUES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "KINEMATICS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DYNAMICS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "FORCES, DENSITY & PRESSURE",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "WORK, ENERGY & POWER",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MOTION IN A CIRCLE",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GRAVITATIONAL FIELDS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DEFORMATION OF SOLIDS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "IDEAL GASES",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "TEMPERATURE",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THERMAL PROPERTIES OF MATERIALS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "OSCILLATIONS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "WAVES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SUPERPOSITION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "COMMUNICATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ELECTRIC FIELDS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CAPACITANCE",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CURRENT OF ELECTRICITY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "D.C. CIRCUITS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ELECTRONICS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MAGNETIC FIELDS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ELECTROMAGNETIC INDUCTION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ALTERNATING CURRENTS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "QUANTUM PHYSICS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PARTICLE & NUCLEAR PHYSICS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MEDICAL IMAGING",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ASTRONOMY & COSMOLOGY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [
          {
            paperType: 1,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 2,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 3,
            paperTypeCurriculumnSubdivision: ["AS-Level", "A-Level"],
          },
          {
            paperType: 4,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
          {
            paperType: 5,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Chemistry (9701)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/664563-2025-2027-syllabus.pdf",
        code: "Chemistry (9701)",
        topic: [
          {
            topicName: "ATOMS, MOLECULES & STOICHIOMETRY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ATOMIC STRUCTURE",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CHEMICAL BONDING",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "STATES OF MATTER",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CHEMICAL ENERGETICS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ELECTROCHEMISTRY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "EQUILIBRIA",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "REACTION KINETICS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THE PERIODIC TABLE- CHEMICAL PERIODICITY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GROUP 2",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GROUP 17",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName:
              "AN INTRODUCTION TO THE CHEMISTRY OF TRANSITION ELEMENTS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "NITROGEN & SULFUR",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "AN INTRODUCTION TO ORGANIC CHEMISTRY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HYDROCARBONS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HALOGEN DERIVATIVES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HYDROXY COMPOUNDS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CARBONYL COMPOUNDS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CARBOXYLIC ACIDS AND DERIVATIVES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "NITROGEN COMPOUNDS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "POLYMERISATION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ANALYTICAL TECHNIQUES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ORGANIC SYNTHESIS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [
          {
            paperType: 1,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 2,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 3,
            paperTypeCurriculumnSubdivision: ["AS-Level", "A-Level"],
          },
          {
            paperType: 4,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
          {
            paperType: 5,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Biology (9700)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/664560-2025-2027-syllabus.pdf",
        code: "Biology (9700)",
        topic: [
          {
            topicName: "CELL STRUCTURE",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "BIOLOGICAL MOLECULES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ENZYMES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CELL MEMBRANES AND TRANSPORT",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THE MITOTIC CELL CYCLE",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "NUCLEIC ACIDS AND PROTEIN SYNTHESIS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "TRANSPORT IN PLANTS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "TRANSPORT IN MAMMALS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GAS EXCHANGE AND SMOKING",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INFECTIOUS DISEASE",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "IMMUNITY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ENERGY AND RESPIRATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PHOTOSYNTHESIS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HOMEOSTASIS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CONTROL AND CO-ORDINATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INHERITED CHANGE",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SELECTION AND EVOLUTION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "BIODIVERSITY, CLASSIFICATION AND CONSERVATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GENETIC TECHNOLOGY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [
          {
            paperType: 1,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 2,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 3,
            paperTypeCurriculumnSubdivision: ["AS-Level", "A-Level"],
          },
          {
            paperType: 4,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
          {
            paperType: 5,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Pure Mathematics 1 (9709)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/597421-2023-2025-syllabus.pdf",
        code: "Pure Mathematics 1 (9709)",
        topic: [
          {
            topicName: "COORDINATES GEOMETRY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "FUNCTIONS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INTERSECTION POINTS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DIFFERENTIATION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SEQUENCES & SERIES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "BINOMIAL THEOREM",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "TRIGONOMETRY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "VECTORS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "INTEGRATION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "RADIANS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [
          {
            paperType: 1,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Mathematics Pure Math 2,3 (9709)"
          ],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/597421-2023-2025-syllabus.pdf",
        code: "Mathematics Pure Math 2,3 (9709)",
        topic: [
          {
            topicName: "ALGEBRA",
            topicCurriculumnSubdivision: ["A-Level", "AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "LOGARITHMIC & EXPONENTIAL FUNCTIONS",
            topicCurriculumnSubdivision: ["A-Level", "AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "TRIGONOMETRY",
            topicCurriculumnSubdivision: ["A-Level", "AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DIFFERENTIATION",
            topicCurriculumnSubdivision: ["A-Level", "AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INTEGRATION",
            topicCurriculumnSubdivision: ["A-Level", "AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DIFFERENTIAL EQUATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "NUMERICAL METHODS",
            topicCurriculumnSubdivision: ["A-Level", "AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "COMPLEX NUMBERS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "VECTORS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012, 2011, 2010, 2009,
        ],
        paperType: [
          {
            paperType: 2,
            paperTypeCurriculumnSubdivision: ["A-Level", "AS-Level"],
          },
          {
            paperType: 3,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Mathematics Probability & Statistics 1 (9709)"
          ],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/597421-2023-2025-syllabus.pdf",
        code: "Mathematics Probability & Statistics 1 (9709)",
        topic: [
          {
            topicName: "REPRESENTATION OF DATA",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PERMUTATION & COMBINATION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PROBABILITY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DISCRETE RANDOM VARIABLES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THE NORMAL DISTRIBUTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THE BINOMIAL DISTRIBUTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GEOMETRIC DISTRIBUTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [2025, 2024, 2023, 2022, 2021, 2020],
        paperType: [
          {
            paperType: 5,
            paperTypeCurriculumnSubdivision: ["A-Level", "AS-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"][
            "Mathematics Probability & Statistics 2 (9709)"
          ],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/597421-2023-2025-syllabus.pdf",
        code: "Mathematics Probability & Statistics 2 (9709)",
        topic: [
          {
            topicName: "POISSON DISTRIBUTION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "LINEAR COMBINATION OF RANDOM VARIABLES",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CONTINUOUS RANDOM VARIABLES",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SAMPLING",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HYPOTHESIS TESTING USING BINOMIAL DISTRIBUTION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HYPOTHESIS TESTING USING NORMAL DISTRIBUTION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [2025, 2024, 2023, 2022, 2021, 2020],
        paperType: [
          {
            paperType: 6,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },

      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Mechanics (9709)"],
        code: "Mechanics (9709)",
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/597421-2023-2025-syllabus.pdf",
        topic: [
          {
            topicName: "FORCES & EQUILIBRIUM",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "KINEMATICS OF MOTION IN A STRAIGHT LINE",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "NEWTON'S LAWS OF MOTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ENERGY, WORK & POWER",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GENERAL MOTION IN STRAIGHT LINE",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MOMENTUM",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [2025, 2024, 2023, 2022, 2021, 2020],
        paperType: [
          {
            paperType: 4,
            paperTypeCurriculumnSubdivision: ["A-Level", "AS-Level"],
          },
        ],
        season: ["Summer", "Winter", "Spring"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Further Mathematics (9231)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/597381-2023-2025-syllabus.pdf",
        code: "Further Mathematics (9231)",
        topic: [
          {
            topicName: "ROOTS OF POLYNOMIAL EQUATIONS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "RATIONAL FUNCTIONS AND GRAPHS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SUMMATION OF SERIES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MATRICES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "POLAR COORDINATES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "VECTORS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PROOF BY INDUCTION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HYPERBOLIC FUNCTIONS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DIFFERENTIATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INTEGRATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "COMPLEX NUMBERS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DIFFERENTIAL EQUATIONS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "MOMENTUM AND IMPULSE",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CIRCULAR MOTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "EQUILIBRIUM OF A RIGID BODY UNDER COPLANAR FORCES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ROTATION OF A RIGID BODY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SIMPLE HARMONIC MOTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "FURTHER WORK ON DISTRIBUTIONS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INFERENCE USING NORMAL AND T-DISTRIBUTIONS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "X2 TEST",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "BIVARIATE DATA",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PROJECTILE MOTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "LINEAR MOTION UNDER VARIABLE FORCE",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "NON PARAMETRIC TEST",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CONTINUOUS RANDOM VARIABLE",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PROBABILITY GENERATING FUNCTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HOOK'S LAW",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012,
        ],
        paperType: [
          {
            paperType: 1,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 2,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
          {
            paperType: 3,
            paperTypeCurriculumnSubdivision: ["A-Level", "A-Level"],
          },
          {
            paperType: 4,
            paperTypeCurriculumnSubdivision: ["A-Level", "A-Level"],
          },
        ],
        season: ["Summer", "Winter"],
      },
      {
        coverImage:
          SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Computer Science (9618)"],
        code: "Computer Science (9618)",
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/636089-2024-2025-syllabus.pdf",
        topic: [
          {
            topicName: "INFORMATION REPRESENTATION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "COMMUNICATION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HARDWARE",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PROCESSOR FUNDAMENTALS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SYSTEM SOFTWARE (OS)",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SECURITY, PRIVACY AND DATA INTEGRITY",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ETHICS AND OWNERSHIP",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DATABASES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ALGORITHM DESIGN AND PROBLEM-SOLVING",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DATA TYPES AND STRUCTURES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "PROGRAMMING",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SOFTWARE DEVELOPMENT",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "DATA REPRESENTATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "COMMUNICATION AND INTERNET TECHNOLOGIES",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HARDWARE AND VIRTUAL MACHINES",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SYSTEM SOFTWARE (PURPOSES OF AN OS)",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SECURITY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ARTIFICIAL INTELLIGENCE (AI)",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "COMPUTATIONAL THINKING AND PROBLEM SOLVING",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "FURTHER PROGRAMMING",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [2025, 2024, 2023, 2022, 2021],
        paperType: [
          { paperType: 1, paperTypeCurriculumnSubdivision: ["AS-Level"] },
          { paperType: 3, paperTypeCurriculumnSubdivision: ["A-Level"] },
        ],
        season: ["Summer", "Winter"],
      },

      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Economics (9708)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/595463-2023-2025-syllabus.pdf",
        code: "Economics (9708)",
        topic: [
          {
            topicName: "BASIC ECONOMIC IDEAS AND RESOURCE ALLOCATION",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THE PRICE SYSTEM AND THE MICRO ECONOMY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GOVERNMENT MICROECONOMIC INTERVENTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THE MACRO ECONOMY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GOVERNMENT MACRO INTERVENTION",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "INTERNATIONAL ECONOMIC ISSUES",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
          2014, 2013, 2012,
        ],
        paperType: [
          {
            paperType: 1,
            paperTypeCurriculumnSubdivision: ["AS-Level"],
          },
          {
            paperType: 3,
            paperTypeCurriculumnSubdivision: ["A-Level"],
          },
        ],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Psychology (9990)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/634461-2024-2026-syllabus.pdf",
        code: "Psychology (9990)",
        topic: [
          {
            topicName: "APPROACHES, ISSUES AND DEBATES",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "RESEARCH METHODS",
            topicCurriculumnSubdivision: ["AS-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THEORY- PSYCHOLOGY AND ABNORMALITY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "THEORY- PSYCHOLOGY AND CONSUMER BEHAVIOUR",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "THEORY- PSYCHOLOGY AND HEALTH",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "THEORY- PSYCHOLOGY AND ORGANISATIONS",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "CLINICAL PSYCHOLOGY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "CONSUMER PSYCHOLOGY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "HEALTH PSYCHOLOGY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "ORGANISATIONAL PSYCHOLOGY",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
        paperType: [
          { paperType: 1, paperTypeCurriculumnSubdivision: ["AS-Level"] },
          { paperType: 2, paperTypeCurriculumnSubdivision: ["AS-Level"] },
          { paperType: 3, paperTypeCurriculumnSubdivision: ["A-Level"] },
          { paperType: 4, paperTypeCurriculumnSubdivision: ["A-Level"] },
        ],
        season: ["Summer", "Winter"],
      },
      {
        coverImage: SUBJECT_COVER_IMAGE["CIE A-LEVEL"]["Sociology (9699)"],
        syllabusLink:
          "https://www.cambridgeinternational.org/Images/636099-2024-2026-syllabus.pdf",
        code: "Sociology (9699)",
        topic: [
          {
            topicName: "THE FAMILY",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "THEORY AND METHODS",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "SOCIAL INEQUALITY AND OPPORTUNITY - EDUCATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "SOCIAL INEQUALITY AND OPPORTUNITY - GLOBAL DEVELOPMENT",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "SOCIAL INEQUALITY AND OPPORTUNITY - MEDIA",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "SOCIAL INEQUALITY AND OPPORTUNITY - RELIGION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: false,
          },
          {
            topicName: "SOCIALISATION, IDENTITY AND METHODS OF RESEARCH",
            topicCurriculumnSubdivision: ["AS-Level", "A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "EDUCATION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
          {
            topicName: "GLOBALISATION, MEDIA AND RELIGION",
            topicCurriculumnSubdivision: ["A-Level"],
            isTopicUpToDate: true,
          },
        ],
        year: [
          2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
        ],
        paperType: [
          { paperType: 1, paperTypeCurriculumnSubdivision: ["AS-Level"] },
          { paperType: 2, paperTypeCurriculumnSubdivision: ["AS-Level"] },
          { paperType: 3, paperTypeCurriculumnSubdivision: ["A-Level"] },
          { paperType: 4, paperTypeCurriculumnSubdivision: ["A-Level"] },
        ],
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

export const PAST_PAPER_NAVIGATOR_CACHE_KEY =
  "noteoverflow-past-paper-navigator-cache";

export const INITIAL_QUERY = {
  curriculumId: "",
  subjectId: "",
  topic: [],
  paperType: [],
  year: [],
  season: [],
};
