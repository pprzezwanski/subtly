# subtly.js

Complete self-controlling solution for mobile version of navigation based on unordered lists that can have as much levels of sub-navigation as needed. Subtly will automatically self-disable and relaunch when the screen size changes based on the breakpoint set in options. It also sets touch behaviour for desktop version of navigation (which is enabled when mobile nav behaviour is disabled)

## Setup
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
            