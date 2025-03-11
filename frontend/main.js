const api = 'http://127.0.0.1:8000';
let titleInput = document.getElementById('title');
let descInput = document.getElementById('desc');
let taskTitle = document.getElementById('task-title');
let times = document.getElementById('time');
let data = [];
let selectedTask = {};

document.getElementById('form-add').addEventListener('submit', (e) => {
  e.preventDefault();
  let check = true;
  for (let i = 0; i < data.length; i++) {
    if (titleInput.value == data[i].title) {
      document.getElementById('msg').innerHTML = 'There is already a task with this title.';
      check = false;
    }
  }
  if (titleInput.value == '') {
    document.getElementById('msg').innerHTML = 'Task needs a title';
  } else if ((titleInput.value).length>30) {
    document.getElementById('msg').innerHTML = ((titleInput.value).length-30).toString() + " character(s) too long. Max 30.";
  } else if (titleInput.value.includes("?")) {
    document.getElementById('msg').innerHTML = 'Can not contain "?"';
  } else if (check) {
    let date = new Date();
    let hour = date.getHours();
    let Hour = ' AM';
    if (hour >= 12) {
      hour = hour - 12;
      Hour = ' PM';
    }
    if (hour == 0) {
      hour = 12;
    }
    let time = format(date.getMonth() + 1) + '/' +
      format(date.getDate()) + '/' + format(date.getFullYear()) +
      ' ' + hour.toString() + ':' + format(date.getMinutes()) + Hour;
    addTask(titleInput.value, descInput.value, time);
    hideModal('modal-add');
  }
});

function format(time) {
  if (time < 10) {
    return '0' + time.toString();
  }
  return time.toString();
}

let addTask = (title, description, time) => {
  title = title.trim()
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      const newTask = JSON.parse(xhr.responseText);
      data.push(newTask);
      titleInput.value = '';
      descInput.value = '';
      refreshTasks();
    }
  };
  xhr.open('POST', `${api}/tasks`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description, time }));
};

let tasks = document.getElementById('tasks');
let refreshTasks = () => {
  document.getElementById('msg').innerHTML = '';
  tasks.innerHTML = '';
  data.map((x) => {
    if (x.title) {
    }
    let color = (x.title).slice(-1);
    if (color == '!') {
      color = 'lightcoral';
    } else if (color == '.') {
      color = 'lightyellow';
    } else {
      color = 'lightgreen';
    }
    return (tasks.innerHTML += `
      <div style = "background-color: ${color};" "id="task-${x.title}">
        <div style="font-weight: bold; font-size: 1.4rem;">${x.title}</div>
        <div style="font-size: 1.1rem; padding-left: 20px;">${x.description.split('\n').join('<br>')}</div>
        <div style="display: flex; justify-content: center; align-items: flex-end; gap: 8px;">
          <button onclick="editTask('${x.title}')" data-bs-toggle="modal" data-bs-target="#modal-edit" style="font-size: 1rem;">Edit</button>
          <button onclick="deleteTask('${x.title}')" style="font-size: 1rem;">Delete</button>
          <label style="display: inline-block; font-size: 1.2rem; cursor: text;">${x.time}</label>
        </div>
      </div>
    `);
  });
};

let titleEditInput = document.getElementById('title-edit');
let descEditInput = document.getElementById('desc-edit');
let editTask = (title) => {
  const task = data.find((x) => x.title == title);
  selectedTask = task;
  taskTitle.innerText = task.title;
  times.innerText = task.time;
  titleEditInput.value = task.title;
  descEditInput.value = task.description;
  showModal('modal-edit');
};

document.getElementById('form-edit').addEventListener('submit', (e) => {
  e.preventDefault();
  let check = true;
  let title = titleEditInput.value.trim();
  let description = descEditInput.value
  for (let i = 0; i < data.length; i++) {
    if (title == data[i].title && title != selectedTask.title) {
      check = false;
    }
  }
  if (title != '' && check && (title).length<30 && title.includes("?") == false) {
    const xhr = new XMLHttpRequest();
    let time = selectedTask.time;
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        selectedTask.title = title;
        selectedTask.description = description;
        refreshTasks();
      }
    };
    xhr.open('PUT', `${api}/tasks/${selectedTask.title}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({ title, description, time }));
    hideModal('modal-edit');
  } else {
    console.log('Invalid input. Max 30 char, cannot contain "?", cannot be empty, cannot already exist.');
  }
});

let deleteTask = (title) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      data = data.filter((x) => x.title != title);
      refreshTasks();
    }
  };
  xhr.open('DELETE', `${api}/tasks/${title}`, true);
  xhr.send();
};

let clearTasks = () => {
  for (let i = 0; i < data.length; i++) {
    deleteTask(data[i].title);
  }
};

let getTasks = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = JSON.parse(xhr.responseText) || [];
      refreshTasks();
    }
  };
  xhr.open('GET', `${api}/tasks`, true);
  xhr.send();
};

let showModal = (id) => {
  document.getElementById(id).classList.add('show');
}

let hideModal = (id) => {
  document.getElementById(id).classList.remove('show');
}

(() => {
  getTasks();
})();