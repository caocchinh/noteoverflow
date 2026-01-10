export const updateSearchQueryParam = (query: string) => {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams();
    params.set("q", query);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  } catch {
    return;
  }
};
