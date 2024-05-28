import {
  createLoadbalancerCertificate,
  deleteLoadbalancerCertificate,
  getLoadbalancerCertificate,
  getLoadbalancerCertificates,
  updateLoadbalancerCertificate,
} from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { QUERY_KEY } from './loadbalancers';

import type {
  FormattedAPIError,
  Certificate,
  CreateCertificatePayload,
  Filter,
  Params,
  ResourcePage,
  UpdateCertificatePayload,
} from '@linode/api-v4';

export const useLoadBalancerCertificatesQuery = (
  id: number,
  params: Params,
  filter: Filter
) => {
  return useQuery<ResourcePage<Certificate>, FormattedAPIError[]>(
    [
      QUERY_KEY,
      'loadbalancer',
      id,
      'certificates',
      'paginated',
      params,
      filter,
    ],
    () => getLoadbalancerCertificates(id, params, filter),
    { keepPreviousData: true }
  );
};

export const useLoadbalancerCertificateQuery = (
  loadbalancerId: number,
  certificateId: number,
  enabled = true
) => {
  return useQuery<Certificate, FormattedAPIError[]>(
    [
      QUERY_KEY,
      'loadbalancer',
      loadbalancerId,
      'certificates',
      'certificate',
      certificateId,
    ],
    () => getLoadbalancerCertificate(loadbalancerId, certificateId),
    { enabled }
  );
};

export const useLoadBalancerCertificateCreateMutation = (
  loadbalancerId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Certificate, FormattedAPIError[], CreateCertificatePayload>(
    (data) => createLoadbalancerCertificate(loadbalancerId, data),
    {
      onSuccess(certificate) {
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'certificates',
        ]);
        queryClient.setQueryData(
          [
            QUERY_KEY,
            'loadbalancer',
            loadbalancerId,
            'certificates',
            'certificate',
            certificate.id,
          ],
          certificate
        );
      },
    }
  );
};

export const useLoadBalancerCertificateMutation = (
  loadbalancerId: number,
  certificateId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Certificate, FormattedAPIError[], UpdateCertificatePayload>(
    (data) =>
      updateLoadbalancerCertificate(loadbalancerId, certificateId, data),
    {
      onSuccess(certificate) {
        queryClient.setQueryData(
          [
            QUERY_KEY,
            'loadbalancer',
            loadbalancerId,
            'certificates',
            'certificate',
            certificate.id,
          ],
          certificate
        );
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'certificates',
        ]);
      },
    }
  );
};

export const useLoadBalancerCertificateDeleteMutation = (
  loadbalancerId: number,
  certificateId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(
    () => deleteLoadbalancerCertificate(loadbalancerId, certificateId),
    {
      onSuccess() {
        queryClient.removeQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'certificates',
          'certificate',
          certificateId,
        ]);
        queryClient.invalidateQueries([
          QUERY_KEY,
          'loadbalancer',
          loadbalancerId,
          'certificates',
        ]);
      },
    }
  );
};

export const useLoadBalancerCertificatesInfiniteQuery = (
  id: number,
  filter: Filter = {}
) => {
  return useInfiniteQuery<ResourcePage<Certificate>, FormattedAPIError[]>(
    [QUERY_KEY, 'loadbalancer', id, 'certificates', 'infinite', filter],
    ({ pageParam }) =>
      getLoadbalancerCertificates(
        id,
        { page: pageParam, page_size: 25 },
        filter
      ),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );
};
