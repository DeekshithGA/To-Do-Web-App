const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const themeToggle = document.getElementById('themeToggle');
const suggestionBtn = document.getElementById('suggestionBtn');
const suggestionDropdown = document.getElementById('suggestionDropdown');

const suggestions = [
  "Read for 30 minutes", "Drink a glass of water", "Go for a walk", "Organize desk",
  "Stretch for 5 minutes", "Write a journal entry", "Check emails", "Call a friend",
  "Do breathing exercises", "Review goals", "Meditate 10 minutes", "Plan tomorrow",
  "Clean your room", "Unsubscribe from 5 emails", "Write 3 gratitudes", "Update resume",
  "Learn 5 new words"
];

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let draggedIndex = null;

function getRandomSuggestions(count) {
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function showSuggestionsDropdown() {
  const randomSuggestions = getRandomSuggestions(5);
  suggestionDropdown.innerHTML = '';
  randomSuggestions.forEach(suggestion => {
    const li = document.createElement('li');
    li.textContent = suggestion;
    li.addEventListener('click', () => {
      taskInput.value = suggestion;
      suggestionDropdown.classList.add('hidden');
    });
    suggestionDropdown.appendChild(li);
  });
  suggestionDropdown.classList.toggle('hidden');
}

suggestionBtn.addEventListener('click', showSuggestionsDropdown);

function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';

    span.addEventListener('click', () => toggleComplete(index));
    removeBtn.addEventListener('click', () => removeTask(index));

    li.appendChild(span);
    li.appendChild(removeBtn);
    taskList.appendChild(li);
  });

  updateCounts();
  enableDrag();
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return alert('Please enter a task');
  tasks.push({ text, completed: false });
  taskInput.value = '';
  saveAndRender();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function removeTask(index) {
  const taskItems = document.querySelectorAll('.task-item');
  const li = taskItems[index];
  li.classList.add('fade-out');
  setTimeout(() => {
    tasks.splice(index, 1);
    saveAndRender();
  }, 300);
}

function clearAllTasks() {
  if (confirm('Are you sure you want to clear all tasks?')) {
    tasks = [];
    saveAndRender();
  }
}

function updateCounts() {
  totalCount.textContent = tasks.length;
  completedCount.textContent = tasks.filter(t => t.completed).length;
  pendingCount.textContent = tasks.filter(t => !t.completed).length;
}

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  renderTasks(activeFilter);
}

function enableDrag() {
  const items = document.querySelectorAll('.task-item');
  items.forEach((item, index) => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', () => {
      draggedIndex = index;
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
    item.addEventListener('dragover', e => e.preventDefault());
    item.addEventListener('drop', () => {
      const targetIndex = [...items].indexOf(item);
      const moved = tasks.splice(draggedIndex, 1)[0];
      tasks.splice(targetIndex, 0, moved);
      saveAndRender();
    });
  });
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

clearAllBtn.addEventListener('click', clearAllTasks);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks(btn.dataset.filter);
  });
});

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
});

renderTasks();
