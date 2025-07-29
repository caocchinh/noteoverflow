import { ValidCurriculum } from "./types";

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
};

export const BESTEXAMHELP_CURRICULUM_CODE_PREFIX: Record<
  ValidCurriculum,
  string
> = {
  "CIE A-LEVEL": "cambridge-international-a-level",
  "CIE IGCSE": "",
};
