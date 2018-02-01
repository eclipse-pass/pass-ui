import { helper } from '@ember/component/helper';

// pass in label followed by URI as parameters. This will check for a URL, if there
// is one a link is created, if not it will just return the label

function optionalLink(params) {
  let label = params[0];
  let url = params[1];
  if (url!=null && url.trim().length>0) {
	var a = document.createElement('a');
	var linkText = document.createTextNode(label);
	a.appendChild(linkText);
	a.href = url;
	a.title = url;
	a.target = "_blank";
    return a;
  } else {
    return label;
  }
}

export default helper(optionalLink);
