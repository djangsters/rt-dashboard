
export const appendElement = (tag, parent, classes = '', innerHtml = null) => {
  const element = document.createElement(tag)
  if (classes) {
    classes.split(' ').filter(c => c && c.length > 0)
      .forEach((className) => element.classList.add(className))
  }
  element.innerHTML = innerHtml
  parent.appendChild(element)
  return element
}
