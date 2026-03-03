import { BAD_REQUEST } from "@/constants/constants";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/eden";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addRecentQuery, deleteRecentQuery } from "../server/actions";
import { FilterData } from "../types/models";

export const useRecentQueries = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: recentQuery,
    isError: isRecentQueryError,
    isFetching: isRecentQueryFetching,
  } = useQuery({
    queryKey: ["user_recent_query"],
    queryFn: async () => {
      const { data, error } = await api.topical["recent-query"].get();
      if (error) {
        throw new Error(error.value.error);
      }
      return data;
    },
    enabled: isAuthenticated,
  });

  const {
    mutate: deleteRecentQueryMutation,
    isPending: isDeletePending,
    variables: deletingQueryKey,
  } = useMutation({
    mutationKey: ["delete_recent_query"],
    mutationFn: async (queryKey: string) => {
      const result = await deleteRecentQuery({ queryKey: queryKey });
      if (result.error) {
        throw new Error(result.error);
      }
      return queryKey;
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
        return oldData.filter((item) => item.queryKey !== data);
      });
    },
    onError: (error) => {
      toast.error(
        "Failed to delete outdated data: " + error.message + ". Please refresh the page.",
      );
    },
  });

  const { mutate: mutateRecentQuery, isPending: isAddRecentQueryPending } = useMutation({
    mutationKey: ["add_recent_query"],
    mutationFn: async (
      queryKey: {
        curriculumId: string;
        subjectId: string;
      } & FilterData,
    ) => {
      const result = await addRecentQuery({ queryKey: queryKey });
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        deletedKey: result.data?.deletedKey,
        lastSearch: result.data?.lastSearch,
        currentQueryKey: queryKey,
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
        if (data && data.currentQueryKey) {
          let newData = oldData;
          if (data.deletedKey) {
            newData = newData.filter((item) => item.queryKey !== data.deletedKey);
          }
          const isQueryAlreadyExist = newData.find(
            (item) => item.queryKey === JSON.stringify(data.currentQueryKey),
          );
          if (!isQueryAlreadyExist) {
            newData.unshift({
              queryKey: JSON.stringify(data.currentQueryKey),
              sortParams: null,
              lastSearch: data.lastSearch?.getTime() ?? 0,
            });
          } else {
            newData = newData.map((item) => {
              if (item.queryKey === JSON.stringify(data.currentQueryKey)) {
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
          "Failed to add recent search to database. Invalid or outdata data. Please refresh the website!",
        );
        return;
      }
      toast.error(
        "Failed to add recent search to database: " + error.message + ". Please refresh the page.",
      );
    },
  });

  return {
    recentQuery,
    isRecentQueryError,
    isRecentQueryFetching,
    deleteRecentQueryMutation,
    mutateRecentQuery,
    isAddRecentQueryPending,
    isDeletePending,
    deletingQueryKey,
  };
};
