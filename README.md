# subtly
infinity nested sub-navigation accordions

This script will provide accorions for any number and configuration of sublist inside of lists.

Add [data-subtly] attribute to main ul element.

Rules for html: this script assumes that there is unorderd list 'ul' that has children 'li'. Each li has 'a' element as a child and if there is a sub-list 'ul' it is placed after 'a' element. Then this has the same rules as written.

Example in pug:

ul(data-subtly) 
    li 
        a smth1
    li
        a smth2
        ul
            li 
                a smth1-in-smth2
                ul
                    li
                        a smth2-in-smth2
