import {
  getFormikErrorsFromAPIErrors,
  handleAPIErrors,
  handleVPCAndSubnetErrors,
} from './formikErrorUtils';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

const errorWithoutField: FormattedAPIError[] = [
  { formattedReason: 'Internal server error', reason: 'Internal server error' },
];
const errorWithField: FormattedAPIError[] = [
  {
    field: 'data.card_number',
    formattedReason: 'Invalid credit card number',
    reason: 'Invalid credit card number',
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

const setFieldError = vi.fn();
const setError = vi.fn();

describe('handleAPIErrors', () => {
  it('should handle api error with a field', () => {
    handleAPIErrors(errorWithField, setFieldError, setError);
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });

  it('should handle a general api error', () => {
    handleAPIErrors(errorWithoutField, setFieldError, setError);
    expect(setFieldError).not.toHaveBeenCalledWith();
    expect(setError).toHaveBeenCalledWith(errorWithoutField[0].reason);
  });
});

const subnetMultipleErrorsPerField = [
  {
    field: 'subnets[0].label',
    formattedReason: 'not expected error for label',
    reason: 'not expected error for label',
  },
  {
    field: 'subnets[0].label',
    formattedReason: 'expected error for label',
    reason: 'expected error for label',
  },
  {
    field: 'subnets[3].label',
    formattedReason: 'not expected error for label',
    reason: 'not expected error for label',
  },
  {
    field: 'subnets[3].label',
    formattedReason: 'expected error for label',
    reason: 'expected error for label',
  },
  {
    field: 'subnets[3].ipv4',
    formattedReason: 'not expected error for ipv4',
    reason: 'not expected error for ipv4',
  },
  {
    field: 'subnets[3].ipv4',
    formattedReason: 'expected error for ipv4',
    reason: 'expected error for ipv4',
  },
];

const subnetErrors = [
  {
    field: 'subnets[1].label',
    formattedReason: 'Label required',
    reason: 'Label required',
  },
  {
    field: 'subnets[2].label',
    formattedReason: 'bad label',
    reason: 'bad label',
  },
  {
    field: 'subnets[2].ipv4',
    formattedReason: 'cidr ipv4',
    reason: 'cidr ipv4',
  },
  {
    field: 'subnets[4].ipv4',
    formattedReason: 'needs an ip',
    reason: 'needs an ip',
  },
  {
    field: 'subnets[4].ipv6',
    formattedReason: 'needs an ipv6',
    reason: 'needs an ipv6',
  },
];

describe('handleVpcAndConvertSubnetErrors', () => {
  it('converts API errors for subnets into a map of subnet index to SubnetErrors', () => {
    const errors = handleVPCAndSubnetErrors(
      subnetErrors,
      setFieldError,
      setError
    );
    expect(Object.keys(errors)).toHaveLength(3);
    expect(Object.keys(errors)).toEqual(['1', '2', '4']);
    expect(errors[1]).toEqual({ label: 'Label required' });
    expect(errors[2]).toEqual({ ipv4: 'cidr ipv4', label: 'bad label' });
    expect(errors[4]).toEqual({ ipv4: 'needs an ip', ipv6: 'needs an ipv6' });
  });

  it('takes the last error to display if a subnet field has multiple errors associated with it', () => {
    const errors = handleVPCAndSubnetErrors(
      subnetMultipleErrorsPerField,
      setFieldError,
      setError
    );
    expect(Object.keys(errors)).toHaveLength(2);
    expect(errors[0]).toEqual({ label: 'expected error for label' });
    expect(errors[3]).toEqual({
      ipv4: 'expected error for ipv4',
      label: 'expected error for label',
    });
  });

  it('passes errors without the subnet field to handleApiErrors', () => {
    const errors = handleVPCAndSubnetErrors(
      errorWithField,
      setFieldError,
      setError
    );
    expect(Object.keys(errors)).toHaveLength(0);
    expect(errors).toEqual({});
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });
});

describe('getFormikErrorsFromAPIErrors', () => {
  it('should convert FormattedAPIError[] to errors in the shape formik expects', () => {
    const testCases: {
      apiErrors: FormattedAPIError[];
      expected: { [field: string]: unknown };
    }[] = [
      {
        apiErrors: [
          {
            field: 'ip',
            formattedReason: 'Incorrect IP',
            reason: 'Incorrect IP',
          },
        ],
        expected: {
          ip: 'Incorrect IP',
        },
      },
      {
        apiErrors: [
          {
            field: 'rules[1].match_condition.match_value',
            formattedReason: 'Bad Match Value',
            reason: 'Bad Match Value',
          },
          {
            field: 'rules[1].match_condition.match_field',
            formattedReason: 'Bad Match Type',
            reason: 'Bad Match Type',
          },
          {
            field: 'rules[1].service_targets[0].id',
            formattedReason: 'Service Target does not exist',
            reason: 'Service Target does not exist',
          },
          {
            field: 'rules[1].service_targets[0].percentage',
            formattedReason: 'Invalid percentage',
            reason: 'Invalid percentage',
          },
          {
            field: 'rules[1].match_condition.session_stickiness_ttl',
            formattedReason: 'Invalid TTL',
            reason: 'Invalid TTL',
          },
          {
            field: 'rules[1].match_condition.session_stickiness_cookie',
            formattedReason: 'Invalid Cookie',
            reason: 'Invalid Cookie',
          },
          {
            field: 'rules[1].match_condition.hostname',
            formattedReason: 'Hostname is not valid',
            reason: 'Hostname is not valid',
          },
          {
            formattedReason: 'A backend service is down',
            reason: 'A backend service is down',
          },
          {
            formattedReason: 'You reached a rate limit',
            reason: 'You reached a rate limit',
          },
        ],
        expected: {
          rules: [
            undefined,
            {
              match_condition: {
                hostname: 'Hostname is not valid',
                match_field: 'Bad Match Type',
                match_value: 'Bad Match Value',
                session_stickiness_cookie: 'Invalid Cookie',
                session_stickiness_ttl: 'Invalid TTL',
              },
              service_targets: [
                {
                  id: 'Service Target does not exist',
                  percentage: 'Invalid percentage',
                },
              ],
            },
          ],
        },
      },
    ];

    for (const { apiErrors, expected } of testCases) {
      expect(getFormikErrorsFromAPIErrors(apiErrors)).toEqual(expected);
    }
  });
});
