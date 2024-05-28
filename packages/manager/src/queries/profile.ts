import {
  Profile,
  SSHKey,
  SendPhoneVerificationCodePayload,
  TrustedDevice,
  VerifyVerificationCodePayload,
  createSSHKey,
  deleteSSHKey,
  deleteTrustedDevice,
  disableTwoFactor,
  getAppTokens,
  getPersonalAccessTokens,
  getProfile,
  getSSHKeys,
  getTrustedDevices,
  listGrants,
  sendCodeToPhoneNumber,
  smsOptOut,
  updateProfile,
  updateSSHKey,
  verifyPhoneNumberCode,
} from '@linode/api-v4/lib/profile';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { FormattedAPIError } from 'src/types/FormattedAPIError';

import { Grants } from '../../../api-v4/lib';
import { accountQueries } from './account/queries';
import { queryPresets } from './base';

import type { RequestOptions } from '@linode/api-v4';

export const profileQueries = createQueryKeys('profile', {
  appTokens: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAppTokens(params, filter),
    queryKey: [params, filter],
  }),
  grants: {
    queryFn: listGrants,
    queryKey: null,
  },
  personalAccessTokens: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getPersonalAccessTokens(params, filter),
    queryKey: [params, filter],
  }),
  profile: (options: RequestOptions = {}) => ({
    queryFn: () => getProfile(options),
    queryKey: [options],
  }),
  sshKeys: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getSSHKeys(params, filter),
    queryKey: [params, filter],
  }),
  trustedDevices: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getTrustedDevices(params, filter),
    queryKey: [params, filter],
  }),
});

export const useProfile = (options: RequestOptions = {}) => {
  return useQuery<Profile, FormattedAPIError[]>({
    ...profileQueries.profile(options),
    ...queryPresets.oneTimeFetch,
  });
};

export const useMutateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Profile, FormattedAPIError[], Partial<Profile>>({
    mutationFn: updateProfile,
    onSuccess: (newData) => updateProfileData(newData, queryClient),
  });
};

export const updateProfileData = (
  newData: Partial<Profile>,
  queryClient: QueryClient
): void => {
  queryClient.setQueryData<Profile>(
    profileQueries.profile().queryKey,
    (oldData: Profile) => ({
      ...oldData,
      ...newData,
    })
  );
};

export const useGrants = () => {
  const { data: profile } = useProfile();
  return useQuery<Grants, FormattedAPIError[]>({
    ...profileQueries.grants,
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const useSMSOptOutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
    mutationFn: smsOptOut,
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null }, queryClient);
    },
  });
};

export const useSendPhoneVerificationCodeMutation = () =>
  useMutation<{}, FormattedAPIError[], SendPhoneVerificationCodePayload>({
    mutationFn: sendCodeToPhoneNumber,
  });

export const useVerifyPhoneVerificationCodeMutation = () =>
  useMutation<{}, FormattedAPIError[], VerifyVerificationCodePayload>({
    mutationFn: verifyPhoneNumberCode,
  });

export const useSSHKeysQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true
) =>
  useQuery({
    ...profileQueries.sshKeys(params, filter),
    enabled,
    keepPreviousData: true,
  });

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SSHKey,
    FormattedAPIError[],
    { label: string; ssh_key: string }
  >({
    mutationFn: createSSHKey,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys._def);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries(accountQueries.users._ctx.paginated._def);
    },
  });
};

export const useUpdateSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, FormattedAPIError[], { label: string }>({
    mutationFn: (data) => updateSSHKey(id, data),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys._def);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries(accountQueries.users._ctx.paginated._def);
    },
  });
};

export const useDeleteSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
    mutationFn: () => deleteSSHKey(id),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.sshKeys._def);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries(accountQueries.users._ctx.paginated._def);
    },
  });
};

export const sshKeyEventHandler = (event: EventHandlerData) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  event.queryClient.invalidateQueries(profileQueries.sshKeys._def);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  event.queryClient.invalidateQueries(accountQueries.users._ctx.paginated._def);
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  useQuery<ResourcePage<TrustedDevice>, FormattedAPIError[]>({
    ...profileQueries.trustedDevices(params, filter),
    keepPreviousData: true,
  });

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
    mutationFn: () => deleteTrustedDevice(id),
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.trustedDevices._def);
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>({
    mutationFn: disableTwoFactor,
    onSuccess() {
      queryClient.invalidateQueries(profileQueries.profile().queryKey);
      // also invalidate the /account/users data because that endpoint returns 2FA status for each user
      queryClient.invalidateQueries(accountQueries.users._ctx.paginated._def);
    },
  });
};
