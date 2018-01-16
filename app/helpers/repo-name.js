import { helper } from '@ember/component/helper';

export function repoName([repo]) {
  let repoMap = {
    "PMC": "PubMed Central",
    "NSF-PAR": "National Science Foundation Public Access Repository",
    "JHU-IR": "JScholarship - JHU Publications Repository"
  };

  if (typeof repo !== 'string') {
    return '';
  }

  return repoMap[repo] || repo;
}

export default helper(repoName);
