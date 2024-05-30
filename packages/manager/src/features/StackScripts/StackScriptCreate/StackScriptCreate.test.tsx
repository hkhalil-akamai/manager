import { Grants, Profile } from '@linode/api-v4/lib';
import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { imageFactory, normalizeEntities, profileFactory } from 'src/factories';
import { queryClientFactory } from 'src/queries/base';
import { FormattedAPIError } from 'src/types/FormattedAPIError';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackScriptCreate } from './StackScriptCreate';

const images = normalizeEntities(imageFactory.buildList(10));
const queryClient = queryClientFactory();

describe('StackScriptCreate', () => {
  it('should render header, inputs, and buttons', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <StackScriptCreate
        {...reactRouterProps}
        profile={
          { data: profileFactory.build() } as UseQueryResult<
            Profile,
            FormattedAPIError[]
          >
        }
        grants={{ data: {} } as UseQueryResult<Grants, FormattedAPIError[]>}
        imagesData={images}
        imagesLastUpdated={0}
        imagesLoading={false}
        mode="create"
        queryClient={queryClient}
      />,
      { queryClient }
    );

    expect(getByText('Create')).toBeVisible();

    expect(getByLabelText('StackScript Label (required)')).toBeVisible();
    expect(getByLabelText('Description')).toBeVisible();
    expect(getByLabelText('Target Images')).toBeVisible();
    expect(getByLabelText('Script (required)')).toBeVisible();
    expect(getByLabelText('Revision Note')).toBeVisible();

    const createButton = getByText('Create StackScript').closest('button');
    expect(createButton).toBeVisible();
    expect(createButton).toBeDisabled();

    const resetButton = getByText('Reset').closest('button');
    expect(resetButton).toBeVisible();
    expect(resetButton).toBeEnabled();
  });
});
