from flask import Flask, render_template, request, jsonify, make_response, session, redirect, url_for
app = Flask(__name__)

import gensim
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

model = gensim.models.KeyedVectors.load_word2vec_format('./GoogleNews-vectors-negative300.bin', binary=True)

# from gensim.models.wrappers import FastText
# model = gensim.models.KeyedVectors.load_word2vec_format("wiki.en.vec", binary=False)

def get_sentence_vector(tokens):
	vec = None
	for t in tokens:
		try:
			if vec is None:
				vec = model[t]
			else:
				vec += model[t]
				vec /= 2
		except:
			pass

	# takes the average over all of the vectors
	return vec

@app.route('/api/similarity_score', methods=["POST"])
def relevancy_score():
    sentences = request.form.getlist('sentences')
    s1, s2 = sentences[0], sentences[1]
    v1, v2 = get_sentence_vector(s1), get_sentence_vector(s2)
    dot = np.dot(v1, v2)
    score = cosine_similarity([v1], [v2])
    return jsonify({"similarity": float(score[0][0]), "dot": float(dot/np.linalg.norm(v1)/np.linalg.norm(v2))})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)