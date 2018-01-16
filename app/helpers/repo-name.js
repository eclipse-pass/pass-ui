import { helper } from '@ember/component/helper';

export function repoName([repo]) {
  let repoMap = {
    "PMC": "PubMed Central",
    "NSF-PAR": "National Science Foundation Public Access Repository",
    "DOE-PAGES": "DOE-PAGES",
    "JHU-IR": "JScholarship - JHU Publications Repository"
  };

  if (typeof repo !== 'string' || !repoMap.hasOwnProperty(repo)) {
    return '';
  }

  return repoMap[repo];
}

export default helper(repoName);
