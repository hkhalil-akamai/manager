import {
  ReplyRequest,
  SupportReply,
  SupportTicket,
  closeSupportTicket,
  createReply,
  getTicket,
  getTicketReplies,
  getTickets,
} from '@linode/api-v4/lib/support';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { FormattedAPIError } from 'src/types/FormattedAPIError';

import type { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';

const queryKey = `tickets`;

export const useSupportTicketsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<SupportTicket>, FormattedAPIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getTickets(params, filter),
    { keepPreviousData: true }
  );

export const useSupportTicketQuery = (id: number) =>
  useQuery<SupportTicket, FormattedAPIError[]>([queryKey, 'ticket', id], () =>
    getTicket(id)
  );

export const useInfiniteSupportTicketRepliesQuery = (id: number) =>
  useInfiniteQuery<ResourcePage<SupportReply>, FormattedAPIError[]>(
    [queryKey, 'ticket', id, 'replies'],
    ({ pageParam }) => getTicketReplies(id, { page: pageParam, page_size: 25 }),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

export const useSupportTicketReplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SupportReply, FormattedAPIError[], ReplyRequest>(
    createReply,
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useSupportTicketCloseMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(() => closeSupportTicket(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const supportTicketEventHandler = ({
  queryClient,
}: EventHandlerData) => {
  queryClient.invalidateQueries([queryKey]);
};
