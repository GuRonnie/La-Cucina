
const ACCESS_CODE = "Kitchen#Secret!2026";
let isManager = false;
let pendingTaskId = null;

// Staff Data
const staffMembers = [
    { id: 1, name: "Marco (Chef)" },
    { id: 2, name: "Sofia (Sous)" },
    { id: 3, name: "Luca (Bar)" },
    { id: 4, name: "Elena (Waiter)" }
];

// Global Task List
let tasks = [
    { id: 1, title: "Prep Tomato Sauce", assignee: "Marco (Chef)", category: "Kitchen", priority: "high", status: "todo", workerComment: "" }
];

// 1. AUTHENTICATION LOGIC
function handleManagerAuth() {
    if (isManager) {
        // Logging out of Manager View
        isManager = false;
        document.body.className = "staff-only";
        document.getElementById("managerControls").style.display = "none";
        document.getElementById("managerToggleBtn").innerText = "👨‍🍳 Enter Manager View";
        renderBoard(); // Hide comments
        showToast("Switched to Staff View");
    } else {
        document.getElementById("authModal").style.display = "flex";
    }
}

function verifyCode() {
    const input = document.getElementById("managerCodeInput").value;
    if (input === ACCESS_CODE) {
        isManager = true;
        document.body.className = "manager-active";
        document.getElementById("managerControls").style.display = "block";
        document.getElementById("managerToggleBtn").innerText = "🚪 Exit Manager View";
        closeAuthModal();
        renderBoard(); // Show comments
        showToast("Manager Access Granted");
    } else {
        showToast("❌ Invalid Code");
        document.getElementById("managerCodeInput").value = "";
    }
}

function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
}

// 2. TASK CREATION (Manager)
function assignTask() {
    const title = document.getElementById("taskTitle").value;
    const staffId = document.getElementById("taskAssignee").value;

    if (!title) return showToast("Please enter a title");

    const newTask = {
        id: Date.now(),
        title: title,
        assignee: staffMembers.find(s => s.id == staffId).name,
        category: document.getElementById("taskCategory").value,
        priority: document.getElementById("taskPriority").value,
        status: "todo",
        workerComment: ""
    };

    tasks.push(newTask);
    document.getElementById("taskTitle").value = "";
    renderBoard();
    showToast("Task assigned to team!");
}

// 3. WORKER FLOW (Complete with Comment)
function openCompletionModal(id) {
    pendingTaskId = id;
    document.getElementById("commentModal").style.display = "flex";
}

function submitCompletion() {
    const task = tasks.find(t => t.id === pendingTaskId);
    const comment = document.getElementById("workerCommentInput").value;
    
    if (task) {
        task.status = "done";
        task.workerComment = comment; // Save comment for manager
    }

    document.getElementById("commentModal").style.display = "none";
    document.getElementById("workerCommentInput").value = "";
    renderBoard();
    showToast("Successfully completed!");
}

function updateStatus(id, newStatus) {
    const task = tasks.find(t => t.id === id);
    if (task) task.status = newStatus;
    renderBoard();
}

// 4. RENDERING
function renderBoard() {
    const cols = { todo: '', progress: '', done: '' };

    tasks.forEach(t => {
        let actionBtn = '';
        if (t.status === 'todo') {
            actionBtn = `<button class="btn-check" onclick="updateStatus(${t.id}, 'progress')">Start Task</button>`;
        } else if (t.status === 'progress') {
            actionBtn = `<button class="btn-check" onclick="openCompletionModal(${t.id})">✔ Mark Done</button>`;
        }

        // Only show comments to the Manager
        let commentSection = (isManager && t.workerComment) 
            ? `<div class="comment-box">📝 <b>Note:</b> ${t.workerComment}</div>` 
            : '';

        const html = `
            <div class="task-card" data-p="${t.priority}">
                <strong>${t.title}</strong><br>
                <small>${t.assignee} | ${t.category}</small>
                ${commentSection}
                ${actionBtn}
            </div>
        `;
        cols[t.status] += html;
    });

    document.getElementById('col-todo').innerHTML = cols.todo || '<p style="color:#aaa; text-align:center; font-size:12px;">No tasks</p>';
    document.getElementById('col-progress').innerHTML = cols.progress || '<p style="color:#aaa; text-align:center; font-size:12px;">Waiting...</p>';
    document.getElementById('col-done').innerHTML = cols.done || '<p style="color:#aaa; text-align:center; font-size:12px;">Clean slate!</p>';
}

function init() {
    document.getElementById("headerDate").innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById("taskAssignee").innerHTML = staffMembers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    renderBoard();
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

init();
