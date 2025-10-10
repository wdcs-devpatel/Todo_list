document.addEventListener('DOMContentLoaded', loadTasks);
const STORAGE_KEY = 'todoListTasks';
let taskToEdit = null;

const input = document.getElementById('taskInput');
const action = document.getElementById('Action');
const taskList = document.getElementById('taskList');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');

action.addEventListener('click', handleTaskAction);
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleTaskAction();
});

function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(Item => {
        tasks.push({
            text: Item.querySelector('.task-text').textContent,
            completed: Item.classList.contains('completed')
        });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updateProgress();
}
function handleTaskAction() {
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
        const newTask = createTaskElement({ text: taskText, completed: false });
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
        if   (taskToEdit && taskToEdit.Item) {
            taskToEdit.Item.classList.remove('editing');
        }
        taskToEdit = { Item, taskSpan };
        Item.classList.add('editing');
        input.value = taskSpan.textContent;
        input.focus();
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

function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        JSON.parse(storedTasks).forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }
    updateProgress();
}

function updateProgress() {
    const allTasks = taskList.querySelectorAll('li').length;
    const completedTasks = taskList.querySelectorAll('li.completed').length;
  
    let percentage = 0;
    if (allTasks > 0) {
        percentage = Math.round((completedTasks / allTasks) * 100);
    }
    progressBar.style.width = percentage + '%';
    progressText.textContent = `${completedTasks} out of ${allTasks} (${percentage}%) Completed`;
}