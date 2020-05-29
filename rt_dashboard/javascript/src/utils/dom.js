
export const appendElement = (tag, parent, classes = '', innerHtml = null) => {
  const element = createElement(tag, classes, innerHtml)
  parent.appendChild(element)
  return element
}

export const createElement = (tag, classes = '', innerHtml = null) => {
  const element = document.createElement(tag)
  if (classes) {
    classes.split(' ').filter(c => c && c.length > 0)
      .forEach((className) => element.classList.add(className))
  }
  element.innerHTML = innerHtml
  return element
}

export const loadTemplate = (parent, templateHtml, styles) => {
  const template = document.createElement('template')
  template.innerHTML = `${styles != null ? `<style>${styles}</style>` : ''}${templateHtml}`

  parent.appendChild(template.content.cloneNode(true))
}

export const removeChildNodes = (node) => {
  Array.from(node.childNodes).forEach((el) => {
    node.removeChild(el)
  })
}

export const mapDataToElements = (parent, data, itemMapper) => {
  const parentTemplate = createElement(parent.tagName)

  data.forEach(item => itemMapper(parentTemplate, item))

  parent.innerHTML = parentTemplate.innerHTML
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

export const whenUpgraded = async (node) => {
  await customElements.whenDefined(node.localName)
  customElements.upgrade(node)
}
