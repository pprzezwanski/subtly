/* eslint-disable max-len, no-return-assign */

/*!
 * Subtly.js v1.1.0
 * (c) 2019 Paweł Przezwański <pprzezwanski@gmail.com>
 * Released under the MIT License.
 * Repository and instructions: https://github.com/pprzezwanski/subtly.js/
 */

/**
 * @param {object} options - object with options (more on https://github.com/pprzezwanski/subtly.js/)
 */

import deepExtend from 'deep-extend';
import fq from 'frame-q';

const findItemsWithSubnav = elementsArr => elementsArr
  .filter(s => Array.from(s.children).find(c => c.nodeName === 'UL'));

const splitItemsAccordingToSubnav = (elementsArr) => {
  const withSubnav = [];
  const withoutSubnav = [];

  elementsArr.forEach((el) => {
    if (Array.from(el.children).find(c => c.nodeName === 'UL')) withSubnav.push(el);
    else withoutSubnav.push(el);
  });

  return { withSubnav, withoutSubnav };
};

const findChildFirstA = el => Array.from(el.children).find(c => c.nodeName === 'A');

const getWindowWidth = () => window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth
    || 0;

class SubtlySubnav {
  constructor(options) {
    const {
      el, id
    } = options;

    this.id = id;
    this.el = el;
    this.config = options.config;
    this.trigger = findChildFirstA(el);
    this.triggerText = null;
    // this.triggerText = this.trigger.innerText;
    this.href = this.trigger.getAttribute('href');
    // console.log(this.triggerText);
    this.triggerLinkElement = null;
    this.sub = Array.from(el.children).find(c => c.nodeName === 'UL');
    this.allDirectChildrenWithoutSubnav = Array.from(document.querySelectorAll(`#subtly-${this.id} > ul > li:not(.${this.config.hasSubNav})`));
    this.allChildrenContainingUl = Array.from(document.querySelectorAll(`#subtly-${this.id} .${this.config.hasSubNav}`));
    this.directChildrenContainingUl = findItemsWithSubnav(Array.from(this.sub.children));
    this.childrenSubnavs = [];
    this.restyleParentNavs = options.restyleParentNavs;
    this.isOpened = false;
    this.init();
  }

  setTriggerText() {
    // this.triggerText = this.trigger.innerText;
    this.triggerText = this.trigger.textContent;
  }

  createTriggerLinkElement() {
    this.triggerLinkElement = document.createElement('a');
    // this.triggerText = this.trigger.innerText;
    this.triggerLinkElement.innerText = this.triggerText;
    // const triggerHref = this.trigger.getAttribute('href');
    // console.log(triggerHref);
    if (this.href && this.href !== 'null') {
      this.triggerLinkElement.setAttribute('href', this.href);
      this.triggerLinkElement.classList.add('has-href');
    }
  }

  closeNav() {
    this.el.classList.remove(this.config.isOpened);
    this.sub.style.maxHeight = '0';
    this.trigger.removeChild(this.triggerLinkElement);
    this.trigger.innerText = this.triggerText;
  }

  findOpenedSibling() {
    return Array.from(this.el.parentNode.children)
      .find(c => c.classList.contains(this.config.isOpened));
  }

  setTabIndexForListElements(focusable = true) {
    const tI = focusable ? 0 : -1;
    this.directChildrenContainingUl.forEach((el) => { el.tabIndex = tI; });
  }

  setTabIndexForLinksWithHref(focusable = true) {
    const tI = focusable ? 0 : -1;
    this.allDirectChildrenWithoutSubnav.forEach((el) => {
      const link = el.children[0];
      const href = link && link.getAttribute('href');
      if (href && href !== 'null') link.tabIndex = tI;
    });
  }

  setTabIndexForOpenedChildrenSubnavs(focusable = true) {
    const tI = focusable ? 0 : -1;
    this.childrenSubnavs.forEach((subnav) => {
      if (!subnav.isOpened) return;
      const { el, triggerLinkElement } = subnav;
      el.tabIndex = tI;
      subnav.setTabIndexForListElements(focusable);
      // directChildrenContainingUl.forEach((c) => { c.tabIndex = tI; });
      subnav.setTabIndexForLinksWithHref(focusable);
      triggerLinkElement.tabIndex = tI;
    });
  }

  setTabIndex(focusable = true) {
    this.setTabIndexForListElements(focusable);
    this.setTabIndexForLinksWithHref(focusable);
    this.setTabIndexForOpenedChildrenSubnavs(focusable);
  }

  close(restyle = true) {
    // console.log('close', { ...this }, allSubnavs);
    this.closeNav();
    if (restyle) this.restyleParentNavs(this.sub, 'substract', this.sub.scrollHeight);
    this.setTabIndex(false);
    this.isOpened = false;
    return this;
  }

  open(allSubnavs = []) {
    // console.log('open', { ...this }, allSubnavs);
    const openedSibling = this.findOpenedSibling(this.el);
    const openedSiblingSubnav = allSubnavs.find(s => s.el === openedSibling);
    let heightCorrection = 0;
    if (this.trigger) {
      this.trigger.innerText = '';
      this.trigger.appendChild(this.triggerLinkElement);
    }
    this.sub.style.maxHeight = `${this.sub.scrollHeight}px`;
    this.el.classList.add(this.config.isOpened);
    if (this.config.autoclose && openedSiblingSubnav) {
      heightCorrection = openedSiblingSubnav.el.scrollHeight - this.el.scrollHeight;
    }
    this.restyleParentNavs(this.sub, 'add', this.sub.scrollHeight - heightCorrection);
    if (this.config.autoClose && openedSiblingSubnav) openedSiblingSubnav.close(false);

    this.setTabIndex(true);
    this.isOpened = true;
    return this;
  }

  init() {
    fq.add(() => {
      this.setTriggerText();
      this.createTriggerLinkElement();
      this.setTabIndexForLinksWithHref(false);
      this.trigger.tabIndex = -1;
    });
  }
}

class Subtly {
  constructor(options) {
    this.config = deepExtend(
      { // no dots in class names
        name: 'subtly',
        passive: true,
        mainNav: '[data-subtly]', // class name for main list element
        hasSubNav: 'has-sub', // class name for styling when list element has sub list
        isOpened: 'is-opened', // class name for styling when list is opened
        autoClose: true, // opened sub-navigation will close when it's sibling sub-navigation will be opened
        // breakpoint: options && options.breakpoint ? options.breakpoint : 992, // opened sub-navigation will close when it's sibling sub-navigation will be opened
        breakpoint: 999999, // opened sub-navigation will close when it's sibling sub-navigation will be opened
        eventToListen: 'click', // or touchstart
        coverDesktopTouchEvents: false,
        autoScroll: true,
      }, options
    );
    this.initialized = false;
    this.isOn = false;
    this.currentlyOpened = [];
    this.mainUl = null;
    this.childrenUls = null;
    this.liContainingUl = [];
    this.liWithoutSubnavWithHref = [];
    this.handleItemOnPointer = this.handleItemOnPointer.bind(this);
    // this.onItemTouch = this.onItemTouch.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onWindowChange = this.onWindowChange.bind(this);
    this.onOutsideNavTouch = this.onOutsideNavTouch.bind(this);
    this.onItemTouchDekstop = this.onItemTouchDekstop.bind(this);
    this.previousWindowWidth = null;
    this.windowChanged = false;
    this.keyPressed = false;

    // for desktop touch
    this.prevented = true;
    this.previous = null;

    // auto-init Subtly
    if (!this.config.passive) this.init();
  }

  restyleParentNavs(nav, action, navHeight) {
    const parentNav = nav.parentNode.parentNode;
    if (parentNav.nodeName === 'UL') {
      if (action === 'add') parentNav.style.maxHeight = `${parentNav.scrollHeight + navHeight}px`;
      else parentNav.style.maxHeight = `${parentNav.scrollHeight - navHeight}px`;
      this.restyleParentNavs(parentNav, action, navHeight);
    }
  }

  handleItemOnPointer(event) {
    // event.stopPropagation();
    // event.stopImmediatePropagation();

    const { target, currentTarget } = event;
    const keypressed = target.id.match(/subtly-/);

    if (keypressed) {
      // console.log('key was pressed', target.id, target, event);
      event.preventDefault();
      target.focus();
      return;
    }

    const itemLink = findChildFirstA(currentTarget);

    // if we click the link el (first child) in current nav item
    // which means we don't click on the child link of this link
    // and it has bubbled up one level
    const touchedSubnav = this.subnavs.find(s => s.el === currentTarget);

    if (event.target === itemLink || (keypressed)) {
      event.preventDefault();
      if (touchedSubnav) {
        if (!touchedSubnav.isOpened) {
          // console.log('open subnav', touchedSubnav.id);
          touchedSubnav.open(this.subnavs);
          this.currentlyOpened.push(touchedSubnav);
        } else {
          touchedSubnav.close(true);
          this.currentlyOpened = this.currentlyOpened.filter(s => s.id !== touchedSubnav.id);
        }

        if (this.config.autoScroll) {
          fq.wait(700).then(() => fq.add(() => {
            touchedSubnav.el.scrollIntoView();
          }));
          // setTimeout(() => {
          //     fq.add(() => {
          //         touchedSubnav.el.scrollIntoView();
          //     });
          // }, 700);
        }
      }
    }

    if (!this.keyPressed) document.activeElement.blur();
    this.keyPressed = false;
  }

  onKeydown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      this.keyPressed = true;
      const focused = document.activeElement;
      const focusedFirstChild = focused.children[0];
      if (focusedFirstChild) focusedFirstChild.click();
      else {
        const focusedHasHref = this.liWithoutSubnavWithHref.find(li => (
          li.link && li.link !== 'null'
        ));
        if (focusedHasHref) e.preventDefault();
      }
    }

    return this;
  }

  onWindowChange() {
    setTimeout(() => {
      if (this.windowChanged === true) return false;
      const windowWidth = getWindowWidth();
      if (windowWidth > this.config.breakpoint && this.previousWindowWidth <= this.config.breakpoint) {
        this.off();
        if (this.config.coverDesktopTouchEvents) this.desktopTouchOn();
      }
      if (windowWidth <= this.config.breakpoint && (this.previousWindowWidth > this.config.breakpoint/*  || !this.windowWidth */)) {
        this.on();
        if (this.config.coverDesktopTouchEvents) this.desktopTouchOff();
      }
      this.previousWindowWidth = windowWidth;
      this.windowChanged = true;
      setTimeout(() => { this.windowChanged = false; }, 100);
      return true;
    }, 100);
  }

  fillArrayOfLiElementsContainingUl() {
    const allLi = Array.from(document.querySelectorAll(`${this.config.mainNav} li`));
    this.liContainingUl = findItemsWithSubnav(allLi);
  }

  prepareLiElements() {
    const allLi = Array.from(document.querySelectorAll(`${this.config.mainNav} li`));
    const {
      withSubnav,
      withoutSubnav,
    } = splitItemsAccordingToSubnav(allLi);

    this.liContainingUl = withSubnav;

    this.liWithoutSubnavWithHref = withoutSubnav
      .filter((li) => {
        const link = li.children && li.children[0];
        const href = link.getAttribute('href');
        return (href && href !== 'null');
      })
      .map(li => ({
        element: li,
        link: li.children[0],
      }));

    this.liWithoutSubnavWithHref.forEach((li) => {
      // const link = li.children[0];
      li.link.classList.add('has-href');
    });
  }

  addHasSubNavClassAndId() {
    this.liContainingUl.forEach((li, id) => {
      li.id = `subtly-${id}`;
      li.classList.add(this.config.hasSubNav);
    });
  }

  setSubnavs() {
    this.subnavs = this.liContainingUl.map((li, id) => new SubtlySubnav({
      id,
      el: li,
      config: this.config,
      restyleParentNavs: this.restyleParentNavs,
    }));
  }

  initiateSubnavs() {
    this.subnavs.forEach(s => s.init());
  }

  setSubnavsChildren() {
    this.subnavs.forEach((subnav) => {
      subnav.childrenSubnavs = subnav.allChildrenContainingUl
        .map(li => this.subnavs.find(s => s.el === li));
    });
  }

  on() {
    // console.log('Subtly on');
    if (this.isOn) return;
    this.childrenUls.forEach(u => u.style.maxHeight = '0');
    this.subnavs.forEach((subnav) => {
      subnav.el.addEventListener(this.config.eventToListen, this.handleItemOnPointer);
      if (subnav.el.parentNode === this.mainUl) subnav.el.tabIndex = 0;
    });

    document.addEventListener('keydown', this.onKeydown);
    this.isOn = true;
  }

  off() {
    // console.log('Subtly off');
    if (!this.isOn) return;
    this.subnavs.forEach((subnav) => {
      subnav.el.removeEventListener(this.config.eventToListen, this.handleItemOnPointer);
      if (subnav.el.parentNode === this.mainUl) subnav.el.tabIndex = -1;
      if (subnav.isOpened) subnav.close();
    });

    this.childrenUls.forEach(ul => ul.style.maxHeight = '9999px');
    this.mainUl.style.maxHeight = '9999px';

    document.removeEventListener('keydown', this.onKeydown);
    this.isOn = false;
  }

  init() {
    this.mainUl = document.querySelector(`${this.config.mainNav}`);
    this.childrenUls = Array.from(document.querySelectorAll(`${this.config.mainNav} ul`));
    // this.fillArrayOfLiElementsContainingUl();
    this.prepareLiElements();
    this.addHasSubNavClassAndId();
    this.setSubnavs();
    // this.initiateSubnavs();
    // console.log(this.subnavs);
    this.setSubnavsChildren();
    if (!this.config.passive) {
      if (getWindowWidth() < this.config.breakpoint) this.on();
      else if (this.config.coverDesktopTouchEvents) this.desktopTouchOn();
    }
    if (this.config.autoScroll) {
      this.mainUl.parentNode.style.cssText = 'scroll-behavior: smooth;';
    }
    window.addEventListener('resize', this.onWindowChange, false);
    window.addEventListener('orientationchange', this.onWindowChange, false);
    this.initialized = true;
  }

  // large screens touch behaviour
  onOutsideNavTouch(event) {
    if (!Array.from(document.querySelectorAll('li'))
      .find(li => Array.from(li.children)
        .filter(c => c.nodeName === 'A')
        .find(a => a === event.target))
    ) {
      this.prevented = true;
      const touched = document.querySelector('li.is-touched');
      if (touched) touched.classList.remove('is-touched');
    }
  }

  onItemTouchDekstop(event) {
    if (this.previous && event.currentTarget !== this.previous) {
      this.prevented = true;
      this.previous.classList.remove('is-touched');
    }
    if (this.prevented) {
      event.preventDefault();
      event.currentTarget.classList.add('is-touched');
      this.prevented = false;
    } else {
      this.prevented = true;
    }
    this.previous = event.currentTarget;
  }

  desktopTouchOn() {
    this.liContainingUl.forEach((li) => {
      li.addEventListener('touchstart', this.onItemTouchDekstop);
    });

    // close subavs if clicked anywhere outside of nav
    document.querySelector('body')
      .addEventListener('touchstart', this.onOutsideNavTouch);
  }

  desktopTouchOff() {
    this.liContainingUl.forEach((li) => {
      li.removeEventListener('touchstart', this.onItemTouchDekstop);
    });

    // remove closing subnavs if clicked anywhere outside of nav
    document.querySelector('body')
      .removeEventListener('touchstart', this.onOutsideNavTouch);
  }
}

export default Subtly;
