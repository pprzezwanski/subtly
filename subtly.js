export default options => {
    const config = { // no dots in class names
        mainNav: '[data-subtly]', // class name for main list element
        hasSubNav: 'has-sub', // class name for styling when list element has sub list
		isOpened: 'is-opened', // class name for styling when list is opened
		autoClose: true // opened sub-navigation will close when it's sibling sub-navigation will be opened
	};

	if (options) {
		if (options.mainNav) config.mainNav = options.mainNav;
		if (options.hasSubNav) config.hasSubNav = options.hasSubNav;
		if (options.isOpened) config.isOpened = options.isOpened;
		if (options.autoClose) config.autoClose = options.autoClose;
	}
	
    const restyleParentNavs = (nav, action, navHeight) => {
        const parentNav = nav.parentNode.parentNode;
        if (parentNav.nodeName === 'UL' && !parentNav.classList.contains(config.mainNav)) {
            if (action === 'add') parentNav.style.height = parentNav.scrollHeight + navHeight + 'px';
            else parentNav.style.height = parentNav.scrollHeight - navHeight + 'px';
            restyleParentNavs(parentNav, action, navHeight);
        }
	};
	
    const subnav = el => {
		const trigger = el.children[0];
		const sub = el.children[1];
		const subHeight = sub.scrollHeight;

		const closeNav = (el, sub, trigger) => {
			el.classList.remove(config.isOpened);
			sub.style.height = '0';
			if (trigger) trigger.innerHTML = trigger.innerText;
		};

		return {
			close () {
				closeNav(el, sub, trigger);
				restyleParentNavs(sub, 'substract', subHeight);
				return this;
			},
			open () {
				let heightCorrection = 0;
				if (config.autoClose) {
					const opened = Array.from(el.parentNode.children).find(c => c.classList.contains(config.isOpened));
					if (opened) {
						heightCorrection = opened.scrollHeight - el.offsetHeight;
						closeNav(opened, opened.children[1], opened.children[0]);
					}
				}
				sub.style.height = subHeight + 'px';
				if (trigger) {
					const triggerHref = trigger.getAttribute('href');
					trigger.innerHTML = '<a href="' + triggerHref + '">' + trigger.innerText + '</a>';
				}
				setTimeout(() => { el.classList.add(config.isOpened); }, 100);
				restyleParentNavs(sub, 'add', subHeight - heightCorrection);
				return this;
			}, toggleOpen () {
				if (sub.offsetHeight === 0) this.open();
				else this.close();
				return this;
			}
		};
    };

    const addClassToSubNavItemsWithSub = item => {
        Array.from(item.children[1].children)
            .filter(c => c.children.length === 2)
            .forEach(c => { c.classList.add(config.hasSubNav); });
    };

    const findItemsWithSubnav = elementsArr => elementsArr
        .filter(s => Array.from(s.children).find(c => c.nodeName === 'UL'));

    const setItemListener = item => {
        const itemSubNav = item.children[1];
        
        item.classList.add(config.hasSubNav);
        addClassToSubNavItemsWithSub(item);

        item.addEventListener('touchstart', e => {
            const itemLink = item.children[0];
            const itemLinkChildLink = itemLink.children[0];
            // if we click in the main link of current nav item
            if (e.target === itemLinkChildLink) return;
            // if we click the link el (first child) in current nav item
            if (e.target === itemLink) { 
                e.preventDefault();
				subnav(item).toggleOpen();
            }
        });

        const subNavItemsWithSub = findItemsWithSubnav(Array.from(itemSubNav.children));
        subNavItemsWithSub.forEach(i => { 
            addClassToSubNavItemsWithSub(i);
            setItemListener(i); 
        });
    };

    document.addEventListener("DOMContentLoaded", () => {
        Array.from(document.querySelectorAll(config.mainNav + ' > li ul'))
            .forEach(u => { u.style.height = '0'; });
        const navItems = Array.from(document.querySelectorAll(config.mainNav + ' > li'));
        const itemsWithSub = findItemsWithSubnav(navItems);
		itemsWithSub.forEach(item => { setItemListener(item); });
    });
};