import requests
from bs4 import BeautifulSoup
from string import ascii_lowercase

not_worked = []

# finds all cuss words
for c in ascii_lowercase:
    r = requests.get("http://www.noswearing.com/dictionary/"+str(c))
    soup = BeautifulSoup(r.text, 'html.parser')

    t = map(lambda x : x.find_all('b'), soup.find_all('td'))
    try:
        word_objs = filter(lambda x: len(x) > 1, t)[0]

        with open('cuss.txt', 'a') as f:
            for w in word_objs:
                word = str(w)[3:-4]
                f.write(word + "\n")
    except:
        not_worked.append(c)

print not_worked