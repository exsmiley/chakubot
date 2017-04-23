from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sys

def main(num, text):
	"""
	Gets the associated score of the response based on previous answers
	num: question that this corresponds to
	text: the reply to the question that will be investigated
	"""
	all_documents = [text.lower()]
	weights = []

	with open("py/answers.txt") as f:
		for line in f:
			info = line.split("|")
			i, rating, text = (info[0], info[1], info[2])
			if i == num:
				weights.append(float(info[1]))
				all_documents.append(text)

		if len(weights) == 0:
			pass
			# TODO need to make answers to all of the questions

	weights = np.array(weights)
	tfidf_vectorizer = TfidfVectorizer()
	tfidf_matrix = tfidf_vectorizer.fit_transform(all_documents)

	cs = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix)[0][1:]
	cs = cs/sum(cs)
	index = np.argmax(cs)
	# print len(cs), len(all_documents), len(weights)
	# print cs, all_documents[index+1], weights[index]

	print np.vdot(cs, weights)

if __name__ == '__main__':
	num = sys.argv[1]#"0"
	text = sys.argv[2]#"Putin eats cookies while riding horses in the shower"
	main(num, text)