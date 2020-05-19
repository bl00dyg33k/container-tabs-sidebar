import VerticalContainer from './vertical.js'
import {openTabInTemporaryContainer, isInstalled} from '../interop/temporary_containers.js'

export default class TemporaryContainer extends VerticalContainer {
    constructor(window, config, sessionStorage) {
        super(window, config, sessionStorage)
        this.cookieStoreIds = []
    }

    attachContextualIdentity(cookieStoreId) {
        this.cookieStoreIds.push(cookieStoreId)
        this.render(true)
    }

    detachContextualIdentity(cookieStoreId) {
        this.cookieStoreIds.splice(cookieStoreId)
        this.render(true)
    }

    async _actionNewTab(options = {}) {
        await super._actionNewTab(options)
        await openTabInTemporaryContainer(options.url || '')
    }

    async _queryTabs() {
        let tabs = await browser.tabs.query({
            currentWindow: true,
            pinned: false
        })
        return tabs.filter(tab => this.cookieStoreIds.indexOf(tab.cookieStoreId) != -1)
    }

    get _faviconURL() {
        return `/assets/temporary-containers.png`;
    }

    get title() {
        return `Temporary containers`;
    }

    async render(renderTabs, callback) {
        if(this.cookieStoreIds.length === 0 && !(await isInstalled())) {
            this.element.style.display = 'none'
            return
        }
        this.element.style.display = 'initial'
        super.render(renderTabs, callback)
    }

    supportsCookieStore(cookieStoreId) {
        return this.cookieStoreIds.indexOf(cookieStoreId) !== -1
    }
}