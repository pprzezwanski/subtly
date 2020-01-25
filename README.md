# subtly

Transform simple html into infinitly nested accordions presented in mobile navigation style with keyboard support. Subtly disables and enables its mobile behaviour based on given breakpoint. When its main mobile mode is disabled it still sets touch behaviour to prevent redirecting to new address when clicking on a link that shuold open submenu. It gives also perfect keyboard behaviour for accordions.

## Use cases:

* **mobile navigation with any-level of sub menus:** deeply nested structure of the mobile menu is main use case of subtly
* **inifnitly nested accordions:** subtly is also a mechanism for deeply nested accordions
* **one html for mobile and desktop navigation:** subtly makes possible with little effort in css to use one html structure for both mobile and desktop navigation
* **set touch behaviour for desktop style navigation:** subtly covers use case for big touch screens that use dekstop style menu but it need to behave properly when hover opening on hover is impossible (touch behaviour).
* **set keyboard support for accordions:** subtly gives perfect keyboard behaviour for accordions using tab, up, down, enter

## Usage
1. Add subtly.js script to scripts folder (soon it will be availble as npm package)
2. Subtly is an es6 class, so: include it in main js file and call it, for example:
```
import Subtly from './modules/libs/subtly';
const subtly = new Subtly();
```
3. Add subtly.scss to your sass folder or rename it to subtly.css and add to css vendor folder.
4. Add 'data-subtly' attribute to main ul element.

Rules for html: the script assumes that there is unorderd list 'ul' that has children 'li'. Each li has 'a' element as a child and if there is a sub-list 'ul' it is placed after 'a' element. Then this has the same rules. 

This html structure may be modified by adding inside of any li element any other html elements but there are two rules: 
* there has to be at least one 'a' element and it shoould be the main link for this li element
* there can be only one 'ul' element

Example in pug:

<pre>
ul(data-subtly)
    li
        a dog
    li
        a cat
        ul
            li 
                a dark cat
                ul
                    li
                        a black cat
                    li
                        a gray cat
                        ul
                            li
                                a blue-gray cat cat
                            li
                                a ginger-gray cat
                    li
                        a dark-bule cat
            li
                a github's cat
            li
                a pink cat
    li
        a pig
    li
        a monkey

</pre>


## Options

Options is an object that may overwrite default settings.

* autoClose [boolean]: enables auto-closing previously opened li when another li is being opened | default: true,
* breakpoint [integer]: breakpoint for enbaling and disabling mobile behaviour (in pixels) | default: 992,
* mainNav [string]: a selector for main ul element | default: '[data-subtly]',
* hasSubNav [string]: a css class name for styling li when it contains child | default: 'has-sub',
* isOpened [string]: a css class name for styling li when it's child ul is opened | default: 'is-opened',


## License

Subtly is [MIT licensed](./LICENSE).
Copyright (c) 2018-2019 Pawel Przezwanski <[https://ho-gi.com/](https://ho-gi.com/)>
            