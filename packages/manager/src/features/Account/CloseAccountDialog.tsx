import { cancelAccount } from '@linode/api-v4/lib/account';
import { Theme, styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

interface Props {
  closeDialog: () => void;
  open: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  dontgo: {
    marginTop: theme.spacing(2),
    order: 1,
  },
}));

const CloseAccountDialog = ({ closeDialog, open }: Props) => {
  const [isClosingAccount, setIsClosingAccount] = React.useState<boolean>(
    false
  );
  const [errors, setErrors] = React.useState<FormattedAPIError[]>();
  const [comments, setComments] = React.useState<string>('');
  const { classes } = useStyles();
  const history = useHistory();
  const { data: profile } = useProfile();

  React.useEffect(() => {
    if (open) {
      /**
       * reset error state, username, and disabled status when we open the modal
       * intentionally not resetting comments
       */
      setErrors(undefined);
    }
  }, [open]);

  const inputRef = React.useCallback(
    (node: any) => {
      /**
       * focus on first textfield when modal is opened
       */
      if (node && node.focus && open === true) {
        node.focus();
      }
    },
    [open]
  );

  const handleCancelAccount = () => {
    setIsClosingAccount(true);
    return cancelAccount({
      /**
       * we don't care about soliciting comments from the user
       * since they're about to get redirected to a survey.
       */
      comments,
    })
      .then((response) => {
        setIsClosingAccount(false);
        /** shoot the user off to survey monkey to answer some questions */
        history.push('/cancel', { survey_link: response.survey_link });
      })
      .catch((e: FormattedAPIError[]) => {
        setIsClosingAccount(false);
        setErrors(e);
      });
  };

  if (!profile?.username) {
    return null;
  }

  return (
    <TypeToConfirmDialog
      entity={{
        name: profile.username,
        primaryBtnText: 'Close Account',
        subType: 'CloseAccount',
        type: 'AccountSetting',
      }}
      inputRef={inputRef}
      label={`Please enter your Username (${profile.username}) to confirm.`}
      loading={isClosingAccount}
      onClick={handleCancelAccount}
      onClose={closeDialog}
      open={open}
      textFieldStyle={{ maxWidth: '415px' }}
      title="Are you sure you want to close your cloud computing services account?"
    >
      {errors ? (
        <Notice variant="error">
          {errors ? errors[0].formattedReason : ''}
        </Notice>
      ) : null}
      <StyledNoticeWrapper>
        <Notice spacingBottom={12} variant="warning">
          <Typography sx={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Please note this is an extremely
            destructive action. Closing your account means that all services
            Linodes, Volumes, DNS Records, etc will be lost and may not be able
            be restored.
          </Typography>
        </Notice>
      </StyledNoticeWrapper>
      <Typography className={classes.dontgo}>
        We&rsquo;d hate to see you go. Please let us know what we could be doing
        better in the comments section below. After your account is closed,
        you&rsquo;ll be directed to a quick survey so we can better gauge your
        feedback.
      </Typography>
      <StyledCommentSectionWrapper>
        <TextField
          aria-label="Optional comments field"
          label="Comments"
          multiline
          onChange={(e) => setComments(e.target.value)}
          optional
          placeholder="Provide Feedback"
          rows={1}
          value={comments}
        />
      </StyledCommentSectionWrapper>
    </TypeToConfirmDialog>
  );
};

// The order property helps inject the TypeToConfirm input field in the TypeToConfirmDialog when the components
// below are passed in as the children prop.
const StyledNoticeWrapper = styled('div')(() => ({
  order: 0,
}));

const StyledCommentSectionWrapper = styled('div')(() => ({
  order: 2,
}));

export default React.memo(CloseAccountDialog);
