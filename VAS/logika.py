#!/usr/bin/env python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def main():
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

    def getRandomWord():
        global word
        global maskedWord
        with open('rjecnik.csv', newline='', encoding='utf-8') as csvfile:
            spamreader = csv.reader(csvfile)
            for row in spamreader:
                currentRow = ', '.join(row)
                currentWords.append(currentRow)
                maskedWords.append(re.sub('[a-zA-Z0-9čćšđž\.]', '_', currentRow))
            word = random.choice(currentWords)
            maskedWordIndex = currentWords.index(word)
            maskedWord = maskedWords[maskedWordIndex]
            print("Odabrana rijec1: " +word)

    def checkAgentDictionary(maskedWord):
        listOfChars = []
        listOfPossibleWords = []
        for character in maskedWord:
            if character != ' ' or character != '_':
                listOfChars.append(character)
        with open('rjecnik_agenta_a.csv', newline='', encoding='utf-8') as csvfile:
            spamreader = csv.reader(csvfile)
            for row in spamreader:
                currentRow = ', '.join(row)
                for character in currentRow:
                    if character in listOfChars and currentRow not in listOfPossibleWords:
                        listOfPossibleWords.append(currentRow)
            for word in listOfPossibleWords:
                if (len(maskedWord) != len(word)):
                    listOfPossibleWords = [ elem for elem in listOfPossibleWords if elem != word]
            if (len(listOfPossibleWords) == 0):
                return random.choice(string.ascii_letters)
            else:
                chosenWord = listOfPossibleWords[0]
                return chosenWord
                #kak će on znati da treba uzeti prvo, drugo, treće slovo


    # def findWordInDictionary(maskedWord):
    #     print(word)
    #     print(maskedWord)
    #     checkAgentDictionary(maskedWord)


    def insertWord(word):
        with open('rjecnik_agenta_a.csv', 'a') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(word)

    getRandomWord()

    if __name__ == '__main__':
        while True:
            time.sleep(3)
            w = random.choice(string.ascii_letters.lower())
            for usedLetter in usedLetters:
                if usedLetter == w and usedLetter in usedLetters:
                    print("Slovo je već bilo odabrano!!")
                else:
                    usedLetters.append(w)
            print('Agent odabire slovo: ' + w)
            for i, letter in enumerate(word):
                if letter != "_" and w == letter.lower():
                    maskedWord = maskedWord[:i] + letter + maskedWord[i+1:]
                    print(maskedWord)
                    agentResponse = checkAgentDictionary(maskedWord)
                    print("Agent response: " + agentResponse)
                    if (len(agentResponse) > 1):
                        print("Rješenje: " + agentResponse)
                        if(agentResponse == word):
                            print("POGODILI STE!!!!")
                            exit()
                        else:
                            print("KRIVO!!!!")
                    else:
                        print("Dajem slovo: " + agentResponse)
                if "_" not in maskedWord:
                    break