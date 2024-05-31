import { reportException } from 'src/exceptionReporting';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const handleUnauthorizedErrors = (
  e: FormattedAPIError[],
  unauthedMessage: string
) => {
  /**
   * filter out errors that match the following
   * {
   *   reason: "Unauthorized"
   * }
   *
   * and if any of these errors exist, set the hasUnauthorizedError
   * flag to true
   */
  let hasUnauthorizedError = false;
  let filteredErrors: FormattedAPIError[] = [];

  try {
    filteredErrors = e.filter((eachError) => {
      if (eachError.reason.toLowerCase().includes('unauthorized')) {
        hasUnauthorizedError = true;
        return false;
      }
      return true;
    });
  } catch (caughtError) {
    reportException(`Error with Unauthed error handling: ${caughtError}`, {
      apiError: e,
    });
  }

  /**
   * if we found an unauthorized error, add on the new message in the API
   * Error format
   */
  return hasUnauthorizedError
    ? [
        {
          reason: unauthedMessage,
        },
        ...filteredErrors,
      ]
    : filteredErrors;
};
