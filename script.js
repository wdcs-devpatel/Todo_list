const USERS_KEY = 'users';
let currentUser = localStorage.getItem('currentUser');
let input, action, taskList, progressText, progressBar, chart, taskToEdit = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  input = document.getElementById('taskInput');
  action = document.getElementById('Action');
  taskList = document.getElementById('taskList');
  progressText = document.getElementById('progressText');
  progressBar = document.getElementById('progressBar');

  action.addEventListener('click', handleAction);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  setupChart();
  loadTasks();
  updateProgress();
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

function handleAction() {
  const taskText = input.value.trim();
  if (taskText === '') {
    alert("Task cannot be empty!");
    return;
  }

  if (taskToEdit) {
    taskToEdit.querySelector('.task-text').textContent = taskText;
    taskToEdit.classList.remove('editing');
    taskToEdit = null;
    action.textContent = 'Add Task';
  } else {
    const newTask = createTaskElement({ text: taskText, completed: false });
    taskList.appendChild(newTask);
  }

  input.value = '';
  saveTasks();
}

function createTaskElement({ text, completed }) {
  const template = document.getElementById('taskTemplate');
  const Item = template.content.cloneNode(true).querySelector('li');

  const taskSpan = Item.querySelector('.task-text');
  const editBtn = Item.querySelector('.edit-btn');
  const deleteBtn = Item.querySelector('.delete-btn');

  taskSpan.textContent = text;
  if (completed) Item.classList.add('completed');
  editBtn.disabled = completed;

  taskSpan.onclick = () => {
    Item.classList.toggle('completed');
    editBtn.disabled = Item.classList.contains('completed');
    saveTasks();
  };

  editBtn.onclick = () => {
    if (Item.classList.contains('completed')) {
      alert("You cannot edit a completed task!");
      return;
    }
    if (taskToEdit) taskToEdit.classList.remove('editing');
    taskToEdit = Item;
    Item.classList.add('editing');
    input.value = taskSpan.textContent;
    action.textContent = 'Save Edit';
  };

  deleteBtn.onclick = () => {
    if (confirm('Delete this task?')) {
      Item.remove();
      saveTasks();
    }
  };

  return Item;
}

function saveTasks() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  const userData = users[currentUser] || { password: '', tasks: [] };
  const tasks = [];

  taskList.querySelectorAll('li').forEach(Item => {
    tasks.push({
      text: Item.querySelector('.task-text').textContent,
      completed: Item.classList.contains('completed')
    });
  });

  userData.tasks = tasks;
  users[currentUser] = userData;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  updateProgress();
}

function loadTasks() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  const userData = users[currentUser];
  if (userData && userData.tasks) {66
    userData.tasks.forEach(task => {
      taskList.appendChild(createTaskElement(task));
    });
  }
}

function updateProgress() {
  const total = taskList.querySelectorAll('li').length;
  const completed = taskList.querySelectorAll('li.completed').length;

  let percentage = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = percentage + '%';
  progressText.textContent = `${completed} out of ${total} (${percentage}%) Completed`;

  updateChart(completed, total - completed);
}

function setupChart() {
  const ctx = document.getElementById('taskChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: [0, 1],
        backgroundColor: ['#28a745', '#ffc107']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Task Completion Status' }
      }
    }
  });
}

function updateChart(completed, pending) {
  chart.data.datasets[0].data = [completed, pending];
  chart.update();
}
