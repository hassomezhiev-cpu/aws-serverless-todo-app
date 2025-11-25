const API_URL = 'https://pworkfe4r3.execute-api.eu-north-1.amazonaws.com/prod';

let todos = [];

window.addEventListener('load', () => {
    loadTodos();
});

async function loadTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '<div class="loading">Laddar uppgifter...</div>';
    
    try {
        const response = await fetch(`${API_URL}/todos`);
        const data = await response.json();
        todos = data;
        renderTodos();
    } catch (error) {
        showError('Kunde inte ladda uppgifter');
    }
}

async function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('Skriv något!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        const newTodo = await response.json();
        todos.push(newTodo);
        input.value = '';
        renderTodos();
    } catch (error) {
        showError('Kunde inte skapa uppgift');
    }
}

async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !todo.completed })
        });
        
        const updatedTodo = await response.json();
        const index = todos.findIndex(t => t.id === id);
        todos[index] = updatedTodo;
        renderTodos();
    } catch (error) {
        showError('Kunde inte uppdatera uppgift');
    }
}

async function deleteTodo(id) {
    try {
        await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    } catch (error) {
        showError('Kunde inte radera uppgift');
    }
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="loading">Inga uppgifter ännu. Lägg till din första!</div>';
        updateStats();
        return;
    }
    
    todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo('${todo.id}')"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Radera</button>
        </div>
    `).join('');
    
    updateStats();
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    
    document.getElementById('totalTodos').textContent = `${total} uppgifter`;
    document.getElementById('completedTodos').textContent = `${completed} klara`;
}

function showError(message) {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = `<div class="error">${message}</div>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
