// ==========================================
// LifeQuest - Enhanced Habit & Todo Tracker
// Complete Feature Implementation
// ==========================================

// ==========================================
// CORE DATA STRUCTURES
// ==========================================

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let playerProfile = JSON.parse(localStorage.getItem("playerProfile")) || {
  name: "LifeQuest Player",
  avatar: "🥷",
  level: 1,
  totalXP: 0,
  specialization: null,
};
let shop = JSON.parse(localStorage.getItem("shop")) || {
  unlocked: ["default"],
  active: "default",
  avatars: ["🥷", "🦸", "🧙", "🧝", "🦊", "🐱", "🐶", "🦄", "🌟", "💎"],
};
let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
let skillTree = JSON.parse(localStorage.getItem("skillTree")) || {
  unlocked: [],
  multipliers: {
    xpBoost: 1,
    rewardBoost: 1,
    streakBoost: 1,
  },
};
let tokens = JSON.parse(localStorage.getItem("tokens")) || 0;
let rewards = JSON.parse(localStorage.getItem("rewards")) || {
  lastClaim: null,
  streakBonus: 0,
};
let season = JSON.parse(localStorage.getItem("season")) || {
  start: new Date().toISOString(),
};

// Habit templates
const habitTemplates = [
  {
    name: "Morning Meditation",
    category: "mindfulness",
    difficulty: "easy",
    goal: 7,
  },
  {
    name: "30 min Exercise",
    category: "fitness",
    difficulty: "medium",
    goal: 5,
  },
  { name: "Read 20 pages", category: "learning", difficulty: "easy", goal: 7 },
  {
    name: "Drink 8 glasses of water",
    category: "health",
    difficulty: "easy",
    goal: 7,
  },
  {
    name: "No social media after 9pm",
    category: "mindfulness",
    difficulty: "medium",
    goal: 6,
  },
  {
    name: "Write in journal",
    category: "mindfulness",
    difficulty: "easy",
    goal: 7,
  },
  {
    name: "Learn new skill",
    category: "learning",
    difficulty: "hard",
    goal: 4,
  },
  {
    name: "Healthy meal prep",
    category: "health",
    difficulty: "medium",
    goal: 5,
  },
  {
    name: "Practice instrument",
    category: "creativity",
    difficulty: "medium",
    goal: 5,
  },
  {
    name: "Savings goal contribution",
    category: "finance",
    difficulty: "medium",
    goal: 4,
  },
];

// Life balance categories
const lifeBalanceCategories = [
  "Health & Fitness",
  "Career & Work",
  "Relationships",
  "Personal Growth",
  "Fun & Recreation",
  "Physical Environment",
  "Finance",
  "Spirituality",
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("todos", JSON.stringify(todos));
  localStorage.setItem("goals", JSON.stringify(goals));
  localStorage.setItem("playerProfile", JSON.stringify(playerProfile));
  localStorage.setItem("shop", JSON.stringify(shop));
  localStorage.setItem("achievements", JSON.stringify(achievements));
  localStorage.setItem("skillTree", JSON.stringify(skillTree));
  localStorage.setItem("tokens", JSON.stringify(tokens));
  localStorage.setItem("rewards", JSON.stringify(rewards));
  localStorage.setItem("season", JSON.stringify(season));
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getToday() {
  return formatDate(new Date());
}

function showNotification(message, type = "success") {
  const container = document.getElementById("notificationContainer");
  const notification = document.createElement("div");

  const bgColor =
    type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#f59e0b";
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "⚠️";

  notification.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    cursor: pointer;
  `;

  notification.innerHTML = `${icon} ${message}`;
  notification.onclick = () => notification.remove();

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==========================================
// UI MANAGEMENT
// ==========================================

function showTab(tabName) {
  // Hide all tabs
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.add("hidden"));

  // Show selected tab
  document.getElementById(tabName).classList.remove("hidden");

  // Update tab button states
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Render content based on tab
  switch (tabName) {
    case "dashboard":
      renderDashboard();
      break;
    case "habits":
      renderHabits();
      renderHabitTemplates();
      break;
    case "todo":
      renderTodos();
      break;
    case "goals":
      renderGoals();
      break;
    case "analytics":
      renderAnalytics();
      break;
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// ==========================================
// CHARACTER & LEVELING SYSTEM
// ==========================================

function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function updatePlayerStats() {
  // Calculate total XP from all habits
  const totalXP = habits.reduce((sum, h) => sum + (h.xp || 0), 0);
  playerProfile.totalXP = totalXP;
  playerProfile.level = calculateLevel(totalXP);

  // Update UI
  document.getElementById("playerLevel").textContent = playerProfile.level;
  document.getElementById("totalXP").textContent = totalXP;
  document.getElementById("tokensCount").textContent = tokens;

  // Calculate best streak
  let bestStreak = 0;
  habits.forEach((h) => {
    const streak = calculateStreak(h.history);
    if (streak > bestStreak) bestStreak = streak;
  });
  document.getElementById("currentStreak").textContent = bestStreak;

  // Calculate today's completions
  const today = getToday();
  const completedToday = habits.filter((h) => h.history.includes(today)).length;
  document.getElementById("habitsCompleted").textContent = completedToday;

  save();
}

function openAvatarModal() {
  const grid = document.getElementById("avatarGrid");
  grid.innerHTML = "";

  shop.avatars.forEach((avatar) => {
    const div = document.createElement("div");
    div.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      cursor: pointer;
      transition: transform 0.3s ease;
    `;
    div.textContent = avatar;
    div.onclick = () => selectAvatar(avatar);
    div.onmouseover = () => (div.style.transform = "scale(1.1)");
    div.onmouseout = () => (div.style.transform = "scale(1)");
    grid.appendChild(div);
  });

  openModal("avatarModal");
}

function selectAvatar(avatar) {
  playerProfile.avatar = avatar;
  document.querySelector(".avatar").textContent = avatar;
  save();
  closeModal("avatarModal");
  showNotification(`Avatar changed to ${avatar}`);
}

// ==========================================
// HABIT SYSTEM
// ==========================================

function addHabit() {
  const name = document.getElementById("habitName").value.trim();
  const category = document.getElementById("habitCategory").value;
  const difficulty = document.getElementById("habitDifficulty").value;
  const weeklyGoal =
    parseInt(document.getElementById("habitWeeklyGoal").value) || 7;

  if (!name) {
    showNotification("Please enter a habit name", "error");
    return;
  }

  const times = [];
  const time1 = document.getElementById("habitTime1").value;
  const time2 = document.getElementById("habitTime2").value;
  const time3 = document.getElementById("habitTime3").value;

  if (time1) times.push(time1);
  if (time2) times.push(time2);
  if (time3) times.push(time3);

  const habit = {
    id: Date.now(),
    name,
    category,
    difficulty,
    weeklyGoal,
    reminderTimes: times,
    xp: 0,
    history: [],
    failures: 0,
    paused: false,
    pauseStart: null,
    createdAt: new Date().toISOString(),
  };

  habits.push(habit);
  save();

  // Clear form
  document.getElementById("habitName").value = "";
  document.getElementById("habitCategory").value = "";

  renderHabits();
  updatePlayerStats();
  showNotification(`Habit "${name}" added successfully!`);
}

function editHabit(id) {
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  document.getElementById("editHabitId").value = id;
  document.getElementById("editHabitName").value = habit.name;
  document.getElementById("editHabitCategory").value = habit.category;
  document.getElementById("editHabitDifficulty").value = habit.difficulty;
  document.getElementById("editHabitWeeklyGoal").value = habit.weeklyGoal;

  openModal("editHabitModal");
}

function saveHabitEdit() {
  const id = parseInt(document.getElementById("editHabitId").value);
  const habit = habits.find((h) => h.id === id);

  if (habit) {
    habit.name = document.getElementById("editHabitName").value;
    habit.category = document.getElementById("editHabitCategory").value;
    habit.difficulty = document.getElementById("editHabitDifficulty").value;
    habit.weeklyGoal = parseInt(
      document.getElementById("editHabitWeeklyGoal").value,
    );

    save();
    renderHabits();
    closeModal("editHabitModal");
    showNotification("Habit updated successfully!");
  }
}

function deleteHabit(id) {
  if (
    confirm(
      "Are you sure you want to delete this habit? This action cannot be undone.",
    )
  ) {
    habits = habits.filter((h) => h.id !== id);
    save();
    renderHabits();
    updatePlayerStats();
    showNotification("Habit deleted");
  }
}

function toggleHabitPause(id) {
  const habit = habits.find((h) => h.id === id);
  if (habit) {
    if (habit.paused) {
      habit.paused = false;
      habit.pauseStart = null;
      showNotification("Habit resumed");
    } else {
      habit.paused = true;
      habit.pauseStart = new Date().toISOString();
      showNotification("Habit paused");
    }
    save();
    renderHabits();
  }
}

function toggleHabit(id) {
  const today = getToday();
  const habit = habits.find((h) => h.id === id);

  if (!habit || habit.paused) return;

  if (habit.history.includes(today)) {
    // Already completed today - remove completion
    habit.history = habit.history.filter((d) => d !== today);
    habit.xp -= calculateXPGain(habit.difficulty);
  } else {
    // Mark as completed
    habit.history.push(today);
    habit.xp += calculateXPGain(habit.difficulty);

    // Check for streak bonuses
    const streak = calculateStreak(habit.history);
    if (streak > 0 && streak % 7 === 0) {
      habit.xp += 50;
      showNotification(`🔥 ${streak} day streak! +50 XP bonus!`);
    }

    // Check weekly goal completion
    if (weeklyProgress(habit) >= 100) {
      habit.xp += 100;
      showNotification("🎯 Weekly goal achieved! +100 XP!");
    }

    // Apply skill tree multipliers
    habit.xp += Math.floor(
      calculateXPGain(habit.difficulty) * (skillTree.multipliers.xpBoost - 1),
    );
  }

  save();
  renderHabits();
  updatePlayerStats();
  checkAchievements();
}

function calculateXPGain(difficulty) {
  const baseXP = 10;
  const multiplier =
    difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2;
  return Math.floor(baseXP * multiplier * skillTree.multipliers.xpBoost);
}

function calculateStreak(history) {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const d = formatDate(date);

    if (history.includes(d)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return Math.floor(streak * skillTree.multipliers.streakBoost);
}

function weeklyProgress(habit) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const count = habit.history.filter((d) => new Date(d) >= weekStart).length;
  return Math.min(100, Math.floor((count / habit.weeklyGoal) * 100));
}

function filterHabits() {
  const category = document.getElementById("habitFilterCategory").value;
  const difficulty = document.getElementById("habitFilterDifficulty").value;
  const status = document.getElementById("habitFilterStatus").value;

  let filtered = habits;

  if (category) filtered = filtered.filter((h) => h.category === category);
  if (difficulty)
    filtered = filtered.filter((h) => h.difficulty === difficulty);
  if (status)
    filtered = filtered.filter((h) =>
      status === "active" ? !h.paused : h.paused,
    );

  renderHabitList(filtered);
}

function renderHabitTemplates() {
  const container = document.getElementById("habitTemplates");
  container.innerHTML = "";

  habitTemplates.forEach((template) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.padding = "15px";
    div.style.cursor = "pointer";
    div.innerHTML = `
      <strong>${template.name}</strong><br>
      <small>${template.category} • ${template.difficulty}</small>
    `;
    div.onclick = () => useHabitTemplate(template);
    div.onmouseover = () => (div.style.transform = "translateY(-3px)");
    div.onmouseout = () => (div.style.transform = "translateY(0)");
    container.appendChild(div);
  });
}

function useHabitTemplate(template) {
  document.getElementById("habitName").value = template.name;
  document.getElementById("habitCategory").value = template.category;
  document.getElementById("habitDifficulty").value = template.difficulty;
  document.getElementById("habitWeeklyGoal").value = template.goal;

  showNotification(`Template "${template.name}" loaded!`);
}

function renderHabits() {
  renderHabitList(habits);
  renderHeatmap();
}

function renderHabitList(habitsToRender) {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  const today = getToday();

  habitsToRender.forEach((habit) => {
    const streak = calculateStreak(habit.history);
    const progress = weeklyProgress(habit);
    const isCompleted = habit.history.includes(today);
    const isPaused = habit.paused;

    const div = document.createElement("div");
    div.className =
      "habit" + (isCompleted ? " completed" : "") + (isPaused ? " paused" : "");
    div.draggable = true;

    const difficultyClass = `difficulty-${habit.difficulty}`;
    const categoryEmoji = getCategoryEmoji(habit.category);

    div.innerHTML = `
      <div class="habit-header">
        <span class="habit-title">${categoryEmoji} ${habit.name}</span>
        <span class="${difficultyClass}">${habit.difficulty.charAt(0).toUpperCase() + habit.difficulty.slice(1)}</span>
      </div>
      
      <div class="habit-meta">
        <span>🔥 Streak: ${streak} days</span>
        <span>🎯 Weekly: ${progress}%</span>
        <span>⭐ XP: ${habit.xp}</span>
        ${isPaused ? '<span style="color: #f59e0b;">⏸️ Paused</span>' : ""}
      </div>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      
      ${
        habit.reminderTimes.length > 0
          ? `
        <div class="habit-meta">
          <span>⏰ Reminders: ${habit.reminderTimes.join(", ")}</span>
        </div>
      `
          : ""
      }
      
      <div class="action-buttons">
        <button class="btn ${isCompleted ? "btn-secondary" : "btn-primary"}" 
                onclick="toggleHabit(${habit.id})" 
                ${isPaused ? "disabled" : ""}>
          ${isCompleted ? "✓ Done" : "Mark Today"}
        </button>
        <button class="btn btn-warning btn-icon" onclick="editHabit(${habit.id})">✏️</button>
        <button class="btn ${isPaused ? "btn-primary" : "btn-secondary"} btn-icon" onclick="toggleHabitPause(${habit.id})">
          ${isPaused ? "▶️" : "⏸️"}
        </button>
        <button class="btn btn-danger btn-icon" onclick="deleteHabit(${habit.id})">🗑️</button>
      </div>
    `;

    // Drag and drop events
    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragend", handleDragEnd);

    list.appendChild(div);
  });
}

function getCategoryEmoji(category) {
  const emojis = {
    health: "🏃",
    fitness: "💪",
    learning: "📚",
    mindfulness: "🧘",
    productivity: "💼",
    social: "👥",
    creativity: "🎨",
    finance: "💰",
    other: "📌",
  };
  return emojis[category] || "📌";
}

// ==========================================
// TODO SYSTEM
// ==========================================

function addTodo() {
  const text = document.getElementById("todoInput").value.trim();
  const priority = document.getElementById("todoPriority").value;
  const dueDate = document.getElementById("todoDueDate").value;
  const category = document.getElementById("todoCategory").value;

  if (!text) {
    showNotification("Please enter a task description", "error");
    return;
  }

  const todo = {
    id: Date.now(),
    text,
    priority,
    dueDate,
    category,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(todo);
  save();

  // Clear form
  document.getElementById("todoInput").value = "";

  renderTodos();
  showNotification("Task added successfully!");
}

function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  document.getElementById("editTodoId").value = id;
  document.getElementById("editTodoText").value = todo.text;
  document.getElementById("editTodoPriority").value = todo.priority;
  document.getElementById("editTodoDueDate").value = todo.dueDate || "";
  document.getElementById("editTodoCategory").value = todo.category || "";

  openModal("editTodoModal");
}

function saveTodoEdit() {
  const id = parseInt(document.getElementById("editTodoId").value);
  const todo = todos.find((t) => t.id === id);

  if (todo) {
    todo.text = document.getElementById("editTodoText").value;
    todo.priority = document.getElementById("editTodoPriority").value;
    todo.dueDate = document.getElementById("editTodoDueDate").value || null;
    todo.category = document.getElementById("editTodoCategory").value || null;

    save();
    renderTodos();
    closeModal("editTodoModal");
    showNotification("Task updated successfully!");
  }
}

function deleteTodo(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    todos = todos.filter((t) => t.id !== id);
    save();
    renderTodos();
    showNotification("Task deleted");
  }
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;

    if (todo.completed) {
      // Award XP for completing todo
      const xpGain =
        5 *
        (todo.priority === "high" ? 2 : todo.priority === "medium" ? 1.5 : 1);
      playerProfile.totalXP += Math.floor(xpGain);
      showNotification(`Task completed! +${Math.floor(xpGain)} XP`);
    }

    save();
    renderTodos();
    updatePlayerStats();
  }
}

function filterTodos() {
  const priority = document.getElementById("todoFilterPriority").value;
  const status = document.getElementById("todoFilterStatus").value;

  let filtered = todos;

  if (priority) filtered = filtered.filter((t) => t.priority === priority);
  if (status) {
    if (status === "completed") filtered = filtered.filter((t) => t.completed);
    else if (status === "pending")
      filtered = filtered.filter((t) => !t.completed);
    else if (status === "overdue") {
      const today = getToday();
      filtered = filtered.filter(
        (t) => !t.completed && t.dueDate && t.dueDate < today,
      );
    }
  }

  sortTodos(filtered);
}

function sortTodos(todoList = null) {
  const sortBy = document.getElementById("todoSortBy").value;
  let sorted = todoList || todos;

  if (sortBy === "priority") {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    sorted = sorted.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  } else if (sortBy === "date") {
    sorted = sorted.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortBy === "name") {
    sorted = sorted.sort((a, b) => a.text.localeCompare(b.text));
  }

  renderTodoList(sorted);
}

function renderTodos() {
  sortTodos();
}

function renderTodoList(todosToRender) {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  const today = getToday();

  todosToRender.forEach((todo) => {
    const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < today;
    const priorityClass = `priority-${todo.priority}`;

    const div = document.createElement("div");
    div.className = "todo" + (todo.completed ? " complete" : "");
    div.draggable = true;

    div.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <input type="checkbox" ${todo.completed ? "checked" : ""} 
               onchange="toggleTodo(${todo.id})" 
               style="margin-top: 5px;">
        
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span class="${priorityClass}">${todo.priority.toUpperCase()}</span>
            ${isOverdue ? '<span style="color: #ef4444; font-weight: 600;">⚠️ OVERDUE</span>' : ""}
            ${todo.category ? `<span style="color: #666;">${todo.category}</span>` : ""}
          </div>
          
          <p style="margin: 0 0 8px 0; ${todo.completed ? "text-decoration: line-through; opacity: 0.6;" : ""}">
            ${todo.text}
          </p>
          
          ${
            todo.dueDate
              ? `
            <small style="color: ${isOverdue ? "#ef4444" : "#666"};">
              📅 Due: ${new Date(todo.dueDate).toLocaleDateString()}
            </small>
          `
              : ""
          }
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-warning btn-icon" onclick="editTodo(${todo.id})">✏️</button>
        <button class="btn btn-danger btn-icon" onclick="deleteTodo(${todo.id})">🗑️</button>
      </div>
    `;

    // Drag and drop events
    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragend", handleDragEnd);

    list.appendChild(div);
  });
}

// ==========================================
// GOAL SYSTEM
// ==========================================

function addGoal() {
  const name = document.getElementById("goalName").value.trim();
  const type = document.getElementById("goalType").value;
  const deadline = document.getElementById("goalDeadline").value;
  const target = parseInt(document.getElementById("goalTarget").value);

  if (!name) {
    showNotification("Please enter a goal name", "error");
    return;
  }

  const goal = {
    id: Date.now(),
    name,
    type,
    deadline,
    target,
    progress: 0,
    linkedHabits: [],
    linkedTodos: [],
    completed: false,
    createdAt: new Date().toISOString(),
  };

  goals.push(goal);
  save();

  // Clear form
  document.getElementById("goalName").value = "";
  document.getElementById("goalType").value = "daily";

  renderGoals();
  showNotification("Goal set successfully!");
}

function deleteGoal(id) {
  if (confirm("Are you sure you want to delete this goal?")) {
    goals = goals.filter((g) => g.id !== id);
    save();
    renderGoals();
    showNotification("Goal deleted");
  }
}

function updateGoalProgress(id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  // Calculate progress based on linked habits and todos
  let completed = 0;

  goal.linkedHabits.forEach((habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      const today = getToday();
      if (habit.history.includes(today)) completed++;
    }
  });

  goal.linkedTodos.forEach((todoId) => {
    const todo = todos.find((t) => t.id === todoId);
    if (todo && todo.completed) completed++;
  });

  goal.progress = Math.min(100, Math.floor((completed / goal.target) * 100));
  goal.completed = goal.progress >= 100;

  save();
  renderGoals();
}

function renderGoals() {
  const list = document.getElementById("goalsList");
  list.innerHTML = "";

  const today = getToday();

  goals.forEach((goal) => {
    const isOverdue = !goal.completed && goal.deadline && goal.deadline < today;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">🎯 ${goal.name}</h3>
        <span style="background: ${goal.completed ? "#10b981" : isOverdue ? "#ef4444" : "#6366f1"}; 
                      color: white; padding: 5px 12px; border-radius: 12px; font-size: 0.9em;">
          ${goal.completed ? "✓ Completed" : isOverdue ? "⚠️ Overdue" : "In Progress"}
        </span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <small style="color: #666;">
          ${goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal • 
          Target: ${goal.target} ${goal.type === "daily" ? "tasks/day" : goal.type === "weekly" ? "tasks/week" : "tasks"}
          ${goal.deadline ? `• Deadline: ${new Date(goal.deadline).toLocaleDateString()}` : ""}
        </small>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.progress}%"></div>
        </div>
        <small style="display: block; margin-top: 5px; text-align: center;">${goal.progress}% Complete</small>
      </div>
      
      <div class="action-buttons" style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="linkGoalToItems(${goal.id})">🔗 Link Items</button>
        <button class="btn btn-danger btn-icon" onclick="deleteGoal(${goal.id})">🗑️</button>
      </div>
    `;

    list.appendChild(div);
  });
}

function linkGoalToItems(goalId) {
  // Simplified version - in production, this would show a modal to select items
  const habitIds = habits
    .filter((h) => !goals.some((g) => g.linkedHabits.includes(h.id)))
    .map((h) => h.id)
    .slice(0, 3);
  const todoIds = todos
    .filter((t) => !goals.some((g) => g.linkedTodos.includes(t.id)))
    .map((t) => t.id)
    .slice(0, 3);

  const goal = goals.find((g) => g.id === goalId);
  if (goal) {
    goal.linkedHabits = [...new Set([...goal.linkedHabits, ...habitIds])];
    goal.linkedTodos = [...new Set([...goal.linkedTodos, ...todoIds])];
    save();
    showNotification("Items linked to goal");
    updateGoalProgress(goalId);
  }
}

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

function renderDashboard() {
  renderHeatmap();
  renderWeeklyProgressChart();
  renderBalanceWheel();
  renderTodayOverview();
  renderCategoryChart();
}

function renderTodayOverview() {
  const container = document.getElementById("todayOverview");

  const today = getToday();

  let tasks = habits.filter((h) => !h.history.includes(today));

  container.innerHTML = tasks.map((h) => `<div>• ${h.name}</div>`).join("");
}

function renderTodayOverview() {
  const container = document.getElementById("todayOverview");
  const today = getToday();

  const completedHabits = habits.filter((h) =>
    h.history.includes(today),
  ).length;
  const pendingHabits = habits.filter(
    (h) => !h.paused && !h.history.includes(today),
  ).length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const pendingTodos = todos.filter((t) => !t.completed).length;
  const overdueTodos = todos.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < today,
  ).length;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
      <div style="text-align: center; padding: 15px; background: #10b981; color: white; border-radius: 8px;">
        <div style="font-size: 2em; font-weight: bold;">${completedHabits}</div>
        <div>Habits Done</div>
      </div>
      <div style="text-align: center; padding: 15px; background: #6366f1; color: white; border-radius: 8px;">
        <div style="font-size: 2em; font-weight: bold;">${pendingHabits}</div>
        <div>Habits Pending</div>
      </div>
      <div style="text-align: center; padding: 15px; background: #f59e0b; color: white; border-radius: 8px;">
        <div style="font-size: 2em; font-weight: bold;">${completedTodos}</div>
        <div>Tasks Done</div>
      </div>
      <div style="text-align: center; padding: 15px; background: ${overdueTodos > 0 ? "#ef4444" : "#3b82f6"}; color: white; border-radius: 8px;">
        <div style="font-size: 2em; font-weight: bold;">${pendingTodos}</div>
        <div>Tasks Pending</div>
      </div>
    </div>
  `;
}

function renderWeeklyProgressChart() {
  const ctx = document.getElementById("weeklyProgressChart");
  if (!ctx) return;

  const labels = [];
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));

    const d = formatDate(date);
    const count = habits.filter((h) => h.history.includes(d)).length;
    data.push(count);
  }

  if (window.weeklyChart) window.weeklyChart.destroy();

  window.weeklyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Habits Completed",
          data,
          backgroundColor: "rgba(99, 102, 241, 0.6)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function renderCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const categories = {};
  habits.forEach((h) => {
    categories[h.category] = (categories[h.category] || 0) + 1;
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (window.categoryChart) window.categoryChart.destroy();

  window.categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#6366f1",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
            "#06b6d4",
            "#84cc16",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function renderBalanceWheel() {
  const ctx = document.getElementById("balanceWheel");
  if (!ctx) return;

  // Simulate life balance data (in production, this would be calculated from habits)
  const scores = lifeBalanceCategories.map(
    () => Math.floor(Math.random() * 40) + 60,
  );

  if (window.balanceChart) window.balanceChart.destroy();

  window.balanceChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: lifeBalanceCategories,
      datasets: [
        {
          label: "Life Balance",
          data: scores,
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(99, 102, 241, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

function renderAnalytics() {
  renderWeeklyAnalytics();
  renderMonthlyAnalytics();
  renderHabitPerformance();
  renderBurnoutChart();
  renderWeeklyReport();
  renderAchievements();
  renderShop();
  renderSkillTree();
}

function renderWeeklyAnalytics() {
  const ctx = document.getElementById("weeklyChart");
  if (!ctx) return;

  const labels = [];
  const habitData = [];
  const todoData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));

    const d = formatDate(date);
    habitData.push(habits.filter((h) => h.history.includes(d)).length);
    todoData.push(
      todos.filter((t) => t.completed && new Date(t.createdAt) <= new Date(d))
        .length,
    );
  }

  if (window.analyticsWeeklyChart) window.analyticsWeeklyChart.destroy();

  window.analyticsWeeklyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Habits",
          data: habitData,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
        },
        {
          label: "Todos",
          data: todoData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function renderMonthlyAnalytics() {
  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;

  const months = {};
  habits.forEach((h) => {
    h.history.forEach((d) => {
      const month = d.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
  });

  const labels = Object.keys(months);
  const data = Object.values(months);

  if (window.analyticsMonthlyChart) window.analyticsMonthlyChart.destroy();

  window.analyticsMonthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Monthly Completions",
          data,
          backgroundColor: "rgba(16, 185, 129, 0.6)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function renderHabitPerformance() {
  const ctx = document.getElementById("habitChart");
  const selector = document.getElementById("habitSelector");
  if (!ctx || !selector) return;

  // Populate selector
  selector.innerHTML = "";
  habits.forEach((h) => {
    const option = document.createElement("option");
    option.value = h.id;
    option.textContent = h.name;
    selector.appendChild(option);
  });

  if (habits.length === 0) return;

  const habitId = parseInt(selector.value) || habits[0].id;
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  const today = new Date();
  const data = [];
  const labels = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const d = formatDate(date);
    labels.push(date.getDate());
    data.push(habit.history.includes(d) ? 1 : 0);
  }

  if (window.habitPerformanceChart) window.habitPerformanceChart.destroy();

  window.habitPerformanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `${habit.name} - 30 Day Performance`,
          data,
          backgroundColor: data.map((v) =>
            v > 0 ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.6)",
          ),
          borderColor: data.map((v) =>
            v > 0 ? "rgba(16, 185, 129, 1)" : "rgba(239, 68, 68, 1)",
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

function renderBurnoutChart() {
  const ctx = document.getElementById("burnoutChart");
  if (!ctx) return;

  const labels = [];
  const data = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.getDate());

    // Calculate burnout probability (simplified)
    const risk = Math.floor(Math.random() * 30) + (i < 7 ? 20 : 10);
    data.push(risk);
  }

  if (window.burnoutChart) window.burnoutChart.destroy();

  window.burnoutChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Burnout Risk %",
          data,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

function renderWeeklyReport() {
  const container = document.getElementById("weeklyReport");
  if (!container) return;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekHabits = habits.filter((h) =>
    h.history.some((d) => new Date(d) >= weekStart),
  );
  const weekTodos = todos.filter(
    (t) => t.completed && new Date(t.createdAt) >= weekStart,
  );

  const totalXP = habits.reduce((sum, h) => sum + h.xp, 0);
  const bestStreak = Math.max(...habits.map((h) => calculateStreak(h.history)));

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0;">📊 This Week</h4>
        <p><strong>${weekHabits.length}</strong> habits tracked</p>
        <p><strong>${weekTodos.length}</strong> tasks completed</p>
      </div>
      <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0;">🏆 Performance</h4>
        <p><strong>${totalXP}</strong> total XP</p>
        <p><strong>${bestStreak}</strong> day best streak</p>
      </div>
      <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0;">🎯 Goals</h4>
        <p><strong>${goals.filter((g) => g.completed).length}</strong> goals achieved</p>
        <p><strong>${goals.filter((g) => !g.completed).length}</strong> in progress</p>
      </div>
    </div>
  `;
}

function renderAchievements() {
  const container = document.getElementById("achievements");
  if (!container) return;

  const achievementList = [
    {
      id: "first_habit",
      name: "🌱 First Steps",
      desc: "Create your first habit",
      condition: () => habits.length >= 1,
    },
    {
      id: "week_streak",
      name: "🔥 Week Warrior",
      desc: "Maintain a 7-day streak",
      condition: () => habits.some((h) => calculateStreak(h.history) >= 7),
    },
    {
      id: "xp_100",
      name: "⭐ XP Hunter",
      desc: "Earn 100 XP",
      condition: () => playerProfile.totalXP >= 100,
    },
    {
      id: "xp_1000",
      name: "🌟 XP Master",
      desc: "Earn 1000 XP",
      condition: () => playerProfile.totalXP >= 1000,
    },
    {
      id: "todo_10",
      name: "✅ Task Master",
      desc: "Complete 10 todos",
      condition: () => todos.filter((t) => t.completed).length >= 10,
    },
    {
      id: "goal_1",
      name: "🎯 Goal Setter",
      desc: "Complete your first goal",
      condition: () => goals.some((g) => g.completed),
    },
  ];

  container.innerHTML = "";

  achievementList.forEach((achievement) => {
    const isUnlocked =
      achievements.includes(achievement.id) || achievement.condition();

    if (isUnlocked && !achievements.includes(achievement.id)) {
      achievements.push(achievement.id);
      save();
    }

    const div = document.createElement("div");
    div.style.cssText = `
      padding: 12px;
      margin-bottom: 8px;
      background: ${isUnlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(229, 231, 235, 0.5)"};
      border-left: 4px solid ${isUnlocked ? "#10b981" : "#9ca3af"};
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    div.innerHTML = `
      <span style="font-size: 1.5em;">${isUnlocked ? "🏆" : "🔒"}</span>
      <div>
        <strong>${achievement.name}</strong>
        <small style="display: block; color: #666;">${achievement.desc}</small>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderShop() {
  const container = document.getElementById("shop");
  if (!container) return;

  const shopItems = [
    {
      id: "double_xp",
      name: "⚡ Double XP Boost",
      cost: 500,
      desc: "2x XP for 24 hours",
    },
    {
      id: "streak_freeze",
      name: "❄️ Streak Freeze",
      cost: 200,
      desc: "Protect your streak for 1 day",
    },
    {
      id: "extra_reminder",
      name: "⏰ Extra Reminder",
      cost: 150,
      desc: "Add reminder to a habit",
    },
    {
      id: "theme_neon",
      name: "🌈 Neon Theme",
      cost: 1000,
      desc: "Unlock neon color scheme",
    },
  ];

  container.innerHTML = "";

  shopItems.forEach((item) => {
    const canAfford = playerProfile.totalXP >= item.cost;

    const div = document.createElement("div");
    div.style.cssText = `
      padding: 15px;
      margin-bottom: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small style="display: block; color: #666;">${item.desc}</small>
      </div>
      <button class="btn ${canAfford ? "btn-primary" : "btn-secondary"}" 
              onclick="buyShopItem('${item.id}', ${item.cost})"
              ${!canAfford ? "disabled" : ""}>
        ${item.cost} XP
      </button>
    `;

    container.appendChild(div);
  });
}

function buyShopItem(itemId, cost) {
  if (playerProfile.totalXP < cost) {
    showNotification("Not enough XP!", "error");
    return;
  }

  playerProfile.totalXP -= cost;

  // Apply item effect
  switch (itemId) {
    case "double_xp":
      skillTree.multipliers.xpBoost = 2;
      setTimeout(() => {
        skillTree.multipliers.xpBoost = 1;
      }, 86400000);
      showNotification("Double XP activated for 24 hours!");
      break;
    case "streak_freeze":
      tokens += 1;
      showNotification("Streak freeze token received!");
      break;
    case "extra_reminder":
      showNotification("Extra reminder available! (Feature coming soon)");
      break;
    case "theme_neon":
      document.body.style.setProperty("--primary", "#f472b6");
      document.body.style.setProperty("--secondary", "#a78bfa");
      showNotification("Neon theme activated!");
      break;
  }

  save();
  updatePlayerStats();
  renderShop();
}

function renderSkillTree() {
  const container = document.getElementById("skillTree");
  if (!container) return;

  const skills = [
    {
      id: "streak_master",
      name: "🔥 Streak Master",
      cost: 500,
      desc: "+10% streak bonus",
      unlocked: skillTree.unlocked.includes("streak_master"),
    },
    {
      id: "xp_booster",
      name: "⚡ XP Booster",
      cost: 800,
      desc: "+20% XP gain",
      unlocked: skillTree.unlocked.includes("xp_booster"),
    },
    {
      id: "reward_magnet",
      name: "🧲 Reward Magnet",
      cost: 1000,
      desc: "+30% daily rewards",
      unlocked: skillTree.unlocked.includes("reward_magnet"),
    },
  ];

  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
  container.style.gap = "15px";
  container.innerHTML = "";

  skills.forEach((skill) => {
    const canAfford = playerProfile.totalXP >= skill.cost;

    const div = document.createElement("div");
    div.style.cssText = `
      padding: 20px;
      text-align: center;
      background: ${skill.unlocked ? "rgba(16, 185, 129, 0.1)" : "white"};
      border: 2px solid ${skill.unlocked ? "#10b981" : canAfford ? "#6366f1" : "#9ca3af"};
      border-radius: 12px;
      cursor: ${skill.unlocked ? "default" : canAfford ? "pointer" : "not-allowed"};
      transition: transform 0.3s ease;
    `;

    div.innerHTML = `
      <div style="font-size: 2em; margin-bottom: 10px;">${skill.unlocked ? "✅" : "🔒"}</div>
      <h3 style="margin: 0 0 5px 0;">${skill.name}</h3>
      <small style="display: block; margin-bottom: 10px; color: #666;">${skill.desc}</small>
      <strong style="color: ${skill.unlocked ? "#10b981" : "#6366f1"}">${skill.cost} XP</strong>
    `;

    if (!skill.unlocked && canAfford) {
      div.onclick = () => unlockSkill(skill.id, skill.cost);
      div.onmouseover = () => (div.style.transform = "scale(1.05)");
      div.onmouseout = () => (div.style.transform = "scale(1)");
    }

    container.appendChild(div);
  });
}

function unlockSkill(skillId, cost) {
  if (playerProfile.totalXP < cost) {
    showNotification("Not enough XP!", "error");
    return;
  }

  playerProfile.totalXP -= cost;
  skillTree.unlocked.push(skillId);

  // Apply skill effects
  switch (skillId) {
    case "streak_master":
      skillTree.multipliers.streakBoost = 1.1;
      break;
    case "xp_booster":
      skillTree.multipliers.xpBoost = 1.2;
      break;
    case "reward_magnet":
      skillTree.multipliers.rewardBoost = 1.3;
      break;
  }

  save();
  updatePlayerStats();
  renderSkillTree();
  showNotification("Skill unlocked! 🎉");
}

// ==========================================
// HEATMAP
// ==========================================

function renderHeatmap() {
  const container = document.getElementById("heatmap");
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  const completions = {};

  habits.forEach((h) => {
    h.history.forEach((date) => {
      completions[date] = (completions[date] || 0) + 1;
    });
  });

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const d = formatDate(date);
    const count = completions[d] || 0;

    const div = document.createElement("div");
    div.className = "heat-day";

    if (count >= 1 && count < 2) div.classList.add("level-1");
    if (count >= 2 && count < 3) div.classList.add("level-2");
    if (count >= 3 && count < 4) div.classList.add("level-3");
    if (count >= 4) div.classList.add("level-4");

    div.title = `${d}: ${count} completions`;
    container.appendChild(div);
  }
}

// ==========================================
// DRAG AND DROP
// ==========================================

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDrop(e) {
  e.stopPropagation();

  if (draggedItem !== this) {
    // Swap elements in DOM
    const parent = this.parentNode;
    const allChildren = Array.from(parent.children);
    const draggedIndex = allChildren.indexOf(draggedItem);
    const targetIndex = allChildren.indexOf(this);

    if (draggedIndex < targetIndex) {
      parent.insertBefore(draggedItem, this.nextSibling);
    } else {
      parent.insertBefore(draggedItem, this);
    }

    // Update array order (simplified - in production, implement proper reordering)
    // This is a placeholder for the actual data reordering logic
  }

  return false;
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  draggedItem = null;
}

// ==========================================
// DAILY REWARD
// ==========================================

function claimDailyReward() {
  const today = getToday();

  if (rewards.lastClaim === today) {
    showNotification("Already claimed today!", "error");
    return;
  }

  const baseXP = 20;
  const bestStreak = Math.max(...habits.map((h) => calculateStreak(h.history)));
  const streakBonus = bestStreak * 2;
  const randomBonus = Math.floor(Math.random() * 15);
  const rewardXP = baseXP + streakBonus + randomBonus;

  // Apply reward multiplier
  const finalReward = Math.floor(rewardXP * skillTree.multipliers.rewardBoost);

  playerProfile.totalXP += finalReward;
  rewards.lastClaim = today;

  // Random token chance
  if (Math.random() < 0.2) {
    tokens++;
    showNotification(`🎁 Daily reward: ${finalReward} XP + 🪙 Token!`);
  } else {
    showNotification(`🎁 Daily reward: ${finalReward} XP!`);
  }

  save();
  updatePlayerStats();
}

// ==========================================
// DATA MANAGEMENT
// ==========================================

function openDataManagement() {
  openModal("dataModal");
}

function exportData() {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    habits,
    todos,
    goals,
    playerProfile,
    shop,
    achievements,
    skillTree,
    tokens,
    rewards,
    season,
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `lifequest-backup-${getToday()}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showNotification("Data exported successfully!");
}

function importData() {
  document.getElementById("importFile").click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Validate data structure
      if (data.habits && data.todos && data.playerProfile) {
        // Merge data
        habits = data.habits || [];
        todos = data.todos || [];
        goals = data.goals || [];
        playerProfile = data.playerProfile || playerProfile;
        shop = data.shop || shop;
        achievements = data.achievements || [];
        skillTree = data.skillTree || skillTree;
        tokens = data.tokens || 0;
        rewards = data.rewards || rewards;
        season = data.season || season;

        save();
        updatePlayerStats();
        renderDashboard();

        showNotification("Data imported successfully!");
      } else {
        showNotification("Invalid backup file", "error");
      }
    } catch (error) {
      showNotification("Error reading backup file", "error");
    }
  };

  reader.readAsText(file);
}

function clearAllData() {
  if (
    confirm("Are you sure you want to clear ALL data? This cannot be undone!")
  ) {
    if (
      confirm(
        "This will delete all your habits, todos, goals, and progress. Are you absolutely sure?",
      )
    ) {
      localStorage.clear();
      location.reload();
    }
  }
}

// ==========================================
// REMINDERS & NOTIFICATIONS
// ==========================================

function setupReminders() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }

  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = getToday();

    habits.forEach((habit) => {
      if (habit.paused) return;

      habit.reminderTimes.forEach((time) => {
        if (time === currentTime && !habit.history.includes(today)) {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("🔔 Habit Reminder", {
              body: `Time for: ${habit.name}`,
              icon: "🎮",
              badge: "🎯",
            });
          }
        }
      });
    });
  }, 60000); // Check every minute
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
  // Load dark mode preference
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Set initial avatar
  if (playerProfile.avatar) {
    document.querySelector(".avatar").textContent = playerProfile.avatar;
  }

  // Initialize all components
  updatePlayerStats();
  renderDashboard();
  setupReminders();

  // Generate daily quest
  generateDailyQuest();

  // Check for seasonal reset
  checkSeasonReset();
}

function generateDailyQuest() {
  const today = getToday();
  const quests = JSON.parse(localStorage.getItem("dailyQuest")) || {
    date: null,
    target: 3,
    reward: 50,
    completed: false,
  };

  if (quests.date !== today) {
    quests.date = today;
    quests.target = Math.floor(Math.random() * 3) + 2; // 2-4 habits
    quests.reward = quests.target * 25; // 25 XP per habit
    quests.completed = false;
    localStorage.setItem("dailyQuest", JSON.stringify(quests));
  }
}

function checkSeasonReset() {
  const start = new Date(season.start);
  const now = new Date();
  const diff = (now - start) / (1000 * 60 * 60 * 24);

  if (diff >= 90) {
    // Seasonal reset (90 days)
    skillTree.unlocked = [];
    habits.forEach((h) => {
      h.xp = Math.floor(h.xp * 0.5);
    });
    season.start = now.toISOString();
    save();
    showNotification(
      "🌟 New season started! Some progress has been preserved.",
    );
  }
}

// Start the application
document.addEventListener("DOMContentLoaded", init);

/**Add Habit Search */
function searchHabits() {
  const query = document.getElementById("habitSearch").value.toLowerCase();

  const filtered = habits.filter((h) => h.name.toLowerCase().includes(query));

  renderHabitList(filtered);
}

//**Add Empty State UX */
if (habits.length === 0) {
  list.innerHTML = `
<div class="empty">
🚀 Start your journey
<br>
Create your first habit
</div>
`;
  return;
}
