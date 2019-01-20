const subtly = (() => {
    const config = { // no dots in class names
        mainNav: '[data-subtly]', // class name for main list element
        hasSubNav: 'has-sub', // class name for styling when list element has sub list
        isOpened: 'is-opened' // class name for styling when list is opened
    };

    const restyleParentNavs = (nav, action, navHeight) => {
        const parentNav = nav.parentNode.parentNode;
        if (parentNav.nodeName === 'UL' && !parentNav.classList.contains(config.mainNav)) {
            if (action === 'add') parentNav.style.height = parentNav.scrollHeight + navHeight + 'px';
            else parentNav.style.height = parentNav.scrollHeight - navHeight + 'px';
            restyleParentNavs(parentNav, action, navHeight);
        }
    };
    
    const subnav = {
        close (el, sub, trigger) {
            el.classList.remove(config.isOpened);
            sub.style.height = '0';
            if (trigger) trigger.innerHTML = trigger.innerText;
            restyleParentNavs(sub, 'substract', sub.scrollHeight);
        },
        open (el, sub, trigger) {
            sub.style.height = sub.scrollHeight + 'px';
            if (trigger) {
                const triggerHref = trigger.getAttribute('href');
                trigger.innerHTML = '<a href="' + triggerHref + '">' + trigger.innerText + '</a>';
            }
            setTimeout(() => { el.classList.add(config.isOpened); }, 100);
            restyleParentNavs(sub, 'add', sub.scrollHeight);
        }, toggleOpen (el, sub, trigger) {
            if (sub.offsetHeight === 0) subnav.open(el, sub, trigger);
            else subnav.close(el, sub, trigger);
        }

    };

    const subNavigation = (el, e) => {
        const elSubNav = el.nextSibling;
        const elLink = el.children[0];
        if (elSubNav) {
            elSubNav.style.height = '0'; 
            e.preventDefault();
            subnav.toggleOpen(el, elSubNav, elLink);
        }
    };

    const addClassToSubNavItemsWithSub = item => {
        Array.from(item.children[1].children)
            .filter(c => c.children.length === 2)
            .forEach(c => { c.classList.add(config.hasSubNav); });
    };

    const findItemsWithSubnav = elementsArr => elementsArr
        .filter(s => Array.from(s.children).find(c => c.nodeName === 'UL'));

    const setItemListener = item => {
        // const itemSubNav = Array.from(item.children).find(c => c.nodeName === 'UL');
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
                // console.log('toggle open in listener if target =', itemLink);
                subnav.toggleOpen(item, itemSubNav, itemLink);
            } else if (e.target === itemSubNav) {
                // console.log('subnavigation for', item);
                subNavigation(e.target, itemSubNav, itemLink, e );
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
})();
