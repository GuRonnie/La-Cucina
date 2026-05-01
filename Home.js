const ACCESS_CODE = "Kitchen#Secret!2026";
let isManager = false;
let pendingTaskId = null;
let currentFilter = "all";

// Staff Data
const staffMembers = [
    { id: 1, name: "Marco (Chef)" },
    { id: 2, name: "Sofia (Sous)" },
    { id: 3, name: "Luca (Bar)" },
    { id: 4, name: "Elena (Waiter)" }
];

// Global Task List
let tasks = [
    { id: 1, title: "Prep Tomato Sauce", assignee: "Marco (Chef)", category: "Kitchen", priority: "high", status: "todo", workerComment: "" },
    { id: 2, title: "Set Table #5", assignee: "Elena (Waiter)", category: "Front of House", priority: "medium", status: "todo", workerComment: "" },
    { id: 3, title: "Stock Bar", assignee: "Luca (Bar)", category: "Bar", priority: "low", status: "progress", workerComment: "" }
];

// ===== 1. AUTHENTICATION LOGIC =====
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
        showToast("✓ Manager Access Granted");
    } else {
        showToast("❌ Invalid Code");
        document.getElementById("managerCodeInput").value = "";
    }
}

function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
    document.getElementById("managerCodeInput").value = "";
}

// ===== 2. PRIORITY SELECTOR =====
function setPriority(priority) {
    // Update button states
    document.querySelectorAll(".priority-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    document.querySelector(`[data-p="${priority}"]`).classList.add("active");
    
    // Store in hidden input
    document.getElementById("taskPriority").value = priority;
}

// ===== 3. TASK CREATION (Manager) =====
function assignTask() {
    const title = document.getElementById("taskTitle").value;
    const staffId = document.getElementById("taskAssignee").value;
    const desc = document.getElementById("taskDesc").value;
    const dueTime = document.getElementById("taskDue").value;

    if (!title) return showToast("Please enter a title");
    if (!staffId) return showToast("Please select a staff member");

    const staff = staffMembers.find(s => s.id == staffId);

    const newTask = {
        id: Date.now(),
        title: title,
        description: desc,
        dueTime: dueTime,
        assignee: staff.name,
        category: document.getElementById("taskCategory").value,
        priority: document.getElementById("taskPriority").value || "low",
        status: "todo",
        workerComment: ""
    };

    tasks.push(newTask);
    
    // Clear form
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskAssignee").value = "";
    document.getElementById("taskDue").value = "";
    document.getElementById("taskCategory").value = "Kitchen";
    setPriority("low");
    
    renderBoard();
    updateStats();
    showToast("✓ Task assigned to team!");
}

// ===== 4. WORKER FLOW (Complete with Comment) =====
function openCompletionModal(id) {
    pendingTaskId = id;
    document.getElementById("commentModal").style.display = "flex";
}

function closeCommentModal() {
    document.getElementById("commentModal").style.display = "none";
    document.getElementById("workerCommentInput").value = "";
}

function submitCompletion() {
    const task = tasks.find(t => t.id === pendingTaskId);
    const comment = document.getElementById("workerCommentInput").value;
    
    if (task) {
        task.status = "done";
        task.workerComment = comment; // Save comment for manager
    }

    closeCommentModal();
    renderBoard();
    updateStats();
    showToast("✓ Successfully completed!");
}

function updateStatus(id, newStatus) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = newStatus;
        renderBoard();
        updateStats();
    }
}

// ===== 5. FILTERING =====
function setFilter(filter, element) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.classList.remove("active");
    });
    element.classList.add("active");
    
    renderBoard();
}

function getFilteredTasks() {
    if (currentFilter === "all") {
        return tasks;
    }
    return tasks.filter(t => t.category === currentFilter);
}

// ===== 6. STATISTICS =====
function updateStats() {
    const filtered = getFilteredTasks();
    const todoCount = filtered.filter(t => t.status === "todo").length;
    const progressCount = filtered.filter(t => t.status === "progress").length;
    const doneCount = filtered.filter(t => t.status === "done").length;

    document.getElementById("statTotal").innerText = filtered.length;
    document.getElementById("statTodo").innerText = todoCount;
    document.getElementById("statProgress").innerText = progressCount;
    document.getElementById("statDone").innerText = doneCount;

    document.getElementById("cnt-todo").innerText = todoCount;
    document.getElementById("cnt-progress").innerText = progressCount;
    document.getElementById("cnt-done").innerText = doneCount;
}

// ===== 7. RENDERING =====
function renderBoard() {
    const cols = { todo: '', progress: '', done: '' };
    const filtered = getFilteredTasks();

    filtered.forEach(t => {
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

        let dueTimeDisplay = t.dueTime ? `<small style="color: var(--gold);">⏰ ${t.dueTime}</small>` : '';

        const html = `
            <div class="task-card" data-p="${t.priority}">
                <strong>${t.title}</strong>
                <small>${t.assignee} | ${t.category}</small>
                ${dueTimeDisplay}
                ${commentSection}
                ${actionBtn}
            </div>
        `;
        cols[t.status] += html;
    });

    document.getElementById('col-todo').innerHTML = cols.todo || '<p style="color:#aaa; text-align:center; font-size:12px; margin:20px 0;">No tasks</p>';
    document.getElementById('col-progress').innerHTML = cols.progress || '<p style="color:#aaa; text-align:center; font-size:12px; margin:20px 0;">Waiting...</p>';
    document.getElementById('col-done').innerHTML = cols.done || '<p style="color:#aaa; text-align:center; font-size:12px; margin:20px 0;">Clean slate!</p>';
}

// ===== 8. STAFF RENDERING =====
function renderStaff() {
    const staffHtml = staffMembers.map(staff => {
        const assignedCount = tasks.filter(t => t.assignee === staff.name && t.status !== 'done').length;
        return `
            <div class="staff-item">
                <div>
                    <div class="staff-name">${staff.name}</div>
                    <div class="staff-status">${assignedCount} task${assignedCount !== 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById("staffList").innerHTML = staffHtml || '<p>No staff</p>';
}

// ===== 9. INITIALIZATION =====
function init() {
    // Set header date
    document.getElementById("headerDate").innerText = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // Populate staff dropdown
    document.getElementById("taskAssignee").innerHTML = 
        '<option value="">— Select staff member —</option>' +
        staffMembers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // Initial render
    renderBoard();
    renderStaff();
    updateStats();
    
    // Close modals on background click
    document.getElementById("authModal").addEventListener("click", function(e) {
        if (e.target === this) closeAuthModal();
    });
    
    document.getElementById("commentModal").addEventListener("click", function(e) {
        if (e.target === this) closeCommentModal();
    });
}

// ===== 10. TOAST NOTIFICATIONS =====
function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

// Start the app
init();
