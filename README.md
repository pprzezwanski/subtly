# subtly

Complete self-controlling solution for mobile version of navigation based on unordered lists that can have as much levels of sub-navigation as needed. Subtly will automatically self-disable and relaunch when the screen size changes based on the breakpoint set in options. It also sets touch behaviour for desktop version of navigation (which is enabled when mobile nav behaviour is disabled)

## Setup
1. Add subtly.js script to scripts folder (soon it will be availble as npm package)
2. Subtly is an es6 class, so: include it in main js file and call it, for example:
```
import Subtly from './modules/libs/subtly';
const subtly = new Subtly();
```

2. Add subtly.scss to your sass folder or rename it add subtly.css and add to css folder.
3. Add [data-subtly] attribute to main ul element.

Rules for html: the script assumes that there is unorderd list 'ul' that has children 'li'. Each li has 'a' element as a child and if there is a sub-list 'ul' it is placed after 'a' element. Then this has the same rules. 

This html structure may be modified by adding inside of any li element any other html elements but there are two rules: 
* there has to be at least one 'a' element and it shoould be the main link for this li element
* there can be only one 'ul' element

Example in pug:

<pre>
ul(data-subtly)
    li
        a smth1
    li
        a smth2
        ul
            li 
                a smth3-in-smth2
                ul
                    li
                        a smth6-in-smth3-in-smth2
                    li
                        a smth7-in-smth3-in-smth2
                        ul
                            li
                                a smth9-in-smth7-in-smth3-in-smth2
                            li
                                a smth10-in-smth7-in-smth3-in-smth2
                    li
                        a smth8-in-smth3-in-smth2
            li
                a smth4-in-smth2
            li
                a smth5-in-smth2


</pre>


