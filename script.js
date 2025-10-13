const KEY = 'todo_tasks';
let taskToEdit = null;
let input, action, taskList, progressText, progressBar, chart;

document.addEventListener('DOMContentLoaded', init);

function init() {
    input = document.getElementById('taskInput');
    action = document.getElementById('Action');
    taskList = document.getElementById('taskList');
    progressText = document.getElementById('progressText');
    progressBar = document.getElementById('progressBar');

    action.addEventListener('click', handleAction);

    setupChart();
    loadTasks();
}

function handleAction() {
    const taskText = input.value.trim();
    if (taskText === '') {
        alert("Task cannot be empty!");
        return;
    }

    if (taskToEdit) {
        taskToEdit.taskSpan.textContent = taskText;
        taskToEdit.Item.classList.remove('editing');
        taskToEdit = null;
        action.textContent = 'Add Task';
    } else {
        const newTask = createTaskElement({ text: taskText, complete: false });
        taskList.appendChild(newTask);
    }

    input.value = '';
    saveTasks();    
}

function createTaskElement({ text, completed }) {
    const Item = document.createElement('li');
    if (completed) Item.classList.add('completed');

    const taskSpan = document.createElement('span');
    taskSpan.className = 'task-text';
    taskSpan.textContent = text;
    taskSpan.onclick = () => {
        Item.classList.toggle('completed');
        saveTasks();
    };

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => {
        if (taskToEdit && taskToEdit.Item) {
            taskToEdit.Item.classList.remove('editing');
        }
        taskToEdit = { Item, taskSpan };
        Item.classList.add('editing');
        input.value = taskSpan.textContent;
        action.textContent = 'Save Edit';
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            Item.remove();
            saveTasks();
        }
    };

    actionsDiv.append(editBtn, deleteBtn);
    Item.append(taskSpan, actionsDiv);
    return Item;
}

function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(Item => {
        tasks.push({
            text: Item.querySelector('.task-text').textContent,
            completed: Item.classList.contains('completed')
        });
    });
    localStorage.setItem(KEY, JSON.stringify(tasks));
    updateProgress();
}

function loadTasks() {
    const storedTasks = localStorage.getItem(KEY);
    if (storedTasks) {
        JSON.parse(storedTasks).forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }
    updateProgress();
}

function updateProgress() {
    const total = taskList.querySelectorAll('li').length;
    const completed = taskList.querySelectorAll('li.completed').length;

    let percentage = 0;
    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }

    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }

    if (progressText) {
        progressText.textContent = `${completed} out of ${total} (${percentage}%) Completed`;
    }

    if (chart) {
        updateChart(completed, total - completed);
    }
}

function setupChart() {
    const ctx = document.getElementById('taskChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [0, 1],
                backgroundColor: ['#f5140cff', '#0f0f0fff']
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
