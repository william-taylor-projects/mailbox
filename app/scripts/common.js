
const serverUrl = "http://dev.williamsamtaylor.co.uk:3005";

export const endpoint = url => {
  return `${serverUrl}/${url}`;
}

export const capitaliseFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const deleteEmail = (body, callback) => {
  const request = new Request(`${endpoint('deleteEmail')}`, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  });

  fetch(request)
    .then(response => response.json())
    .then(json => callback(json));
}

export const fetchEmails = (filter, callback) => {
  const request = new Request(`${endpoint('getEmails')}`, {
    body: JSON.stringify(filter),
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  });

  fetch(request)
    .then(response => response.json())
    .then(json => callback(json.emails));
}
