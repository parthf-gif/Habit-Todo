let shop = JSON.parse(localStorage.getItem("shop")) || {
  unlocked: ["default"],
  active: "default",
};
/**(Core Logic)*/
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let todos = JSON.parse(localStorage.getItem("todos")) || [];

function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("todos", JSON.stringify(todos));
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.add("hidden"));
  document.getElementById(tab).classList.remove("hidden");
}

function addHabit() {
  let name = document.getElementById("habitName").value;
  let category = document.getElementById("habitCategory").value;
  let time = document.getElementById("habitTime").value;

  let goal = prompt("Weekly goal? (e.g., 5 days)");
  goal = parseInt(goal) || 7;

  habits.push({
    id: Date.now(),
    name: name,
    category: category,
    time: time,
    goal: goal,
    xp: 0,
    history: [],
  });

  save();
  renderHabits();
}

function toggleHabit(id) {
  let today = new Date().toISOString().split("T")[0];
  let habit = habits.find((h) => h.id === id);

  if (!habit.history.includes(today)) {
    habit.history.push(today);
    habit.xp += 10;

    let streak = calculateStreak(habit.history);
    if (streak > 0 && streak % 7 === 0) {
      habit.xp += 50;
    }

    if (weeklyProgress(habit) >= 100) {
      habit.xp += 100;
    }

    habit.xp += Math.floor(10 * skillTree.multipliers.xpBoost);
  }

  save();
  renderHabits();
  autoAdjustGoal(habit);
  checkAchievements(habit);
  renderForecast(habit);
  checkAchievements(habit);
  function checkQuest() {
    let today = new Date().toISOString().split("T")[0];
    let count = habits.filter((h) => h.history.includes(today)).length;

    if (count >= quests.target && !quests.completed) {
      habits[0].xp += quests.reward;
      quests.completed = true;
      localStorage.setItem("quests", JSON.stringify(quests));
    }
  }
}
function calculateStreak(history) {
  let streak = 0;
  let today = new Date();
  let usedToken = false;

  for (let i = 0; i < 365; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];

    if (history.includes(d)) {
      streak++;
    } else {
      if (
        !usedToken &&
        tokens > 0 &&
        skillTree.unlocked.includes("freeze_unlock")
      ) {
        tokens--;
        usedToken = true;
        localStorage.setItem("tokens", tokens);
        streak++;
      } else {
        break;
      }
    }
  }

  return streak * skillTree.multipliers.streakBoost;
}

function renderHabits() {
  let list = document.getElementById("habitList");
  list.innerHTML = "";

  habits.forEach((h) => {
    let streak = calculateStreak(h.history);

    let div = document.createElement("div");
    div.className = "habit";
    div.innerHTML = `
      <b>${h.name}</b> (${h.category})
      <br>🔥 Streak: ${streak}
      <br><button onclick="toggleHabit(${h.id})">Mark Today</button>
    `;
    list.appendChild(div);
  });

  function weeklyProgress(habit) {
    let now = new Date();
    let weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    let count = 0;

    habit.history.forEach((d) => {
      if (new Date(d) >= weekStart) count++;
    });

    return Math.min(100, Math.floor((count / habit.goal) * 100));
  }

  div.innerHTML = `
<b>${h.name}</b> (${h.category})
<br>🔥 Streak: ${streak}
<br>🎯 Weekly Goal: ${progress}%
${progressBar}
<br>🏆 XP: ${h.xp}
<button onclick="toggleHabit(${h.id})">Mark Today</button>
`;
  let prediction = predictCompletion(h);

  renderCalendar();
  renderChart();
  renderHeatmap();
  renderLeaderboard();
  let recovery = burnoutRecoveryAI(h);
  div.innerHTML += "<br>🧠 Recovery AI:";
  recovery.forEach((r) => {
    div.innerHTML += "<br>• " + r;
  });

  let progress = weeklyProgress(h);

  let progressBar = `
<div style="background:#ddd;height:8px;border-radius:4px;margin-top:5px;">
<div style="width:${progress}%;background:green;height:8px;border-radius:4px;"></div>
</div>`;

  let behavior = behaviorScore(h);
  div.innerHTML += `<br>🧠 Behavior Score: ${behavior}`;

  let neural = neuralAdvanced(h);
  div.innerHTML += `<br>🤖 Neural Score: ${neural}/100`;
}

function renderCalendar() {
  let cal = document.getElementById("calendar");
  cal.innerHTML = "";

  let days = 30;
  for (let i = 0; i < days; i++) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    let d = date.toISOString().split("T")[0];

    let active = habits.some((h) => h.history.includes(d));
    let div = document.createElement("div");
    div.className = "day" + (active ? " active" : "");
    cal.appendChild(div);
  }
}

function addTodo() {
  let text = document.getElementById("todoInput").value;
  if (!text) return;

  todos.push({ id: Date.now(), text, done: false });
  save();
  renderTodos();
}

function toggleTodo(id) {
  let todo = todos.find((t) => t.id === id);
  todo.done = !todo.done;
  save();
  renderTodos();
}

function renderTodos() {
  let list = document.getElementById("todoList");
  list.innerHTML = "";

  todos.forEach((t) => {
    let div = document.createElement("div");
    div.className = "todo" + (t.done ? " complete" : "");
    div.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTodo(${t.id})">
      ${t.text}
    `;
    list.appendChild(div);
  });
}

function renderChart() {
  let ctx = document.getElementById("progressChart").getContext("2d");

  let data = habits.map((h) => h.history.length);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: habits.map((h) => h.name),
      datasets: [
        {
          label: "Completions",
          data: data,
        },
      ],
    },
  });
}

renderHabits();
renderTodos();

/**Notifications */
Notification.requestPermission();

setInterval(() => {
  let now = new Date();
  let time = now.toTimeString().slice(0, 5);

  habits.forEach((h) => {
    if (h.time === time) {
      new Notification("Habit Reminder", {
        body: `Time for ${h.name}`,
      });
    }
  });
}, 60000);

function renderHeatmap() {
  const container = document.getElementById("heatmap");
  container.innerHTML = "";

  let today = new Date();
  let completions = {};

  habits.forEach((h) => {
    h.history.forEach((date) => {
      completions[date] = (completions[date] || 0) + 1;
    });
  });

  for (let i = 364; i >= 0; i--) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];

    let count = completions[d] || 0;

    let div = document.createElement("div");
    div.classList.add("heat-day");

    if (count >= 1 && count < 2) div.classList.add("level-1");
    if (count >= 2 && count < 3) div.classList.add("level-2");
    if (count >= 3 && count < 4) div.classList.add("level-3");
    if (count >= 4) div.classList.add("level-4");

    container.appendChild(div);
  }
}

/**goal progress calculation: */
function weeklyProgress(habit) {
  let now = new Date();
  let weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  let count = 0;

  habit.history.forEach((d) => {
    if (new Date(d) >= weekStart) count++;
  });

  return Math.min(100, Math.floor((count / habit.goal) * 100));
}

/**(Level Structure) */
function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

/**inside Stats tab*/
function renderGlobalStats() {
  let totalXP = habits.reduce((sum, h) => sum + h.xp, 0);
  let totalLevel = getLevel(totalXP);

  console.log("Total XP:", totalXP);
  console.log("Global Level:", totalLevel);
  function renderAI() {
    let suggestions = generateAISuggestions();
    suggestions.forEach((s) => console.log("AI:", s));

    renderAI();
  }
  renderAI();
}
/**Leaderboard Logic */
function renderLeaderboard() {
  const board = document.getElementById("leaderboard");
  board.innerHTML = "";

  let sorted = [...habits].sort((a, b) => b.xp - a.xp);

  sorted.forEach((h, index) => {
    let div = document.createElement("div");
    div.innerHTML = `
      ${index + 1}. ${h.name} 
      — 🏆 ${h.xp} XP 
      — ⭐ Level ${getLevel(h.xp)}
    `;
    board.appendChild(div);
  });
  renderLeaderboard();
}

/**AI Engine */
function generateAISuggestions() {
  let suggestions = [];

  habits.forEach((h) => {
    let streak = calculateStreak(h.history);
    let weekly = weeklyProgress(h);

    if (weekly < 50) {
      suggestions.push(
        `⚠ ${h.name} is below 50% weekly goal. Consider lowering difficulty.`,
      );
    }

    if (streak === 0 && h.history.length > 3) {
      suggestions.push(
        `🔥 You broke your streak in ${h.name}. Try reminder earlier.`,
      );
    }

    if (streak >= 7) {
      suggestions.push(
        `💪 ${h.name} is strong! Consider increasing weekly goal.`,
      );
    }
  });

  return suggestions;
}

/**Weekly Analytics (Last 7 Days Completion Count)*/
function renderWeeklyAnalytics() {
  let ctx = document.getElementById("weeklyChart").getContext("2d");
  let today = new Date();
  let data = [];

  for (let i = 6; i >= 0; i--) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];

    let count = habits.reduce(
      (sum, h) => sum + (h.history.includes(d) ? 1 : 0),
      0,
    );
    data.push(count);
  }

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["6d", "5d", "4d", "3d", "2d", "1d", "Today"],
      datasets: [{ label: "Daily Completions", data }],
    },
  });
}

/**Monthly Analytics */
function renderMonthlyAnalytics() {
  let ctx = document.getElementById("monthlyChart").getContext("2d");
  let months = {};
  habits.forEach((h) => {
    h.history.forEach((d) => {
      let month = d.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(months),
      datasets: [{ label: "Monthly Completions", data: Object.values(months) }],
    },
  });
}

/**Yearly Analysis (Total Per Year) */
function renderYearlyAnalytics() {
  let ctx = document.getElementById("yearlyChart").getContext("2d");
  let years = {};

  habits.forEach((h) => {
    h.history.forEach((d) => {
      let year = d.slice(0, 4);
      years[year] = (years[year] || 0) + 1;
    });
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(years),
      datasets: [{ label: "Yearly Completions", data: Object.values(years) }],
    },
  });
}

/**Habit Performance Graph (Per Habit Detailed View)
Shows 30-day performance curve.*/
function populateHabitSelector() {
  let selector = document.getElementById("habitSelector");
  selector.innerHTML = "";
  habits.forEach((h) => {
    let option = document.createElement("option");
    option.value = h.id;
    option.textContent = h.name;
    selector.appendChild(option);
  });
}
function renderHabitPerformance() {
  let id = parseInt(document.getElementById("habitSelector").value);
  let habit = habits.find((h) => h.id === id);
  if (!habit) return;

  let ctx = document.getElementById("habitChart").getContext("2d");
  let today = new Date();
  let data = [];

  for (let i = 29; i >= 0; i--) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];
    data.push(habit.history.includes(d) ? 1 : 0);
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Array(30).fill(""),
      datasets: [{ label: habit.name + " 30-day", data }],
    },
  });
  populateHabitSelector();
  renderWeeklyAnalytics();
  renderMonthlyAnalytics();
  renderYearlyAnalytics();
  renderBurnoutGraph(habit);
}
function load() {
  populateHabitSelector();
  renderWeeklyAnalytics();
  renderMonthlyAnalytics();
  renderYearlyAnalytics();
}

function autoAdjustGoal(habit) {
  let today = new Date();
  let weeklyData = [];

  for (let w = 0; w < 2; w++) {
    let start = new Date(today);
    start.setDate(today.getDate() - 7 * (w + 1));
    let end = new Date(start);
    end.setDate(start.getDate() + 7);

    let count = habit.history.filter((d) => {
      let date = new Date(d);
      return date >= start && date < end;
    }).length;

    weeklyData.push(count / habit.goal);
  }

  if (weeklyData.every((v) => v >= 0.9)) {
    habit.goal += 1;
  } else if (weeklyData.every((v) => v <= 0.4) && habit.goal > 1) {
    habit.goal -= 1;
  }
}

/**Shop Items */
const shopItems = [
  { name: "Dark Theme", id: "dark", cost: 300 },
  { name: "Neon Theme", id: "neon", cost: 500 },
];

/**Shop Logic */
function renderShop() {
  let container = document.getElementById("shop");
  container.innerHTML = "";

  let totalXP = habits.reduce((sum, h) => sum + h.xp, 0);

  shopItems.forEach((item) => {
    let div = document.createElement("div");

    if (shop.unlocked.includes(item.id)) {
      div.innerHTML = `
        ${item.name} ✅ 
        <button onclick="activateTheme('${item.id}')">Activate</button>
      `;
    } else {
      div.innerHTML = `
        ${item.name} - ${item.cost} XP
        <button onclick="buyTheme('${item.id}', ${item.cost})">Buy</button>
      `;
    }

    container.appendChild(div);
  });
}

/**Buy Theme */
function buyTheme(id, cost) {
  let totalXP = habits.reduce((sum, h) => sum + h.xp, 0);

  if (totalXP >= cost) {
    shop.unlocked.push(id);
    localStorage.setItem("shop", JSON.stringify(shop));
    renderShop();
  } else {
    alert("Not enough XP!");
  }
}

/**Activate Theme */
function activateTheme(id) {
  shop.active = id;
  document.body.className = id;
  localStorage.setItem("shop", JSON.stringify(shop));
}

/**On load */
document.body.className = shop.active;
renderShop();

/**Achievement Badge System(Achievement Engine)*/
let achievements = JSON.parse(localStorage.getItem("achievements")) || [];

function checkAchievements(habit) {
  let streak = calculateStreak(habit.history);

  if (streak >= 7 && !achievements.includes("7day")) {
    achievements.push("7day");
  }

  if (habit.xp >= 100 && !achievements.includes("100xp")) {
    achievements.push("100xp");
  }

  if (habit.xp >= 1000 && !achievements.includes("1000xp")) {
    achievements.push("1000xp");
  }

  localStorage.setItem("achievements", JSON.stringify(achievements));
}

/**Render Function */
function renderAchievements() {
  let container = document.getElementById("achievements");
  container.innerHTML = "";

  achievements.forEach((a) => {
    let div = document.createElement("div");
    div.innerHTML = "🏅 " + a;
    container.appendChild(div);
  });
}

/**Global Reward State */
let rewards = JSON.parse(localStorage.getItem("rewards")) || {
  lastClaim: null,
  streakBonus: 0,
};

/**Daily Reward Function */
function claimDailyReward() {
  let today = new Date().toISOString().split("T")[0];

  if (rewards.lastClaim === today) {
    alert("Already claimed today!");
    return;
  }

  let totalStreak = habits.reduce(
    (max, h) => Math.max(max, calculateStreak(h.history)),
    0,
  );

  let baseXP = 20;
  let streakBonus = totalStreak * 2;
  let randomBonus = Math.floor(Math.random() * 15);

  let rewardXP = baseXP + streakBonus + randomBonus;

  // distribute XP evenly
  habits.forEach((h) => (h.xp += Math.floor(rewardXP / habits.length)));

  rewards.lastClaim = today;
  localStorage.setItem("rewards", JSON.stringify(rewards));
  save();
  alert(`🎁 You earned ${rewardXP} XP!`);

  if (Math.random() < 0.2) {
    tokens += 1;
  }
  localStorage.setItem("tokens", tokens);
}

/**Prediction Function */
function predictCompletion(habit) {
  let last7 = [];
  let today = new Date();

  for (let i = 0; i < 7; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];
    last7.push(habit.history.includes(d) ? 1 : 0);
  }

  let consistency = last7.reduce((a, b) => a + b, 0) / 7;
  let streak = calculateStreak(habit.history);
  let volatility = Math.abs(consistency - 0.5);

  let score =
    consistency * 0.6 + Math.min(streak / 14, 1) * 0.3 + (1 - volatility) * 0.1;

  return Math.floor(score * 100);
}

/**XP Rank Function */
function getRank(totalXP) {
  if (totalXP >= 10000) return "Grand Master";
  if (totalXP >= 7000) return "Master";
  if (totalXP >= 5000) return "Heroine";
  if (totalXP >= 3500) return "Diamond";
  if (totalXP >= 2000) return "Platinum";
  if (totalXP >= 1200) return "Gold";
  if (totalXP >= 600) return "Silver";
  return "Bronze";
}

/**Global Rank Display */
function renderRank() {
  let totalXP = habits.reduce((sum, h) => sum + h.xp, 0);
  let rank = getRank(totalXP);
  console.log("Current Rank:", rank);
}

/**Behavior Score Function */
function behaviorScore(habit) {
  let weekly = weeklyProgress(habit) / 100;

  let streak = Math.min(calculateStreak(habit.history) / 14, 1);

  let last30 = [];
  let today = new Date();

  for (let i = 0; i < 30; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];
    last30.push(habit.history.includes(d) ? 1 : 0);
  }

  let consistency = last30.reduce((a, b) => a + b, 0) / 30;

  let goalAchieve = weekly;

  let trend =
    last30.slice(0, 15).reduce((a, b) => a + b, 0) -
    last30.slice(15, 30).reduce((a, b) => a + b, 0);
  trend = trend > 0 ? 1 : 0.5;

  let score =
    weekly * 0.3 +
    streak * 0.25 +
    consistency * 0.2 +
    goalAchieve * 0.15 +
    trend * 0.1;

  return Math.floor(score * 100);
}

/**Global Skill State */
let skillTree = JSON.parse(localStorage.getItem("skillTree")) || {
  unlocked: [],
  multipliers: {
    xpBoost: 1,
    rewardBoost: 1,
    streakBoost: 1,
  },
};

/**Skill Definitions */
const skills = [
  {
    id: "streak_boost",
    name: "Streak Mastery",
    cost: 500,
    effect: () => (skillTree.multipliers.streakBoost = 1.1),
  },
  {
    id: "reward_boost",
    name: "Reward Amplifier",
    cost: 800,
    effect: () => (skillTree.multipliers.rewardBoost = 1.2),
  },
  {
    id: "xp_boost",
    name: "XP Surge",
    cost: 1200,
    effect: () => (skillTree.multipliers.xpBoost = 1.2),
  },
  { id: "freeze_unlock", name: "Streak Insurance", cost: 1000 },
];

/**Render Logic */
function renderSkillTree() {
  let container = document.getElementById("skillTree");
  container.innerHTML = "";

  let totalXP = habits.reduce((sum, h) => sum + h.xp, 0);

  skills.forEach((skill) => {
    let div = document.createElement("div");

    if (skillTree.unlocked.includes(skill.id)) {
      div.innerHTML = `✅ ${skill.name}`;
    } else {
      div.innerHTML = `
        ${skill.name} - ${skill.cost} XP
        <button onclick="unlockSkill('${skill.id}', ${skill.cost})">Unlock</button>
      `;
    }

    container.appendChild(div);
  });
}

/**Unlock Skill */
function unlockSkill(id, cost) {
  let totalXP = habits.reduce((sum, h) => sum + h.xp, 0);

  if (totalXP < cost) {
    alert("Not enough XP!");
    return;
  }

  skillTree.unlocked.push(id);

  let skill = skills.find((s) => s.id === id);
  if (skill.effect) skill.effect();

  localStorage.setItem("skillTree", JSON.stringify(skillTree));
  renderSkillTree();
}

/**Token State */
let tokens = JSON.parse(localStorage.getItem("tokens")) || 0;

/** UI*/
document.getElementById("tokenCount").textContent = tokens;

function renderQuest() {
  let box = document.getElementById("questBox");

  if (!quests) return;

  box.innerHTML = `
  Complete ${quests.target} habits today
  Reward: ${quests.reward} XP
  ${quests.completed ? "✅ Completed" : ""}
  `;
  renderQuest();
}

/**Skill Structure with Dependencies */
const skill = [
  { id: "streak_boost", name: "Streak Mastery", cost: 500, requires: [] },
  {
    id: "reward_boost",
    name: "Reward Amplifier",
    cost: 800,
    requires: ["streak_boost"],
  },
  { id: "xp_boost", name: "XP Surge", cost: 1200, requires: ["reward_boost"] },
  {
    id: "freeze_unlock",
    name: "Streak Insurance",
    cost: 1000,
    requires: ["streak_boost"],
  },
];

/**Render Connected Tree */
function renderSkillTree() {
  const container = document.getElementById("skillTree");
  container.className = "skill-tree";
  container.innerHTML = "";

  skills.forEach((skill) => {
    let div = document.createElement("div");
    div.className = "skill-node";

    let unlocked = skillTree.unlocked.includes(skill.id);
    let canUnlock = skill.requires.every((r) => skillTree.unlocked.includes(r));

    if (unlocked) div.classList.add("unlocked");
    else div.classList.add("locked");

    div.innerHTML = `
      <h4>${skill.name}</h4>
      <small>${skill.cost} XP</small>
    `;

    if (!unlocked && canUnlock) {
      div.onclick = () => unlockSkill(skill.id, skill.cost);
    }

    container.appendChild(div);
  });
}

/**Marketplace Logic */
function totalXP() {
  return habits.reduce((s, h) => s + h.xp, 0);
}

function deductXP(amount) {
  let remaining = amount;
  habits.forEach((h) => {
    if (remaining > 0) {
      let take = Math.min(h.xp, remaining);
      h.xp -= take;
      remaining -= take;
    }
  });
  save();
}

function buyToken() {
  if (totalXP() >= 300) {
    deductXP(300);
    tokens++;
    localStorage.setItem("tokens", tokens);
  }
}

function sellToken() {
  if (tokens > 0) {
    tokens--;
    habits[0].xp += 150;
    localStorage.setItem("tokens", tokens);
  }
}

/**Seasonal Engine */
let season = JSON.parse(localStorage.getItem("season")) || {
  start: new Date().toISOString(),
};
awardSeasonMedal();
function checkSeasonReset() {
  let start = new Date(season.start);
  let now = new Date();
  let diff = (now - start) / (1000 * 60 * 60 * 24);

  if (diff >= 90) {
    skillTree.unlocked = [];
    habits.forEach((h) => (h.xp = Math.floor(h.xp * 0.5)));
    season.start = now.toISOString();
    localStorage.setItem("season", JSON.stringify(season));
    localStorage.setItem("skillTree", JSON.stringify(skillTree));
  }
  awardSeasonMedal();
}

/**Burnout Detection */
function detectBurnout(habit) {
  let last7 = 0,
    last14 = 0;
  let today = new Date();

  for (let i = 0; i < 14; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];
    if (habit.history.includes(d)) {
      if (i < 7) last7++;
      last14++;
    }
  }

  if (last14 > 7 && last7 < 2) {
    return "⚠ Burnout risk detected";
  }
  return null;
}

/**Quest Generator */
let quests = JSON.parse(localStorage.getItem("quests")) || [];

function generateDailyQuest() {
  let today = new Date().toISOString().split("T")[0];
  if (quests.date === today) return;

  quests = {
    date: today,
    target: 3,
    reward: 50,
    completed: false,
  };
  localStorage.setItem("quests", JSON.stringify(quests));
}

/**Optimization Engine */
function optimizeHabit(habit) {
  let prediction = predictCompletion(habit);

  if (prediction < 40) {
    habit.goal = Math.max(1, habit.goal - 1);
  }

  if (prediction > 85) {
    habit.goal += 1;
  }

  let burnout = detectBurnout(habit);
  if (burnout) {
    habit.goal = Math.max(1, habit.goal - 1);
  }
}

/**Forecast Logic (Time-Series Weighted Model) */
function forecastNext7Days(habit) {
  let history = habit.history;
  let today = new Date();

  let weights = [0.35, 0.25, 0.15, 0.1, 0.07, 0.05, 0.03];
  let score = 0;

  for (let i = 0; i < 7; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    let d = date.toISOString().split("T")[0];
    score += (history.includes(d) ? 1 : 0) * weights[i];
  }

  let baseProbability = score;

  let trendBoost = (behaviorScore(habit) / 100) * 0.2;
  let finalProb = Math.min(1, baseProbability + trendBoost);

  let forecast = [];
  for (let i = 1; i <= 7; i++) {
    forecast.push(Math.floor(finalProb * 100));
  }

  return forecast;
}

/**Render Forecast Graph */
function renderForecast(habit) {
  let ctx = document.getElementById("forecastChart").getContext("2d");
  let data = forecastNext7Days(habit);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7"],
      datasets: [{ label: "Completion Forecast %", data }],
    },
  });
}

/**Specialization State */
let specialization = JSON.parse(localStorage.getItem("spec")) || null;

/**Choose Specialization */
function chooseSpecialization(type) {
  specialization = type;
  localStorage.setItem("spec", type);

  if (type === "Consistent") {
    skillTree.multipliers.streakBoost = 1.3;
  }
  if (type === "Sprinter") {
    skillTree.multipliers.xpBoost = 1.4;
  }
  if (type === "Strategist") {
    skillTree.multipliers.rewardBoost = 1.4;
  }
}

/**Global Score */
function globalScore() {
  let totalXP = habits.reduce((s, h) => s + h.xp, 0);
  let behaviorAvg =
    habits.reduce((s, h) => s + behaviorScore(h), 0) / habits.length;

  return totalXP * 0.7 + behaviorAvg * 10;
}

/**Simulated Global Rank */
function simulateGlobalRank() {
  let score = globalScore();
  let percentile = Math.min(99, Math.floor(score / 100));
  return `Top ${100 - percentile}% Worldwide`;
}

/**Black Market Store */
const blackMarket = [
  { id: "double_xp", cost: 2000 },
  { id: "hyper_goal", cost: 2500 },
];

/**Apply Effects */
function unlockBlackMarket(id) {
  if (totalXP() < 2000) return;

  deductXP(2000);

  if (id === "double_xp") {
    skillTree.multipliers.xpBoost *= 2;
  }

  if (id === "hyper_goal") {
    habits.forEach((h) => (h.goal += 1));
  }
}

/**Classifier */
function classifyUser() {
  let totalXP = totalXP();
  let avgBehavior =
    habits.reduce((s, h) => s + behaviorScore(h), 0) / habits.length;

  if (totalXP > 5000 && avgBehavior > 80) return "🔥 Achiever";
  if (avgBehavior > 70) return "🧘 Steady Builder";
  if (totalXP > 3000) return "⚡ Burst Performer";
  return "🎯 Goal Chaser";
}

/**Neural Score */
function neuralScore(habit) {
  let weekly = weeklyProgress(habit) / 100;
  let streak = Math.min(calculateStreak(habit.history) / 14, 1);
  let variance = 1 - Math.abs(weekly - 0.5);
  let goalRatio = weekly;
  let burnout = detectBurnout(habit) ? 0.3 : 1;
  let trend = behaviorScore(habit) / 100;

  let weights = [0.25, 0.2, 0.15, 0.15, 0.1, 0.15];

  let inputs = [weekly, streak, variance, goalRatio, burnout, trend];

  let score = inputs.reduce((sum, val, i) => sum + val * weights[i], 0);

  return Math.floor(score * 100);
}

/**Burnout Probability Function */
function burnoutProbability(habit, dayOffset = 0) {
  let today = new Date();
  let target = new Date(today);
  target.setDate(today.getDate() - dayOffset);

  let last14 = [];
  for (let i = 0; i < 14; i++) {
    let date = new Date(target);
    date.setDate(target.getDate() - i);
    let d = date.toISOString().split("T")[0];
    last14.push(habit.history.includes(d) ? 1 : 0);
  }

  let recentRate = last14.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  let previousRate = last14.slice(7, 14).reduce((a, b) => a + b, 0) / 7;

  let drop = Math.max(0, previousRate - recentRate);
  let streak = calculateStreak(habit.history);
  let pressure = habit.goal / 7;

  let volatility = Math.abs(recentRate - previousRate);

  let probability =
    drop * 0.4 +
    pressure * 0.2 +
    volatility * 0.2 +
    Math.min(streak / 30, 1) * 0.2;

  return Math.min(100, Math.floor(probability * 100));
}

/**Render Burnout Chart */
function renderBurnoutGraph(habit) {
  let ctx = document.getElementById("burnoutChart").getContext("2d");

  let data = [];
  for (let i = 29; i >= 0; i--) {
    data.push(burnoutProbability(habit, i));
  }

  new Chart(ctx, {
    type: "line",
    data: {
      labels: Array(30).fill(""),
      datasets: [
        {
          label: "Burnout Risk %",
          data: data,
        },
      ],
    },
  });
}

/**Inside Habit Range */
let risk = burnoutProbability(h);
if (risk > 70) {
  div.innerHTML += "<br>⚠ High Burnout Risk!";
}

/**Season Medal Engine */
let medals = JSON.parse(localStorage.getItem("medals")) || [];

function awardSeasonMedal() {
  let score = globalScore();
  let percentile = Math.min(99, Math.floor(score / 100));

  let medal;

  if (percentile >= 95) medal = "🏆 Grand Champion";
  else if (percentile >= 85) medal = "🥇 Gold";
  else if (percentile >= 70) medal = "🥈 Silver";
  else if (percentile >= 50) medal = "🥉 Bronze";
  else medal = "🎖 Participant";

  medals.push({
    seasonStart: season.start,
    medal: medal,
    score: score,
  });

  localStorage.setItem("medals", JSON.stringify(medals));
}

/**Render Medal History */
function renderMedals() {
  let container = document.getElementById("medalHistory");
  container.innerHTML = "";

  medals.forEach((m) => {
    let div = document.createElement("div");
    div.innerHTML = `
      Season: ${new Date(m.seasonStart).toLocaleDateString()}
      — ${m.medal}
      — Score: ${m.score}
    `;
    container.appendChild(div);
  });
}

/**Recovery Engine */
function burnoutRecoveryAI(habit) {
  let risk = burnoutProbability(habit);
  let neural = neuralScore(habit);
  let recommendations = [];

  if (risk > 70) {
    recommendations.push("Reduce weekly goal by 1 for 7 days.");
    recommendations.push("Activate recovery mode: skip 1 day without penalty.");
  }

  if (neural < 50) {
    recommendations.push("Split habit into smaller micro-habits.");
  }

  if (calculateStreak(habit.history) > 14 && risk > 50) {
    recommendations.push("Take planned rest day tomorrow.");
  }

  if (weeklyProgress(habit) < 40) {
    recommendations.push("Adjust reminder time earlier by 30 minutes.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Performance stable. Maintain current intensity.");
  }

  return recommendations;
}

/**Display Recovery Suggestions */
let recovery = burnoutRecoveryAI(h);
div.innerHTML += "<br>🧠 Recovery AI:";
recovery.forEach((r) => {
  div.innerHTML += "<br>• " + r;
});

/**Ladder Function */
function seasonalTier() {
  let score = globalScore();

  if (score >= 9000) return "🔥 Apex";
  if (score >= 7000) return "💎 Elite";
  if (score >= 5000) return "🏆 Champion";
  if (score >= 3500) return "🥇 Gold";
  if (score >= 2000) return "🥈 Silver";
  return "🥉 Bronze";
}

/**Ladder Render */
function renderLadder() {
  let container = document.getElementById("ladder");
  let tier = seasonalTier();
  let score = globalScore();

  container.innerHTML = `
    <h2>${tier}</h2>
    <p>Season Score: ${score}</p>
  `;
}

/**Multi-Layer Model*/
function neuralAdvanced(habit) {
  // INPUT LAYER
  let weekly = weeklyProgress(habit) / 100;
  let streak = Math.min(calculateStreak(habit.history) / 30, 1);
  let consistency = behaviorScore(habit) / 100;
  let pressure = habit.goal / 7;
  let burnout = burnoutProbability(habit) / 100;
  let trend = predictCompletion(habit) / 100;

  // HIDDEN LAYER 1
  let h1 = weekly * 0.4 + streak * 0.3 + consistency * 0.3;
  let h2 = pressure * 0.4 + burnout * 0.6;
  let h3 = trend * 0.7 + weekly * 0.3;

  // ACTIVATION (ReLU-style clamp)
  h1 = Math.max(0, h1);
  h2 = Math.max(0, h2);
  h3 = Math.max(0, h3);

  // OUTPUT LAYER
  let output = h1 * 0.5 + (1 - h2) * 0.3 + h3 * 0.2;

  return Math.floor(output * 100);
}

/**Replace Neural Score Display */
let advancedScore = neuralAdvanced(h);
div.innerHTML += `<br>🤖 Neural Score: ${advancedScore}/100`;

/**near bottom */
setInterval(() => {
  habits.forEach((h) => {
    optimizeHabit(h);
  });

  save();
}, 86400000);
