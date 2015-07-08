# Copyright (C) 2011  Bradley N. Miller
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
__author__ = 'bmiller'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive
import json
import random

#    setup is called in __init__.py (in clickableArea)


def clickcorrect(name, rawtext, text, lineno, inliner, options={}, content=[]):
    '''
    Usage:
    In your document you can write :textfield:`myid:myvalue:width`
    This will translate to:
        <input type='text' id='myid' class="form-control input-small" style="display:inline; width:width;" value='myvalue'></input>

    where width can be specified in pixels or percentage of page width (standard CSS syntax).
    Width can also be specified using relative sizes:
        mini, small, medium, large, xlarge, and xxlarge
    '''
    clickableContent = text

    print(text)
    print("---------------------------text----------------------------------------")

    res = '''<span data-correct>%s</span>''' % (clickableContent)

    return [nodes.raw('',res, format='html')],[]


def clickincorrect(name, rawtext, text, lineno, inliner, options={}, content=[]):
    '''
    Usage:
    In your document you can write :textfield:`myid:myvalue:width`
    This will translate to:
        <input type='text' id='myid' class="form-control input-small" style="display:inline; width:width;" value='myvalue'></input>

    where width can be specified in pixels or percentage of page width (standard CSS syntax).
    Width can also be specified using relative sizes:
        mini, small, medium, large, xlarge, and xxlarge
    '''
    clickableContent = text


    res = '''<span data-incorrect>%s</span>''' % (clickableContent)

    return [nodes.raw('',res, format='html')],[]
