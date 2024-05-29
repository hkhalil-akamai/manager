import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

interface Props {
  closeDialog: () => void;
  deleteClient: (id: number) => Promise<{}>;
  open: boolean;
  selectedLongviewClientID?: number;
  selectedLongviewClientLabel: string;
}

export const LongviewDeleteDialog = React.memo((props: Props) => {
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<FormattedAPIError[] | undefined>(
    undefined
  );

  const {
    closeDialog,
    open,
    selectedLongviewClientID,
    selectedLongviewClientLabel: label,
  } = props;

  /** reset errors on open */
  React.useEffect(() => {
    if (open) {
      setErrors(undefined);
    }
  }, [open]);

  const handleDelete = () => {
    if (!selectedLongviewClientID) {
      return setErrors([
        {
          formattedReason: 'There was an issue deleting this Longview Client.',
          reason: 'There was an issue deleting this Longview Client.',
        },
      ]);
    }

    setDeleting(true);

    props
      .deleteClient(selectedLongviewClientID)
      .then(() => {
        setDeleting(false);
        closeDialog();
      })
      .catch((e: FormattedAPIError[]) => {
        setDeleting(false);
        setErrors(e);
      });
  };

  return (
    <ConfirmationDialog
      actions={
        <Actions
          isDeleting={isDeleting}
          onClose={props.closeDialog}
          onSubmit={handleDelete}
        />
      }
      error={errors ? errors[0].formattedReason : ''}
      onClose={props.closeDialog}
      open={open}
      title={`Delete ${label ? label : 'this Longview Client'}?`}
    >
      Are you sure you want to delete this Longview Client?
    </ConfirmationDialog>
  );
});

interface ActionsProps {
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const Actions = (props: ActionsProps) => {
  return (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'delete-button',
        label: 'Delete',
        loading: props.isDeleting,
        onClick: props.onSubmit,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: props.onClose }}
    />
  );
};
