/**
 * Paginated query for the submissions/index route
 *
 * @param {object} params url query params
 * @param {User} user current user
 */
export function submissionsIndexQuery(params, user) {
  let query;

  if (user.isAdmin) {
    query = {
      filter: { submission: 'submissionStatus=out=cancelled' },
      include: 'publication',
    };
  } else if (user.isSubmitter) {
    const userMatch = `submitter.id==${user.id},preparers.id=in=${user.id}`;
    query = {
      filter: {
        submission: `(${userMatch});submissionStatus=out=cancelled`,
      },
      sort: '-submittedDate',
      include: 'publication',
    };
  }

  const { page = 1, pageSize = 10 } = params;
  query.page = {
    number: page,
    size: pageSize,
    totals: true,
  };

  if (params.filter) {
    query.filter.submission = `(${query.filter.submission});publication.title=ini=*${params.filter}*`;
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
export function grantDetailsQuery(params, grantId, user) {
  /**
   * TODO: TMP restriction - don't show submissions that are in DRAFT status
   * unless you are the submitter OR preparer
   * Show submissions where `submitted===true`, because they are no longer editable
   */
  const userMatch = `submitted==true,(submitter.id==${user.id},preparers.id=in=${user.id})`;
  const query = {
    filter: {
      submission: `grants.id==${grantId};submissionStatus=out=cancelled;(${userMatch})`,
    },
  };

  const { page = 1, pageSize = 10 } = params;
  query.page = {
    number: page,
    size: pageSize,
    totals: true,
  };

  if (params.filter) {
    query.filter.submission = `(${query.filter.submission});publication.title=ini=*${params.filter}*`;
  }

  return query;
}

export function grantsIndexGrantQuery(params, user) {
  const userId = user.id;
  // default values provided to force these params in the request to the backend
  // TODO: make default pageSize configurable
  const { page = 1, pageSize = 10 } = params;
  const grantQuery = {
    filter: {
      grant: `pi.id==${userId},coPis.id==${userId}`,
    },
    sort: '+awardStatus,-endDate',
    page: {
      number: page,
      size: pageSize,
      totals: true,
    },
  };

  if (params.filter) {
    grantQuery.filter.grant = `(${grantQuery.filter.grant});projectName=ini=*${params.filter}*`;
  }

  return grantQuery;
}

export function grantsIndexSubmissionQuery(user) {
  const userMatch = `grants.pi.id==${user.id},grants.coPis.id==${user.id}`;
  return {
    filter: {
      submission: `submissionStatus=out=cancelled;(${userMatch})`,
    },
  };
}
