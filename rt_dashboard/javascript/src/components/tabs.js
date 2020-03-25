(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    HOME: 36,
    END: 35,
  }

  const template = document.createElement('template')
  template.innerHTML = `
    <style>
      :host {
        display: flex
        flex-wrap: wrap
      }
      ::slotted(howto-panel) {
        flex-basis: 100%
      }
    </style>
    <slot name="tab"></slot>
    <slot name="panel"></slot>
  `
  // eslint-disable-next-line no-undef
  class HowtoTabs extends HTMLElement {
    constructor () {
      super()

      this._onSlotChange = this._onSlotChange.bind(this)

      this.attachShadow({ mode: 'open' })
      this.shadowRoot.appendChild(template.content.cloneNode(true))

      this._tabSlot = this.shadowRoot.querySelector('slot[name=tab]')
      this._panelSlot = this.shadowRoot.querySelector('slot[name=panel]')

      this._tabSlot.addEventListener('slotchange', this._onSlotChange)
      this._panelSlot.addEventListener('slotchange', this._onSlotChange)
    }

    connectedCallback () {
      this.addEventListener('keydown', this._onKeyDown)
      this.addEventListener('click', this._onClick)

      if (!this.hasAttribute('role')) {
        this.setAttribute('role', 'tablist')
      }

      Promise.all([
        customElements.whenDefined('howto-tab'),
        customElements.whenDefined('howto-panel'),
      ]).then(_ => this._linkPanels())
    }

    disconnectedCallback () {
      this.removeEventListener('keydown', this._onKeyDown)
      this.removeEventListener('click', this._onClick)
    }

    _onSlotChange () {
      this._linkPanels()
    }

    _linkPanels () {
      const tabs = this._allTabs()

      tabs.forEach(tab => {
        const panel = tab.nextElementSibling
        if (!panel) {
          return
        }

        if (panel.tagName.toLowerCase() !== 'howto-panel') {
          console.error(`Tab #${tab.id} is not a sibling of a <howto-panel>`)
          return
        }

        tab.setAttribute('aria-controls', panel.id)
        panel.setAttribute('aria-labelledby', tab.id)
      })

      const selectedTab =
        tabs.find(tab => tab.selected) || tabs[0]

      this._selectTab(selectedTab)
    }

    _allPanels () {
      return Array.from(this.querySelectorAll('howto-panel'))
    }

    _allTabs () {
      return Array.from(this.querySelectorAll('howto-tab'))
    }

    _panelForTab (tab) {
      const panelId = tab.getAttribute('aria-controls')
      return this.querySelector(`#${panelId}`)
    }

    _prevTab () {
      const tabs = this._allTabs()
      const newIdx = tabs.findIndex(tab => tab.selected) - 1
      return tabs[(newIdx + tabs.length) % tabs.length]
    }

    _firstTab () {
      const tabs = this._allTabs()
      return tabs[0]
    }

    _lastTab () {
      const tabs = this._allTabs()
      return tabs[tabs.length - 1]
    }

    _nextTab () {
      const tabs = this._allTabs()
      const newIdx = tabs.findIndex(tab => tab.selected) + 1
      return tabs[newIdx % tabs.length]
    }

    reset () {
      const tabs = this._allTabs()
      const panels = this._allPanels()

      tabs.forEach(tab => { tab.selected = false })
      panels.forEach(panel => { panel.hidden = true })
    }

    _selectTab (newTab) {
      if (!newTab) {
        return
      }
      // Deselect all tabs and hide all panels.
      this.reset()

      // Get the panel that the `newTab` is associated with.
      const newPanel = this._panelForTab(newTab)
      // If that panel doesn’t exist, abort.
      if (!newPanel) {
        throw new Error(`No panel with id ${newTab.id}`)
      }
      newTab.selected = true
      newPanel.hidden = false
      newTab.focus()
    }

    _onKeyDown (event) {
      // If the keypress did not originate from a tab element itself,
      // it was a keypress inside the a panel or on empty space. Nothing to do.
      if (event.target.getAttribute('role') !== 'tab') {
        return
      }
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) {
        return
      }

      // The switch-case will determine which tab should be marked as active
      // depending on the key that was pressed.
      let newTab
      switch (event.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        newTab = this._prevTab()
        break

      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
        newTab = this._nextTab()
        break

      case KEYCODE.HOME:
        newTab = this._firstTab()
        break

      case KEYCODE.END:
        newTab = this._lastTab()
        break
      // Any other key press is ignored and passed back to the browser.
      default:
        return
      }

      // The browser might have some native functionality bound to the arrow
      // keys, home or end. The element calls `preventDefault()` to prevent the
      // browser from taking any actions.
      event.preventDefault()
      // Select the new tab, that has been determined in the switch-case.
      this._selectTab(newTab)
    }

    _onClick (event) {
      // If the click was not targeted on a tab element itself,
      // it was a click inside the a panel or on empty space. Nothing to do.
      if (event.target.getAttribute('role') !== 'tab') {
        return
      }
      // If it was on a tab element, though, select that tab.
      this._selectTab(event.target)
    }
  }
  customElements.define('howto-tabs', HowtoTabs)

  // `howtoTabCounter` counts the number of `<howto-tab>` instances created. The
  // number is used to generated new, unique IDs.
  let howtoTabCounter = 0
  const header = document.createElement('li')
  const tabShadowRoot = header.attachShadow({ mode: 'open' })
  tabShadowRoot.innerHTML = '<li role="presentation" class="nav-item"><a class="nav-link active" href="#">Overview</a></li>'
  class HowtoTab extends HTMLElement {
    static get observedAttributes() {
      return ['selected']
    }

    constructor() {
      super()
      this.innerHTML = tabShadowRoot.content.cloneNode(true)
    }

    connectedCallback () {
      // If this is executed, JavaScript is working and the element
      // changes its role to `tab`.
      const template = document.getElementById('one-dialog');
      const node = document.importNode(template.content, true);
      this.appendChild(node);

      this.attachShadow( { mode: 'open' } )
            .innerHTML = '<li role="presentation" class="nav-item"><a class="nav-link active" href="#">Overview</a></li>'

      this.setAttribute('role', 'tab')
      if (!this.id) {
        this.id = `howto-tab-generated-${howtoTabCounter++}`
      }

      // Set a well-defined initial state.
      this.setAttribute('aria-selected', 'false')
      this.setAttribute('tabindex', -1)
      this._upgradeProperty('selected')
    }

    _upgradeProperty (prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop]
        delete this[prop]
        this[prop] = value
      }
    }

    attributeChangedCallback () {
      const value = this.hasAttribute('selected')
      this.setAttribute('aria-selected', value)
      this.setAttribute('tabindex', value ? 0 : -1)
    }

    set selected (value) {
      value = Boolean(value)
      if (value) {
        this.setAttribute('selected', '')
      } else {
        this.removeAttribute('selected')
      }
    }

    get selected () {
      return this.hasAttribute('selected')
    }
  }
  customElements.define('howto-tab', HowtoTab)

  let howtoPanelCounter = 0
  /**
   * `HowtoPanel` is a panel for a `<howto-tabs>` tab panel.
   */
  class HowtoPanel extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      this.setAttribute('role', 'tabpanel')
      if (!this.id)
        this.id = `howto-panel-generated-${howtoPanelCounter++}`
    }
  }
  customElements.define('howto-panel', HowtoPanel)
})()
