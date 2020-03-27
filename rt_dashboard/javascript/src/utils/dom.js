
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

export const loadTemplate = (parent, templateHtml) => {
  const template = document.createElement('template')
  template.innerHTML = templateHtml

  parent.appendChild(template.content.cloneNode(true))
}

export const mapDataToElements = (table, data, itemMapper) => {
  Array.from(table.childNodes).forEach((el) => {
    table.removeChild(el)
  })

  data.forEach(item => itemMapper(table, item))
}

export const appendNoDataRow = (parent, text, colspan) => {
  Array.from(parent.childNodes).forEach((el) => {
    parent.removeChild(el)
  })

  const row = appendElement('tr', parent)
  const td = appendElement('td', row)
  td.innerHTML = text
  td.setAttribute('colspan', colspan)
}
