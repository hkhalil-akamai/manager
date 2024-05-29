import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import {
  TableRowLoading,
  TableRowLoadingProps,
} from 'src/components/TableRowLoading/TableRowLoading';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

interface TableContentWrapperProps {
  children?: React.ReactNode;
  customFirstRow?: JSX.Element;
  emptyMessage?: string;
  error?: FormattedAPIError[];
  lastUpdated?: number;
  length: number;
  loading: boolean;
  loadingProps?: TableRowLoadingProps;
  rowEmptyState?: JSX.Element;
}

export const TableContentWrapper = (props: TableContentWrapperProps) => {
  const {
    children,
    customFirstRow,
    emptyMessage,
    error,
    lastUpdated,
    length,
    loading,
    loadingProps,
    rowEmptyState,
  } = props;

  if (loading) {
    return <TableRowLoading {...loadingProps} />;
  }

  if (error && error.length > 0) {
    return <TableRowError colSpan={6} message={error[0].formattedReason} />;
  }

  if (lastUpdated !== 0 && length === 0) {
    if (rowEmptyState) {
      return rowEmptyState;
    }
    return (
      <TableRowEmpty
        colSpan={6}
        message={emptyMessage ?? 'No data to display.'}
      />
    );
  }

  return (
    <>
      {customFirstRow ? customFirstRow : undefined}
      {children}
    </>
  );
};
