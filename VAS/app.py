#!/usr/bin/env python
from flask import Flask, json, render_template, request
import json as j1
app = Flask(__name__)

import csv
import re
import random
import string
import time
word = ""
maskedWord = ""
maskedWordIndex = 0
currentWords = []
maskedWords = []
usedLetters = []
excludedIndexesA = []
excludedIndexesB = []
counter = 0
agentResponse = ""

class Host:
    def getRandomWord(self):
        global word
        global maskedWord
        with open('rjecnik.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                currentRow = ', '.join(row)
                currentWords.append(currentRow)
                maskedWords.append(re.sub('[a-zA-Z0-9čćšđž\.]', '_', currentRow))
            word = random.choice(currentWords)
            maskedWordIndex = currentWords.index(word)
            maskedWord = maskedWords[maskedWordIndex]
            print(word)
            return json.dumps(word)

    def checkWord(self, w):
        global word
        global maskedWord
        if (len(w) > 3):
            return json.dumps(w)
        if len(usedLetters) > 0:
            for usedLetter in usedLetters:
                if usedLetter == w and w in usedLetters:
                    print("Slovo je već bilo odabrano!!")
                    return "-1"
        else:
            usedLetters.append(w)
        usedLetters.append(w)
        w = w.replace('"','')
        for i, letter in enumerate(word):
            if letter != "_" and w.lower() == letter.lower():
                return json.dumps(w)
        return "-1"

class Competitor:
    def giveWord(self, agent):
        agentResponse = self.checkAgentDictionary(maskedWord, agent)
        return agentResponse

    def checkAgentDictionary(self, maskedWord, agent):
        listOfChars = []
        listOfPossibleWords = []
        for character in maskedWord:
            if character != ' ' or character != '_':
                listOfChars.append(character)
        with open('rjecnik_agenta_'+agent+'.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                currentRow = ', '.join(row)
                for character in currentRow:
                    if character in listOfChars and currentRow not in listOfPossibleWords:
                        listOfPossibleWords.append(currentRow)
            for word in listOfPossibleWords:
                if (len(maskedWord) != len(word)):
                    listOfPossibleWords = [ elem for elem in listOfPossibleWords if elem != word]
            if (len(listOfPossibleWords) == 0):
                return json.dumps(random.choice(string.ascii_letters))
            else:
                if (len(listOfPossibleWords) == 1):
                    chosenWord = listOfPossibleWords[0]
                    return json.dumps(chosenWord)
                else:
                    chosenWord = listOfPossibleWords[0]
                    if(agent == 'a'):
                        if(len(excludedIndexesA) == len(chosenWord)):
                            return json.dumps(chosenWord)
                        chosenIndex = random.choice([number for number in range(0, len(chosenWord)) if number not in excludedIndexesA])
                        excludedIndexesA.append(chosenIndex)
                        return json.dumps(chosenWord[chosenIndex])
                    if (agent == 'b'):
                        if(len(excludedIndexesB) == len(chosenWord)):
                            return chosenWord
                        chosenIndex = random.choice([number for number in range(0, len(chosenWord)) if number not in excludedIndexesB])
                        excludedIndexesB.append(chosenIndex)
                        return json.dumps(chosenWord[chosenIndex])


Boris = Host()
Agent1 = Competitor()
Agent2 = Competitor()

@app.route('/getRandomWord', methods=['GET'])
def generateRandomWord():
    return Boris.getRandomWord()

@app.route('/giveWord', methods=['POST'])
def giveWord():
    agentTurn = request.form["agent"]
    if (json.loads(agentTurn) == "a"):
        return Agent1.giveWord('a')
    else:
        return Agent2.giveWord('b')

@app.route('/checkWord', methods=['POST'])
def checkWord():
    letter = request.form["letter"]
    return Boris.checkWord(json.loads(letter))

@app.route('/')
def main():
    return render_template('index.html')

if __name__=="__main__":
    app.run(debug=True)