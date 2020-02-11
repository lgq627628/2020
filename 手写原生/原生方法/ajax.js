function ajax(type='GET', url) {
  let xhr = new XMLHttpRequest()
  xhr.open(type, url, false)
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      return JSON.parse(xhr.responseText)
    }
  }
  xhr.send()
}
