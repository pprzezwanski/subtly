/* eslint-disable */

class Subtly {
    constructor(options) {
        this.config = { // no dots in class names
            mainNav: options ? options.mainNav : '[data-subtly]', // class name for main list element
            hasSubNav: options ? options.hasSubNav : 'has-sub', // class name for styling when list element has sub list
            isOpened: options ? options.isOpened : 'is-opened', // class name for styling when list is opened
            autoClose: options ? options.autoClose : true, // opened sub-navigation will close when it's sibling sub-navigation will be opened
        };
        this.initialized = false;
        this.mainUl;
        this.childrenUls;
    }

    restyleParentNavs (nav, action, navHeight) {
        const parentNav = nav.parentNode.parentNode;
        if (parentNav.nodeName === 'UL' && !parentNav.classList.contains(this.config.mainNav)) {
            // const parentNavLi = Array.from(parentNav.children).find(c => c.nodeName === 'LI');
            // const parentNavLiPadding = parentNavLi.offsetHeight - parentNavLi.children[0].offsetHeight
            // console.log(parentNavLi)
            // console.log(parentNavLiPadding)
            // console.log(parentNav.offsetHeight)
            // console.log(parentNav.scrollHeight)
            // const parentNavHeight = Math.max(parentNav.offsetHeight, parentNav.scrollHeight)
            // console.log(navHeight)
            if (action === 'add') parentNav.style.height = `${parentNav.scrollHeight + navHeight}px`;
            else parentNav.style.height = `${parentNav.scrollHeight - navHeight}px`;
            this.restyleParentNavs(parentNav, action, navHeight);
        }
    };

    subnav (el) {
        const subtly = this;
        const trigger = el.children[0];
        const sub = Array.from(el.children).find((c) => c.nodeName === 'UL');
        const subHeight = sub.scrollHeight;

        const closeNav = (el, sub, trigger) => {
            el.classList.remove(subtly.config.isOpened);
            sub.style.height = '0';
            if (trigger) trigger.innerHTML = trigger.innerText;
        };

        return {
            close() {
                closeNav(el, sub, trigger);
                subtly.restyleParentNavs(sub, 'substract', subHeight);
                return this;
            },
            open() {
                console.log('this.open')
                let heightCorrection = 0;
                if (subtly.config.autoClose) {
                    const opened = Array.from(el.parentNode.children).find(c => c.classList.contains(subtly.config.isOpened));
                    if (el.classList.contains(subtly.config.hasSubNav) && opened) {
                        heightCorrection = opened.scrollHeight - el.offsetHeight;
                        closeNav(opened, opened.children[2], opened.children[0]);
                    }
                }
                sub.style.height = `${subHeight}px`;
                if (trigger) {
                    const triggerHref = trigger.getAttribute('href');
                    trigger.innerHTML = `<a href="${triggerHref}">${trigger.innerText}</a>`;
                }
                setTimeout(() => { el.classList.add(subtly.config.isOpened); }, 100);
                subtly.restyleParentNavs(sub, 'add', subHeight - heightCorrection);
               
                setTimeout(() => {
                    const desiredHeight = Array.from(subtly.mainUl.children).reduce((a,c) => a + c.offsetHeight, 0)
                    if (subtly.mainUl && (subtly.mainUl.offsetHeight < desiredHeight)) {
                        subtly.mainUl.style.height = subtly.mainUl.scrollHeight + 'px'
                    }
                }, 300)
                
                return this;
            },
            toggleOpen() {
                if (sub.offsetHeight === 0) this.open();
                else this.close();
                return this;
            },
        };
    }

    addClassToSubNavItemsWithSub (item) {
        Array.from(item.children[1].children)
            .filter(c => c.children.length === 2)
            .forEach((c) => { c.classList.add(this.config.hasSubNav); });
    }

    findItemsWithSubnav (elementsArr) {
        return elementsArr
            .filter(s => Array.from(s.children)
                .find(c => c.nodeName === 'UL')
            );
    }

    setItemListener (item) {
        const itemSubNav = item.children[1];

        item.classList.add(this.config.hasSubNav);
        this.addClassToSubNavItemsWithSub(item);

        item.addEventListener('touchstart', (e) => {
            const itemLink = item.children[0];
            const itemLinkChildLink = itemLink.children[0];
            // if we click in the main link of current nav item
            if (e.target === itemLinkChildLink) return;
            // if we click the link el (first child) in current nav item
            if (e.target === itemLink) {
                e.preventDefault();
                this.subnav(item).toggleOpen();
            }
        });

        const subNavItemsWithSub = this.findItemsWithSubnav(Array.from(itemSubNav.children));
        subNavItemsWithSub.forEach((i) => {
            this.addClassToSubNavItemsWithSub(i);
            this.setItemListener(i);
        });
    }

    close () {
        console.log('subtly close');
        this.childrenUls.forEach(u => u.style.height = '0');
        if (this.mainUl) {
            this.mainUl.style.height = 'auto';
            Array.from(this.mainUl.children).forEach(c => c.classList.remove('is-opened'))
        }
    }

    init () {
        console.log('subtly init')
        this.mainUl = document.querySelector(`${this.config.mainNav}`);
        this.childrenUls = document.querySelectorAll(`${this.config.mainNav} ul`);
        this.close();
        const navItems = Array.from(document.querySelectorAll(`${this.config.mainNav} > li`));
        const itemsWithSub = this.findItemsWithSubnav(navItems);
        itemsWithSub.forEach((item) => { this.setItemListener(item); });
        this.initialized = true;

    }
};

export default Subtly;