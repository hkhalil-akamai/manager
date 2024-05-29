import {
  StackScript,
  getStackScript,
  getStackScripts,
} from '@linode/api-v4/lib/stackscripts';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getOneClickApps } from 'src/features/StackScripts/stackScriptUtils';
import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const getAllOCAsRequest = (passedParams: Params = {}) =>
  getAll<StackScript>((params) =>
    getOneClickApps({ ...params, ...passedParams })
  )().then((data) => data.data);

const stackscriptQueries = createQueryKeys('stackscripts', {
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam }) =>
      getStackScripts({ page: pageParam, page_size: 25 }, filter),
    queryKey: [filter],
  }),
  marketplace: {
    queryFn: () => getAllOCAsRequest(),
    queryKey: null,
  },
  stackscript: (id: number) => ({
    queryFn: () => getStackScript(id),
    queryKey: [id],
  }),
});

export const useMarketplaceAppsQuery = (enabled: boolean) => {
  return useQuery<StackScript[], FormattedAPIError[]>({
    ...stackscriptQueries.marketplace,
    enabled,
    ...queryPresets.oneTimeFetch,
  });
};

export const useStackScriptQuery = (id: number, enabled = true) =>
  useQuery<StackScript, FormattedAPIError[]>({
    ...stackscriptQueries.stackscript(id),
    enabled,
  });

export const useStackScriptsInfiniteQuery = (
  filter: Filter = {},
  enabled = true
) =>
  useInfiniteQuery<ResourcePage<StackScript>, FormattedAPIError[]>({
    ...stackscriptQueries.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
  });

export const stackScriptEventHandler = ({
  event,
  queryClient,
}: EventHandlerData) => {
  // Keep the infinite store up to date
  queryClient.invalidateQueries(stackscriptQueries.infinite._def);

  // If the event has a StackScript entity attached, invalidate it
  if (event.entity?.id) {
    queryClient.invalidateQueries(
      stackscriptQueries.stackscript(event.entity.id).queryKey
    );
  }
};
