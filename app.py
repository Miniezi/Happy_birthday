# app.py
from flask import Flask, request, jsonify
import openai

app = Flask(__name__)
openai.api_key = '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'

@app.route('/get_response', methods=['POST'])
def get_response():
    data = request.get_json()
    user_message = data['message']
    language = data.get('language', 'en')  # По умолчанию - английский, если язык не указан

    # Вызов GPT-3 API для получения ответа
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=user_message,
        max_tokens=100,
        language=language  # Передача параметра языка в GPT-3
    )

    return jsonify({'response': response['choices'][0]['text']})

if __name__ == '__main__':
    app.run(debug=True)
