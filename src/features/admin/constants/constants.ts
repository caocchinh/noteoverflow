export const UPLOAD_NAVIGATION_ITEMS = [
  {
    label: "Upload",
    path: "/admin/content/upload",
    isOwnerNeeded: false,
  },
  {
    label: "Update",
    path: "/admin/content/update",
    isOwnerNeeded: false,
  },
  {
    label: "Delete",
    path: "/admin/content/delete",
    isOwnerNeeded: false,
  },
];

export const ADMIN_NAVIGATION_ITEMS = [
  {
    label: "Content Management",
    path: "/admin/content",
    isOwnerNeeded: false,
  },
  {
    label: "AI Search Indexing",
    path: "/admin/AI",
    isOwnerNeeded: true,
  },
  {
    label: "Dimension Processing",
    path: "/admin/dimensions",
    isOwnerNeeded: true,
  },
  {
    label: "Legacy Upload",
    path: "/admin/legacy",
    isOwnerNeeded: true,
  },
  {
    label: "User Management",
    path: "/admin/user",
    isOwnerNeeded: true,
  },
];
