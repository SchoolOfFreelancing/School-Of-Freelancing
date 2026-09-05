---
title: "How to Create Your First AI Chatbot | School of Freelancing"
author: "Karim (Masum)"
date: 2026-09-05
description: "Step-by-step guide to building an AI chatbot using Claude API: authentication, prompt engineering, and deployment to production."
---

## Overview

This guide shows how to build an AI chatbot using Claude API. You'll authenticate, design prompts, and deploy a working chatbot that answers customer questions intelligently.

## Prerequisites

- Python 3.8+ installed
- Claude API key (get at console.anthropic.com)
- Basic Python programming knowledge

## Step 1: Install Dependencies

```
pip install anthropic flask
```

## Step 2: Create Your Chatbot

Create `chatbot.py` :

```
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

def chat(user_message):
 response = client.messages.create(
 model="claude-sonnet-4-6",
 max_tokens=1024,
 system="You are a helpful customer support assistant for an e-commerce store.",
 messages=[
 {"role": "user", "content": user_message}
 ]
 )
 return response.content[0].text

# How to Create Your First AI Chatbot | School of Freelancing
response = chat("What's your return policy?")
print(response)
```

## Step 3: Build a Web Interface

Create `app.py` :

```
from flask import Flask, request, jsonify
from chatbot import chat

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def handle_chat():
 data = request.json
 message = data.get('message', '')
 response = chat(message)
 return jsonify({'response': response})

if __name__ == '__main__':
 app.run(debug=False, host='0.0.0.0', port=5000)
```

## Step 4: Create Frontend

Create `index.html` :

```
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>AI Chatbot</title>
 <style>
 body { font-family: Arial; max-width: 600px; margin: 50px auto; }
 .chat { border: 1px solid #ccc; padding: 20px; height: 400px; overflow-y: auto; }
 .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
 .user { background: #e3f2fd; }
 .bot { background: #f5f5f5; }
 </style>
</head>
<body>
 <h1>AI Customer Support</h1>
 <div class="chat" id="chat"></div>
 <input type="text" id="message" placeholder="Ask a question...">
 <button onclick="sendMessage()">Send</button>
 <script>
 async function sendMessage() {
 const msg = document.getElementById('message').value;
 document.getElementById('chat').innerHTML += '<div class="message user">' + msg + '</div>';

 const response = await fetch('/chat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ message: msg })
 });
 const data = await response.json();
 document.getElementById('chat').innerHTML += '<div class="message bot">' + data.response + '</div>';
 document.getElementById('message').value = '';
 }
 </script>
</body>
</html>
```

## Step 5: Deploy to Production

```
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Use Docker to containerize and deploy on your Ubuntu server.

## Pro Tips

- **Customize the system prompt** for your specific use case
- **Add conversation history** for multi-turn conversations
- **Implement rate limiting** to control costs
- **Monitor token usage** to optimize expenses

Learn advanced AI integration in our [Claude AI Training](/freelancing-training/claude-training/) program.
