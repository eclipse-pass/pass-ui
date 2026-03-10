/**
 * Centralizing JSON-API queries are formatted using RSQL, which can be a bit awkward to write.
 */

interface QueryParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface UserLike {
  id: string | null;
  isAdmin?: boolean;
  isSubmitter?: boolean;
}

/**
 * Paginated query for the submissions/index route
 *
 * @param {object} params url query params
 * @param {User} user current user
 */
export function submissionsIndexQuery(params: QueryParams, user: UserLike) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any;

  if (user.isAdmin) {
    query = {
      filter: { submission: 'submissionStatus=out=cancelled' },
      include: 'publication,grants.primaryFunder,repositories,submitter,preparers',
    };
  } else if (user.isSubmitter) {
    const userMatch = `submitter.id==${user.id},preparers.id=in=${user.id}`;
    query = {
      filter: {
        submission: `(${userMatch});submissionStatus=out=cancelled`,
      },
      sort: '-submittedDate',
      include: 'publication,grants.primaryFunder,repositories,submitter,preparers',
    };
  }

  const { page = 1, pageSize = 10 } = params;
  query.page = {
    number: page,
    size: pageSize,
    totals: true,
  };

  if (params.filter) {
    query.filter.submission = `${query.filter.submission};${filter(params.filter, 'publication.title')}`;
  }

  return query;
}

/**
 * Paginated query for the grant details page, querying for submissions associated
 * with the given grant
 *
 * @param {object} params url query params. MUST include `grant_id` from the URL path
 * @param {string} grantId ID for the Grant
 * @param {User} user current user
 */
export function grantDetailsQuery(params: QueryParams, grantId: string, user: UserLike) {
  /**
   * TODO: TMP restriction - don't show submissions that are in DRAFT status
   * unless you are the submitter OR preparer
   * Show submissions where `submitted===true`, because they are no longer editable
   */
  const userMatch = `submitted==true,(submitter.id==${user.id},preparers.id=in=${user.id})`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    filter: {
      submission: `grants.id==${grantId};submissionStatus=out=cancelled;(${userMatch})`,
    },
    include: 'publication,grants.primaryFunder,repositories,submitter,preparers',
  };

  if (params.filter) {
    query.filter.submission = `(${query.filter.submission});${filter(params.filter, 'publication.title')}`;
  }

  const { page = 1, pageSize = 10 } = params;
  query.page = {
    number: page,
    size: pageSize,
    totals: true,
  };

  return query;
}

export function grantsIndexGrantQuery(params: QueryParams, user: UserLike) {
  const userId = user.id;
  // default values provided to force these params in the request to the backend
  // TODO: make default pageSize configurable
  const { page = 1, pageSize = 10 } = params;
  const grantQuery = {
    filter: {
      grant: `pi.id==${userId},coPis.id==${userId}`,
    },
    sort: '+awardStatus,-endDate',
    include: 'primaryFunder,directFunder',
    page: {
      number: page,
      size: pageSize,
      totals: true,
    },
  };

  if (params.filter) {
    grantQuery.filter.grant = `(${grantQuery.filter.grant});${filter(params.filter, 'projectName')}`;
  }

  return grantQuery;
}

export function grantsIndexSubmissionQuery(user: UserLike) {
  const userMatch = `grants.pi.id==${user.id},grants.coPis.id==${user.id}`;
  return {
    filter: {
      submission: `submissionStatus=out=cancelled;(${userMatch})`,
    },
    include: 'grants',
  };
}

export function fileForSubmissionQuery(submissionId: string | null) {
  return {
    filter: {
      file: `submission.id==${submissionId}`,
    },
  };
}

export function submissionsWithPublicationQuery(publication: { id: string | null }) {
  return {
    filter: {
      submission: `publication.id==${publication.id}`,
    },
  };
}

function filter(value: string | undefined, ...props: string[]) {
  if (!value) {
    return '';
  }
  const parts = props.map((prop) => `${prop}=ini=${filterValue(value)}`).join(',');
  return `(${parts})`;
}

/**
 * @param {string} value
 * @returns value surrounded by quotes if necessary
 */
function filterValue(value: string) {
  value = value.trim();
  if (value.search(/\s+/) >= 0) {
    return `"*${value}*"`;
  }
  return `*${value}*`;
}
