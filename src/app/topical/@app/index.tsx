"use client";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { CACHE_EXPIRE_TIME } from "@/features/topical/constants/constants";
import type {
  FilterData,
  CurrentQuery,
} from "@/features/topical/constants/types";
import { SelectedQuestion } from "@/features/topical/constants/types";
import { updateSearchParams } from "@/features/topical/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth/auth-client";
import { getCache, setCache } from "@/drizzle/db";
import { addRecentQuery } from "@/features/topical/server/actions";
import { toast } from "sonner";
import { BAD_REQUEST, INITIAL_QUERY } from "@/constants/constants";
import { UtilityOverflowProvider } from "@/features/topical/hooks/useUtilityOverflow";
import AppSidebar from "@/features/topical/components/AppSidebar";
import AppMainContent from "@/features/topical/components/AppMainContent";

const TopicalClient = ({
  searchParams,
  BETTER_AUTH_URL,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  BETTER_AUTH_URL: string;
}) => {
  const isMobileDevice = useIsMobile();
  const mountedRef = useRef(false);
  const { isAppSidebarOpen, setIsAppSidebarOpen, uiPreferences } =
    useTopicalApp();
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<CurrentQuery>({
    ...INITIAL_QUERY,
  });
  const [isValidSearchParams, setIsValidSearchParams] = useState(true);

  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const ultilityRef = useRef<HTMLDivElement | null>(null);

  const filterUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const params = new URLSearchParams(window.location.search);
    params.set("queryKey", JSON.stringify(currentQuery));
    return `${BETTER_AUTH_URL}/topical?${params.toString()}`;
  }, [BETTER_AUTH_URL, currentQuery]);

  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (currentQuery.curriculumId && currentQuery.subjectId) {
      updateSearchParams({
        query: JSON.stringify(currentQuery),
        questionId: "",
        isInspectOpen: false,
      });
    }
  }, [currentQuery, uiPreferences.isStrictModeEnabled]);

  const search = async () => {
    const params = new URLSearchParams();
    params.append(
      "curriculumId",
      encodeURIComponent(currentQuery.curriculumId)
    );
    params.append("subjectId", encodeURIComponent(currentQuery.subjectId));
    params.append(
      "topic",
      encodeURIComponent(JSON.stringify(currentQuery.topic))
    );
    params.append(
      "paperType",
      encodeURIComponent(JSON.stringify(currentQuery.paperType))
    );
    params.append(
      "year",
      encodeURIComponent(JSON.stringify(currentQuery.year))
    );
    params.append(
      "season",
      encodeURIComponent(JSON.stringify(currentQuery.season))
    );
    const response = await fetch(`/api/topical?${params.toString()}`, {
      method: "GET",
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data && "error" in data
          ? String(data.error)
          : "An error occurred";
      throw new Error(errorMessage);
    }

    return data as {
      data: SelectedQuestion[];
      isRateLimited: boolean;
    };
  };

  const { mutate: mutateRecentQuery, isPending: isAddRecentQueryPending } =
    useMutation({
      mutationKey: ["add_recent_query"],
      mutationFn: async (
        queryKey: {
          curriculumId: string;
          subjectId: string;
        } & FilterData
      ) => {
        const result = await addRecentQuery({ queryKey: queryKey });
        if (result.error) {
          throw new Error(result.error);
        }
        return {
          deletedKey: result.data?.deletedKey,
          lastSearch: result.data?.lastSearch,
          realQueryKey: queryKey,
        };
      },
      onSuccess: (data) => {
        queryClient.setQueryData<
          {
            queryKey: string;
            sortParams: string | null;
            lastSearch: number;
          }[]
        >(["user_recent_query"], (oldData) => {
          if (!oldData) {
            return oldData;
          }
          if (data && data.realQueryKey) {
            let newData = oldData;
            if (data.deletedKey) {
              newData = newData.filter(
                (item) => item.queryKey !== data.deletedKey
              );
            }
            const isQueryAlreadyExist = newData.find(
              (item) => item.queryKey === JSON.stringify(data.realQueryKey)
            );
            if (!isQueryAlreadyExist) {
              newData.unshift({
                queryKey: JSON.stringify(data.realQueryKey),
                sortParams: null,
                lastSearch: data.lastSearch?.getTime() ?? 0,
              });
            } else {
              newData = newData.map((item) => {
                if (item.queryKey === JSON.stringify(data.realQueryKey)) {
                  return {
                    ...item,
                    lastSearch: data.lastSearch?.getTime() ?? 0,
                  };
                }
                return item;
              });
            }
            return newData;
          }
          return oldData;
        });
      },
      onError: (error) => {
        if (error.message === BAD_REQUEST) {
          toast.error(
            "Failed to add recent search to database. Invalid or outdata data. Please refresh the website!"
          );
          return;
        }
        toast.error(
          "Failed to add recent search to database: " +
            error.message +
            ". Please refresh the page."
        );
      },
    });

  const {
    data: topicalData,
    isFetching: isTopicalDataFetching,
    isFetched: isTopicalDataFetched,
    isError: isTopicalDataError,
    refetch: refetchTopicalData,
  } = useQuery({
    queryKey: ["topical_questions", currentQuery],
    queryFn: async () => {
      mutateRecentQuery(currentQuery);

      try {
        const cachedData = await getCache<string>(JSON.stringify(currentQuery));
        const currentTime = Date.now();
        const parsedCachedData: {
          data: SelectedQuestion[];
          isRateLimited: boolean;
          cacheExpireTime: number;
        } | null = cachedData ? JSON.parse(cachedData) : null;
        if (
          parsedCachedData &&
          currentTime > parsedCachedData.cacheExpireTime
        ) {
          throw new Error("Cache expired");
        }
        if (parsedCachedData) {
          return {
            data: parsedCachedData.data,
            isRateLimited: parsedCachedData.isRateLimited,
          };
        }
      } catch {
        const result = await search();
        try {
          if (result.data && result.data.length > 0 && !result.isRateLimited) {
            const currentTime = Date.now();
            const cacheExpireTime = currentTime + CACHE_EXPIRE_TIME;
            const cacheData = {
              data: result.data,
              cacheExpireTime,
            };
            setCache(JSON.stringify(currentQuery), JSON.stringify(cacheData));
          }
          return result;
        } catch {
          return result;
        }
      }
      const result = await search();
      try {
        if (result.data && result.data.length > 0 && !result.isRateLimited) {
          const currentTime = Date.now();
          const cacheExpireTime = currentTime + CACHE_EXPIRE_TIME;
          const cacheData = {
            data: result.data,
            cacheExpireTime,
          };
          setCache(JSON.stringify(currentQuery), JSON.stringify(cacheData));
        }
        return result;
      } catch {
        return result;
      }
    },

    enabled: isSearchEnabled,
  });

  useEffect(() => {
    if (isMobileDevice) {
      setIsAppSidebarOpen(false);
    }
  }, [currentQuery, isMobileDevice, setIsAppSidebarOpen]);

  const queryClient = useQueryClient();

  const { data: userSession, isPending: isUserSessionPending } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await authClient.getSession(),
    enabled: !queryClient.getQueryData(["user"]),
  });

  const isValidSession = !!userSession?.data?.session;

  return (
    <>
      <div className="pt-12 h-screen !overflow-hidden">
        <UtilityOverflowProvider
          sideBarInsetRef={sideBarInsetRef}
          ultilityRef={ultilityRef}
        >
          <SidebarProvider
            onOpenChange={setIsAppSidebarOpen}
            onOpenChangeMobile={setIsAppSidebarOpen}
            open={isAppSidebarOpen}
            openMobile={isAppSidebarOpen}
          >
            <AppSidebar
              currentQuery={currentQuery}
              setCurrentQuery={setCurrentQuery}
              setIsSearchEnabled={setIsSearchEnabled}
              isTopicalDataFetching={isTopicalDataFetching}
              filterUrl={filterUrl}
              mountedRef={mountedRef}
              searchParams={searchParams}
              setIsValidSearchParams={setIsValidSearchParams}
              isUserSessionPending={isUserSessionPending}
              isValidSession={isValidSession}
              isAddRecentQueryPending={isAddRecentQueryPending}
            />
            <AppMainContent
              currentQuery={currentQuery}
              topicalData={topicalData}
              isSearchEnabled={isSearchEnabled}
              isTopicalDataError={isTopicalDataError}
              isTopicalDataFetching={isTopicalDataFetching}
              isTopicalDataFetched={isTopicalDataFetched}
              isValidSearchParams={isValidSearchParams}
              BETTER_AUTH_URL={BETTER_AUTH_URL}
              isValidSession={isValidSession}
              isUserSessionPending={isUserSessionPending}
              refetchTopicalData={refetchTopicalData}
              searchParams={searchParams}
              sideBarInsetRef={sideBarInsetRef}
              ultilityRef={ultilityRef}
              filterUrl={filterUrl}
            />
          </SidebarProvider>
        </UtilityOverflowProvider>
      </div>
    </>
  );
};

export default TopicalClient;
