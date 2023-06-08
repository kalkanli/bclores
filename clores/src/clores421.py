#!/Library/Frameworks/Python.framework/Versions/3.6/bin/python3

import argparse
import time
import sys
import re
import pandas as pd
import os.path

# ========================================================================================


def begcclotable(a, b):
    print(r'''
\begin{center} 
\begin{tabular}{|cc|} \hline
''')
    print(r'{', a, r'} & {', b, r'} \\ \hline \hline')
    print(r'\hspace{1in} & \hspace{1in} \\')


def begpctable(a):
    print(r'''
\begin{center} 
\begin{tabular}{|c|} \hline
''')
    print(r'{\bf ', a, r'}  \\ \hline')


def begclotable(a):
    print(r'''
\begin{center} 
\begin{tabular}{|l|p{5in}|} \hline
''')
    print(r'\multicolumn{2}{|c|}{{\bf ', a, r'}} \\ \hline \hline')


def begchart():
    print(r'''
\scalebox{0.6}{
\begin{bchart}[min=1,step=1,max=4]
''')


def endchart(s):
    print(r'\bcxlabel{{\small ', s, r'}}')
    print(r'\end{bchart}')
    print(r'}')


def endtable():
    print(r'''
\end{tabular}
\end{center}
''')


def beginlatex():
    s = r'''\documentclass[11pt,a4paper]{article}
\usepackage{latexsym} 
\usepackage{amsmath} 
\usepackage{graphicx} 
\usepackage{times} 
\usepackage{subfigure} 
\usepackage{multirow}  
\usepackage{rotating}  
\usepackage{url}  
\usepackage{bigstrut}  
\usepackage{pgfplots}  
\usepackage{bchart}   
\usepackage{times}  
\usepackage[labelsep=period]{caption} 
\pgfplotsset{compat=1.5} 
\begin{document} '''
    print(s)


def titlelatex(title):
    localtime = time.asctime(time.localtime(time.time()))
    print(r'\begin{center}')
    print(r'{\bf ', title, r'} \\')
    print(r'{\it (report generation time: ', localtime, r') } \\')
    print(r'\end{center}')


def endlatex():
    print(r'''
\end{document}
''')

def calcclogradeavg(cloweights, gradesdf, disc):
    numrows = gradesdf.shape[0]
    numcolumns = len(cloweights)
    total = 0.0
    for i in range(0, numrows):
        subtotal = 0
        grades = list(gradesdf.loc[i])
        for j in range(0, numcolumns):
            subtotal = subtotal + cloweights[j]*grades[j]
        for k in range(3, -1, -1):
            if (subtotal >= disc[k]):
                isubtotal = k + 1
                break
        total = total + isubtotal

    return (total/numrows)


def clogradechart(course, semesters):
    begchart()
    spaceflag = 0
    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            cloweightsdf = pd.read_excel(
                xfilename, sheet_name="CLO-weights", engine='openpyxl')
            clos = list(cloweightsdf.loc[:, "New"])
            gradesdf = pd.read_excel(
                xfilename, sheet_name="grades", engine='openpyxl')
            numclos = len(clos) 
            discdf = pd.read_excel(
                xfilename, sheet_name="discretization", engine='openpyxl')
            disc = list(discdf.loc[0])
            if (spaceflag):
                print(r'\medskip')
                spaceflag = 0
            half = numclos // 2
            for jclo in range(0, numclos):
                if (half == 0):
                    print(r'\bclabel{', se, r'}')
                cloweights = list(cloweightsdf.loc[jclo])
                cloweights = cloweights[2:]
                gavg = calcclogradeavg(cloweights, gradesdf, disc)
                s = "%.1f" % (gavg)
                print(r'\bcbar[text={\scriptsize ', jclo+1, r'}]{', s, '}')
                if (jclo == half and half != 0):
                    print(r'\bclabel{', se, r'}')
            spaceflag = 1

    endchart("CLO Satisfaction Calculated from Grades")


def closurveychart(course, semesters):
    begchart()
    spaceflag = 0
    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            coursedf = pd.read_excel(
                xfilename, sheet_name="clo-surveys", engine='openpyxl')
            avgs = list(coursedf.loc[:, "Average"])
            numclos = len(avgs)
            if (spaceflag):
                print(r'\medskip')
                spaceflag = 0
            half = numclos // 2
            for jclo in range(0, numclos):
                x = avgs[jclo]
                if (half == 0):
                    print(r'\bclabel{', se, r'}')
                s = "%.1f" % (x)
                print(r'\bcbar[text={\scriptsize ', jclo+1, r'}]{', s, '}')
                if (jclo == half and half != 0):
                    print(r'\bclabel{', se, r'}')
            spaceflag = 1

    endchart("Student CLO Survey Results")


def clocourse(course, semesters):
    cfileflag = 0
    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            coursedf = pd.read_excel(
                xfilename, sheet_name="clo-surveys", engine='openpyxl')
            colnames = list(coursedf)
            cfileflag = 1
            begclotable(course + getinstrs(semesters, course))
            clodesc = list(coursedf.loc[:, colnames[1]])
            numclos = len(clodesc)

            for jclo in range(0, numclos):
                print(r'CLO{}'.format(jclo+1),
                      r' & { ', clodesc[jclo], r'} \\ \hline')
            break

    if cfileflag:
        print(r'\multicolumn{2}{|c|}{} \\')
        print(r'\multicolumn{2}{|c|}{')
        closurveychart(course, semesters)
        clogradechart(course, semesters)
        print(r'} \\ \hline')
        endtable()


def colclocourse(course, semesters):
    global coloutcomes

    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            cloweightsdf = pd.read_excel(
                xfilename, sheet_name="CLO-weights", engine='openpyxl')
            clos = list(cloweightsdf.loc[:, "New"])
            gradesdf = pd.read_excel(
                xfilename, sheet_name="grades", engine='openpyxl')
            numclos = len(clos)
            discdf = pd.read_excel(
                xfilename, sheet_name="discretization", engine='openpyxl')
            disc = list(discdf.loc[0])
            for jclo in range(0, numclos):
                outcometokens = re.split(r'[() ,]+', clos[jclo])
                outcomelist = []
                for t in outcometokens:
                    found = re.search(r'^\d+$', t)
                    if found:
                        outcomelist.append(int(found.group()))
                cloweights = list(cloweightsdf.loc[jclo])
                cloweights = cloweights[2:]
                gavg = calcclogradeavg(cloweights, gradesdf, disc)
                for outc in outcomelist:
                    coloutcomes[outc].append(gavg)


def cclochart(coloutcomes):
    begchart()
    for i in range(1, 12):
        x = 0
        for y in coloutcomes[i]:
            x = x + y
        if (len(coloutcomes[i]) == 0):
            s = "1"
        else:
            x = x / len(coloutcomes[i])
            s = "%.1f" % (x)
        print(r'\bcbar[label=', i, r']{', s, r'}')
    endchart("Collective CLO Results")

# ========================================================================================


def calcpcgradeavg(pcweights, gradesdf, disc):
    numrows = gradesdf.shape[0]
    numcolumns = len(pcweights)
    total = 0.0
    for i in range(0, numrows):
        subtotal = 0
        grades = list(gradesdf.loc[i])
        for j in range(0, numcolumns):
            subtotal = subtotal + pcweights[j]*grades[j]
        for k in range(3, -1, -1):
            if (subtotal >= disc[k]):
                isubtotal = k + 1
                break
        total = total + isubtotal

    return (total/numrows)


def pcgradechart(course, semesters):
    begchart()
    spaceflag = 0
    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            pcweightsdf = pd.read_excel(
                xfilename, sheet_name="PC-weights", engine='openpyxl')
            pcnewcolumnname = next(cn for cn in pcweightsdf.columns if cn in [
                                   "PC(New)", "PC(new)"])
            pcs = list(pcweightsdf.loc[:, pcnewcolumnname])
            gradesdf = pd.read_excel(
                xfilename, sheet_name="grades", engine='openpyxl')
            numpcs = len(pcs)
            discdf = pd.read_excel(
                xfilename, sheet_name="discretization", engine='openpyxl')
            disc = list(discdf.loc[0])
            if (spaceflag):
                print(r'\medskip')
                spaceflag = 0
            half = numpcs // 2
            for jpc in range(0, numpcs):
                if (half == 0):
                    print(r'\bclabel{', se, r'}')
                pcweights = list(pcweightsdf.loc[jpc])
                pcweights = pcweights[2:]
                gavg = calcpcgradeavg(pcweights, gradesdf, disc)
                s = "%.1f" % (gavg)
                print(r'\bcbar[text={\scriptsize ', pcs[jpc], r'}]{', s, '}')
                if (jpc == half):
                    print(r'\bclabel{', se, r'}')
            spaceflag = 1

    endchart("Level of Satisfaction")


def getinstrs(semesters, course):
    global courseinstr

    coinstrs = {}
    for se in semesters:
        if (se, course) in courseinstr:
            coinstrs[courseinstr[(se, course)]] = True
    str = " "
    for se in semesters:
        if (se, course) in courseinstr:
            if coinstrs[courseinstr[(se, course)]]:
                str = str + r' {\tiny ' + courseinstr[(se, course)] + r'}'
                coinstrs[courseinstr[(se, course)]] = False
    return (str)


def pccourse(course, semesters):
    global courseinstr
    cfileflag = 0
    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            cfileflag = 1
            break
    if cfileflag:
        begpctable(course + getinstrs(semesters, course))
        pcgradechart(course, semesters)
        print(r'\\ ')
        print(r'{\scriptsize 1: Not Satisfied,\hspace{0.1in} 2: Marginally Satisfied,\hspace{0.1in} 3: Satisfied, \hspace{0.1in} 4: Exceptionally Satisfied } \\ \hline')
        endtable()


def colpccourse(course, semesters):
    global colpcs

    for se in semesters:
        xfilename = os.getcwd() + '/clores/' + se + "-" + co + "-" + "clo-pc-data.xlsx"
        if os.path.isfile(xfilename):
            pcweightsdf = pd.read_excel(
                xfilename, sheet_name="PC-weights", engine='openpyxl')
            pcnewcolumnname = next(cn for cn in pcweightsdf.columns if cn in [
                                   "PC(New)", "PC(new)"])
            pcs = list(pcweightsdf.loc[:, pcnewcolumnname])
            gradesdf = pd.read_excel(
                xfilename, sheet_name="grades", engine='openpyxl')
            numpcs = len(pcs)
            discdf = pd.read_excel(
                xfilename, sheet_name="discretization", engine='openpyxl')
            disc = list(discdf.loc[0])
            for jpc in range(0, numpcs):
                pctokens = re.split(r'\s+', pcs[jpc])
                fpc = ''.join(pctokens)
                if fpc in colpcs:
                    pcweights = list(pcweightsdf.loc[jpc])
                    pcweights = pcweights[2:]
                    gavg = calcclogradeavg(pcweights, gradesdf, disc)
                    colpcs[fpc].append(gavg)
                else:
                    print("Error:  PC ", fpc, "does not exist")


def cpcchart(colpcs):
    begchart()
    for i in range(0, len(pcprefix)):
        for j in range(1, pccounts[i] + 1):
            ss = pcprefix[i] + "." + str(j)
            x = 0
            for y in colpcs[ss]:
                x = x + y
            if (len(colpcs[ss]) == 0):
                s = "1"
            else:
                x = x / len(colpcs[ss])
                s = "%.1f" % (x)
            print(r'\bcbar[label=', ss, r']{', s, r'}')

    endchart("Collective PC Results")

# =========================== main program ===============================================


sheetnames = ["clo-surveys", "CLO-weights",
              "PC-weights", "grades", "discretization"]

argpars = argparse.ArgumentParser()
args = argpars.add_argument("-s", "--semestercourses", "-semestercourses",
                            default="semester-courses.xlsx",
                            help="semester courses file to use")
args = argpars.add_argument("-u", "--course", "-course",
                            default="all",
                            help="semester courses file to use")
argpars.add_argument("-c", "--clo",   "-clo",
                     help="Individual Course Learning Outcomes Assessment from Surveys and Grades Report", action="store_true")
argpars.add_argument("-p", "--pc",   "-pc",
                     help="Individual Performance Criteria Assessment from Grades Report", action="store_true")
argpars.add_argument("-cp", "--cpc",   "-cpc",
                     help="Collective Performance Criteria Assessment from Grades Report", action="store_true")
argpars.add_argument("-cc", "--cclo",   "-cclo",
                     help="Collective Course Learning Outcomes Assessment from Surveys and Grades Report", action="store_true")

args = argpars.add_argument("-f1", "--f1", default="", action="store")
args = argpars.add_argument("-f2", "--f2", default="", action="store")
args = argpars.add_argument("-f3", "--f3", default="", action="store")

args = argpars.parse_args()

semesters = args.f1.split(',')
courseinstrraw = args.f2.split(',')
years = args.f3.split(',')

courseset = set()
courseinstr = {}
for rawinstr in courseinstrraw:
    raw = rawinstr.split('>')
    courseinstr[(raw[0], raw[1])] = raw[2]
    courseset.add(raw[1])

sortedcourses = list(courseset)
sortedcourses.sort()


coloutcomes = [[], [], [], [], [], [], [], [], [], [], [], []]
pcprefix = ["(1,9)", "(2)", "(3)", "(4)", "(5)",
            "(6)", "(7)", "(8)", "(10)", "(11)"]
pccounts = [5, 4, 7, 11, 5, 5, 5, 2, 15, 6]
colpcs = dict()
for i in range(len(pcprefix)):
    for j in range(1, pccounts[i]+1):
        s = pcprefix[i] + "." + str(j)
        colpcs[s] = []

optioncount = args.clo + args.pc + args.cpc + args.cclo

if (optioncount > 1):
    print("Only one of the options must be chosen.")
elif args.clo:
    beginlatex()
    titlelatex(
        "Individual Course Learning Outcomes Assessment from Surveys and Grades Report")
    for co in sortedcourses:
        clocourse(co, semesters)
    endlatex()
elif args.pc:
    beginlatex()
    titlelatex("Individual Performance Criteria Assessment from Grades Report")
    for co in sortedcourses:
        pccourse(co, semesters)
    endlatex()
elif args.cpc:
    beginlatex()
    titlelatex("Collective Performance Criteria Assessment from Grades Report")
    begcclotable("Year " + years[0], "Year " + years[1])
    print(r'\multicolumn{2}{|c|}{} \\')
    print(r'\multicolumn{2}{|c|}{')
    for co in sortedcourses:
        colpccourse(co, semesters[0:2])
    cpcchart(colpcs)
    for co in sortedcourses:
        colpccourse(co, semesters[2:4])
    cpcchart(colpcs)
    print(r'} \\ \hline')
    endtable()
    endlatex()
elif args.cclo:
    beginlatex()
    titlelatex(
        "Collective Course Learning Outcomes Assessment from Surveys and Grades Report")
    begcclotable("Year " + years[0], "Year " + years[1])
    print(r'\multicolumn{2}{|c|}{} \\')
    print(r'\multicolumn{2}{|c|}{')
    for co in sortedcourses:
        print(">>>>>>>>>>>>>>>>>>>>  " + co)
        colclocourse(co, semesters[0:2])
    cclochart(coloutcomes)
    for co in sortedcourses:
        colclocourse(co, semesters[2:4])
    cclochart(coloutcomes)
    print(r'} \\ \hline')
    endtable()
    endlatex()

else:
    print("Error: You should choose one of --clo or --pc or --cclo or --cpc or --out options.", file=sys.stderr)


