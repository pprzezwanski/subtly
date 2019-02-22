/* eslint-disable max-len, no-return-assign */

class Subtly {
    constructor(options) {
        this.config = { // no dots in class names
            mainNav: options ? options.mainNav : '[data-subtly]', // class name for main list element
            hasSubNav: options ? options.hasSubNav : 'has-sub', // class name for styling when list element has sub list
            isOpened: options ? options.isOpened : 'is-opened', // class name for styling when list is opened
            autoClose: options ? options.autoClose : true, // opened sub-navigation will close when it's sibling sub-navigation will be opened
        };
        this.initialized = false;
        this.mainUl = null;
        this.childrenUls = null;
        this.mainLiWidthSub = null;
        this.liContainingUl = [];
        this.onItemTouch = this.onItemTouch.bind(this);
    }

    restyleParentNavs(nav, action, navHeight) {
        const parentNav = nav.parentNode.parentNode;
        if (parentNav.nodeName === 'UL') {
            if (action === 'add') parentNav.style.maxHeight = `${parentNav.scrollHeight + navHeight}px`;
            else parentNav.style.maxHeight = `${parentNav.scrollHeight - navHeight}px`;
            this.restyleParentNavs(parentNav, action, navHeight);
        }
    }

    subnav(el) {
        const that = this;
        const trigger = Subtly.findChildFirstA(el);
        const sub = Subtly.findChildUl(el);
        if (!sub) return false;

        const closeNav = (elem, subnav, trig) => {
            elem.classList.remove(that.config.isOpened);
            subnav.style.maxHeight = '0';
            if (trig) trig.innerHTML = trig.innerText.toLowerCase();
        };

        return {
            close() {
                closeNav(el, sub, trigger);
                that.restyleParentNavs(sub, 'substract', sub.scrollHeight);
                return this;
            },
            open() {
                const opened = that.config.autoClose && that.findOpenedSibling(el);
                let heightCorrection = 0;
                if (trigger) {
                    const triggerHref = trigger.getAttribute('href');
                    trigger.innerHTML = `<a href="${triggerHref}">${trigger.innerText}</a>`;
                }
                sub.style.maxHeight = `${sub.scrollHeight}px`;
                el.classList.add(that.config.isOpened);
                if (opened) heightCorrection = opened.scrollHeight - el.scrollHeight;
                that.restyleParentNavs(sub, 'add', sub.scrollHeight - heightCorrection);
                if (opened) closeNav(opened, Subtly.findChildUl(opened), Subtly.findChildFirstA(opened));
                return this;
            },
            toggleOpen() {
                if (sub.offsetHeight === 0) this.open();
                else this.close();
                return this;
            },
        };
    }

    addClassToLiWithSub(li) {
        Array.from(Subtly.findChildUl(li).children)
            .filter(c => Subtly.findChildUl(c))
            .forEach((c) => { c.classList.add(this.config.hasSubNav); });
    }

    static findItemsWithSubnav(elementsArr) {
        return elementsArr
            .filter(s => Array.from(s.children)
                .find(c => c.nodeName === 'UL'));
    }

    static findChildUl(li) {
        return Array.from(li.children).find(c => c.nodeName === 'UL');
    }

    static findChildFirstA(li) {
        return Array.from(li.children).find(c => c.nodeName === 'A');
    }

    findOpenedSibling(li) {
        return Array.from(li.parentNode.children)
            .find(c => c.classList.contains(this.config.isOpened));
    }

    onItemTouch(event) {
        const itemLink = Subtly.findChildFirstA(event.currentTarget);
        // if we click the link el (first child) in current nav item
        // which means we don't click on the child link of this link
        // and it has bubbled up one level
        if (event.target === itemLink) {
            event.preventDefault();
            this.subnav(event.currentTarget).toggleOpen();
            return true;
        }
        return false;
    }

    fillArrayOfLiElementsContainingUl() {
        const allLi = Array.from(document.querySelectorAll(`${this.config.mainNav} li`));
        this.liContainingUl = Subtly.findItemsWithSubnav(allLi);
    }

    off() {
        this.liContainingUl.forEach((l) => {
            if (l.classList.contains(this.config.isOpened)) this.subnav(l).close();
        });
        this.liContainingUl.forEach(l => l.removeEventListener('touchstart', this.onItemTouch));
        this.childrenUls.forEach(u => u.style.maxHeight = '9999px');
        this.mainUl.style.maxHeight = '9999px';
    }

    on() {
        this.liContainingUl.forEach(l => l.addEventListener('touchstart', this.onItemTouch));
        this.childrenUls.forEach(u => u.style.maxHeight = '0');
    }

    init() {
        this.mainUl = document.querySelector(`${this.config.mainNav}`);
        this.childrenUls = document.querySelectorAll(`${this.config.mainNav} ul`);
        this.childrenUls.forEach(u => u.style.maxHeight = '0');
        const navItems = Array.from(document.querySelectorAll(`${this.config.mainNav} > li`));
        this.mainLiWidthSub = Subtly.findItemsWithSubnav(navItems);
        this.fillArrayOfLiElementsContainingUl();
        this.liContainingUl.forEach((l) => {
            l.classList.add(this.config.hasSubNav);
            l.addEventListener('touchstart', this.onItemTouch);
        });
        this.initialized = true;
    }
}

export default Subtly;
