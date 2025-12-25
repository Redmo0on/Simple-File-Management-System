from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_FILE = 'notes.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    conn = get_db_connection()
    notes = conn.execute('SELECT * FROM notes ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(note) for note in notes])

@app.route('/api/notes', methods=['POST'])
def create_note():
    data = request.json
    title = data.get('title')
    content = data.get('content')
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
        
    conn = get_db_connection()
    conn.execute('INSERT INTO notes (title, content) VALUES (?, ?)', (title, content))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Note created successfully'}), 201

@app.route('/api/notes/<int:id>', methods=['PUT'])
def update_note(id):
    data = request.json
    title = data.get('title')
    content = data.get('content')
    
    conn = get_db_connection()
    conn.execute('UPDATE notes SET title = ?, content = ? WHERE id = ?', (title, content, id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Note updated successfully'})

@app.route('/api/notes/<int:id>', methods=['DELETE'])
def delete_note(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM notes WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Note deleted successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
